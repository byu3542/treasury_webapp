/**
 * Google Sheets API v4 service layer.
 * All calls use direct fetch() with an OAuth2 Bearer token.
 * Pagination: fetches in chunks of CHUNK_SIZE rows.
 *
 * Expected sheet column order (0-indexed):
 *   0  M-Y         1  Date        2  Description   3  Category
 *   4  Amount      5  Account     6  Account #      7  Institution
 *   8  Month       9  Week        10 Transaction ID  11 Account ID
 *   12 Check Number 13 Full Description 14 Metadata  15 Date Added
 *   16 Reconcile Date 17 Categorized Date
 */

import { getStoredToken } from './auth.js'

const API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const CHUNK_SIZE = 500 // Increased from 200 to reduce total requests by 60%
const RATE_LIMIT_DELAY = 1500 // 1500ms = 40 req/min (safe margin under 60 req/min limit)

/** Column header → field name mapping (matches your sheet headers). */
const HEADER_MAP = {
  'M-Y': 'my',
  'Date': 'date',
  'Description': 'description',
  'Category': 'category',
  'Amount': 'amount',
  'Account': 'account',
  'Account #': 'accountNumber',
  'Institution': 'institution',
  'Month': 'month',
  'Week': 'week',
  'Transaction ID': 'id',
  'Account ID': 'accountId',
  'Check Number': 'checkNumber',
  'Full Description': 'fullDescription',
  'Metadata': 'metadata',
  'Date Added': 'dateAdded',
  'Reconcile Date': 'reconcileDate',
  'Categorized Date': 'categorizedDate',
}

function authHeader() {
  const token = getStoredToken()
  if (!token) throw new Error('Not authenticated. Please sign in.')
  return { Authorization: `Bearer ${token}` }
}

async function sheetsGet(url, attempt = 0, maxRetries = 3) {
  const res = await fetch(url, { headers: authHeader() })

  if (res.status === 401) throw new Error('AUTH_EXPIRED')
  if (res.status === 403) throw new Error('PERMISSION_DENIED')

  // Handle 429 with exponential backoff
  if (res.status === 429) {
    if (attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt) * 2000 // 2s, 4s, 8s
      console.warn(`Rate limited (429), retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, backoffMs))
      return sheetsGet(url, attempt + 1, maxRetries)
    }
    throw new Error('QUOTA_EXCEEDED')
  }

  if (!res.ok) throw new Error(`Sheets API error: ${res.status} ${res.statusText}`)
  return res.json()
}

/**
 * Fetch spreadsheet metadata: title, sheet names/gids.
 */
export async function getSpreadsheetInfo(spreadsheetId) {
  const url = `${API_BASE}/${spreadsheetId}?fields=properties.title,sheets.properties`
  return sheetsGet(url)
}

/**
 * Fetch a range and return raw values array.
 * range example: "Sheet1!A1:R200"
 */
async function fetchRange(spreadsheetId, range) {
  const encoded = encodeURIComponent(range)
  const url = `${API_BASE}/${spreadsheetId}/values/${encoded}?valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`
  const data = await sheetsGet(url)
  // Rate limit delay between requests
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
  return data.values ?? []
}

/**
 * Map a raw row array to a transaction object using detected headers.
 */
function mapRow(row, headers) {
  const obj = {}
  headers.forEach((h, i) => {
    const field = HEADER_MAP[h] ?? h.toLowerCase().replace(/\s+/g, '_')
    obj[field] = row[i] ?? ''
  })

  // Normalize numeric amount
  const raw = String(obj.amount ?? '').replace(/[$,\s]/g, '')
  obj.amount = raw === '' ? 0 : parseFloat(raw) || 0

  // Normalize date to ISO string for IndexedDB indexing
  if (obj.date) {
    const parsed = new Date(obj.date)
    obj.dateISO = isNaN(parsed) ? obj.date : parsed.toISOString()
  }

  // Generate a stable ID if missing
  if (!obj.id || obj.id.trim() === '') {
    obj.id = `${obj.dateISO ?? obj.date}-${obj.description}-${obj.amount}`.replace(/\s+/g, '-')
  }

  return obj
}

/**
 * Fetch ALL rows from a sheet, paginating by CHUNK_SIZE.
 * Calls onProgress(loaded, total) if provided.
 *
 * @param {string} spreadsheetId
 * @param {string} sheetName - tab name, e.g. "Transactions"
 * @param {function} [onProgress]
 * @returns {Promise<object[]>} array of transaction objects
 */
export async function fetchAllTransactions(spreadsheetId, sheetName, onProgress) {
  // First fetch header row + first chunk to determine column count
  const firstRange = `${sheetName}!A1:Z${CHUNK_SIZE + 1}`
  const firstChunk = await fetchRange(spreadsheetId, firstRange)

  if (!firstChunk.length) return []

  const headers = firstChunk[0]
  const transactions = []

  // Process first chunk (rows 2…CHUNK_SIZE+1, indices 1…)
  for (let i = 1; i < firstChunk.length; i++) {
    const row = firstChunk[i]
    if (row.every((c) => c === '')) continue
    transactions.push(mapRow(row, headers))
  }

  onProgress?.(transactions.length, null)

  // Keep fetching until we get a short page (means we hit the end)
  if (firstChunk.length <= CHUNK_SIZE) {
    return transactions
  }

  let offset = CHUNK_SIZE + 2 // next row number (1-based)
  while (true) {
    const range = `${sheetName}!A${offset}:Z${offset + CHUNK_SIZE - 1}`
    const chunk = await fetchRange(spreadsheetId, range)

    if (!chunk.length) break

    for (const row of chunk) {
      if (row.every((c) => c === '')) continue
      transactions.push(mapRow(row, headers))
    }

    onProgress?.(transactions.length, null)

    if (chunk.length < CHUNK_SIZE) break
    offset += CHUNK_SIZE
  }

  return transactions
}

/**
 * Lightweight check: fetch just the last row to detect new data.
 * Returns the row count (including header).
 */
export async function getSheetRowCount(spreadsheetId, sheetName) {
  try {
    const info = await getSpreadsheetInfo(spreadsheetId)
    const sheet = info.sheets?.find(
      (s) => s.properties.title === sheetName
    )
    return sheet?.properties?.gridProperties?.rowCount ?? null
  } catch {
    return null
  }
}

/**
 * CSV export utilities for treasury transactions.
 * Generates and downloads CSV files from transaction data.
 */

/**
 * Format a value for CSV (handle quotes, newlines, etc.)
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Format date for CSV output (YYYY-MM-DD)
 */
function formatDateForCSV(dateStr) {
  if (!dateStr) return ''
  // If already YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  // Try to parse and reformat
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toISOString().split('T')[0]
}

/**
 * Format amount for CSV (plain number, no currency symbol)
 */
function formatAmountForCSV(amount) {
  if (amount === null || amount === undefined) return ''
  return String(Number(amount).toFixed(2))
}

/**
 * Export transactions to CSV file and trigger download
 * @param {Array} transactions - Array of transaction objects to export
 * @param {Object} options - Export options
 * @param {string} options.filename - Filename (default: UTOPIA_Treasury_Export_YYYY-MM-DD.csv)
 * @param {boolean} options.includeMetadata - Include metadata comment row (default: true)
 * @param {string} options.filterSummary - Summary of applied filters for metadata (optional)
 */
export function exportTransactionsToCSV(
  transactions,
  options = {}
) {
  const {
    filename,
    includeMetadata = true,
    filterSummary = '',
  } = options

  // Validate input
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('No transactions to export')
  }

  // Build CSV rows
  const rows = []

  // Optional metadata row as comment
  if (includeMetadata) {
    const now = new Date().toISOString().split('T')[0]
    const filterText = filterSummary ? ` | Filters: ${filterSummary}` : ''
    rows.push(`# Exported from Treasury Dashboard on ${now}${filterText}`)
  }

  // Header row
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Balance', 'Account', 'Status']
  rows.push(headers.map(escapeCSV).join(','))

  // Data rows
  transactions.forEach((tx) => {
    const row = [
      formatDateForCSV(tx.dateISO || tx.date),
      escapeCSV(tx.description || ''),
      escapeCSV(tx.category || ''),
      formatAmountForCSV(tx.amount || 0),
      formatAmountForCSV(tx.balance || 0),
      escapeCSV(tx.account || ''),
      escapeCSV(tx._reconcile?.status || 'unreconciled'),
    ]
    rows.push(row.join(','))
  })

  // Combine rows and create blob
  const csv = rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const finalFilename = filename || `UTOPIA_Treasury_Export_${new Date().toISOString().split('T')[0]}.csv`
  const link = document.createElement('a')
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', finalFilename)
  link.style.visibility = 'hidden'

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Cleanup
  URL.revokeObjectURL(link.href)
}

/**
 * Generate filter summary string for CSV metadata
 * @param {Object} filters - Filter object from useFilters
 * @returns {string} Human-readable filter summary
 */
export function generateFilterSummary(filters) {
  const parts = []

  if (filters.datePreset && filters.datePreset !== 'All Time') {
    parts.push(filters.datePreset)
  } else if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom || '—'
    const to = filters.dateTo || '—'
    parts.push(`${from} to ${to}`)
  }

  if (filters.category) parts.push(`Category: ${filters.category}`)
  if (filters.account) parts.push(`Account: ${filters.account}`)
  if (filters.search) parts.push(`Search: "${filters.search}"`)

  return parts.join(' | ')
}

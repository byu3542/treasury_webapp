/**
 * IndexedDB service using the `idb` library.
 * Schema v1:
 *   - transactions  { keyPath: 'id' }  indexes: date, category, account
 *   - metadata      { keyPath: 'key' } stores sync timestamps, sheet config
 *   - reconciliation { keyPath: 'id' } stores per-transaction reconcile state
 */
import { openDB } from 'idb'

const DB_NAME = 'treasury-db'
const DB_VERSION = 1

let dbPromise = null

export function initDB() {
  if (dbPromise) return dbPromise
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
        txStore.createIndex('date', 'date')
        txStore.createIndex('category', 'category')
        txStore.createIndex('account', 'account')
        txStore.createIndex('month', 'month')
        txStore.createIndex('week', 'week')
      }

      // Metadata store (sync timestamps, config, etc.)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' })
      }

      // Reconciliation state store
      if (!db.objectStoreNames.contains('reconciliation')) {
        db.createObjectStore('reconciliation', { keyPath: 'id' })
      }
    },
  })
  return dbPromise
}

function getDB() {
  if (!dbPromise) {
    // Auto-initialize if not already done
    initDB()
  }
  return dbPromise
}

// ─── Transactions ────────────────────────────────────────────────────────────

/** Bulk-replace all transactions (called on full sync). */
export async function putTransactions(transactions) {
  const db = await getDB()
  const tx = db.transaction('transactions', 'readwrite')
  await Promise.all([
    ...transactions.map((t) => tx.store.put(t)),
    tx.done,
  ])
}

/** Get all transactions (with optional filters applied in JS). */
export async function getAllTransactions() {
  const db = await getDB()
  return db.getAll('transactions')
}

/** Get transactions for a given account. */
export async function getTransactionsByAccount(account) {
  const db = await getDB()
  return db.getAllFromIndex('transactions', 'account', account)
}

/** Get transactions in a date range. */
export async function getTransactionsByDateRange(startDate, endDate) {
  const db = await getDB()
  const range = IDBKeyRange.bound(startDate.toISOString(), endDate.toISOString())
  return db.getAllFromIndex('transactions', 'date', range)
}

/** Count all cached transactions. */
export async function countTransactions() {
  const db = await getDB()
  return db.count('transactions')
}

/** Clear all transactions (e.g., on explicit cache clear). */
export async function clearTransactions() {
  const db = await getDB()
  return db.clear('transactions')
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function getMeta(key) {
  const db = await getDB()
  const row = await db.get('metadata', key)
  return row ? row.value : null
}

export async function setMeta(key, value) {
  const db = await getDB()
  return db.put('metadata', { key, value })
}

export async function clearMeta() {
  const db = await getDB()
  return db.clear('metadata')
}

// ─── Reconciliation ──────────────────────────────────────────────────────────

/** Get reconciliation state for a transaction id. */
export async function getReconcile(id) {
  const db = await getDB()
  return db.get('reconciliation', id)
}

/** Set reconciliation state. status: 'cleared' | 'pending' | null */
export async function setReconcile(id, status, date = null) {
  const db = await getDB()
  return db.put('reconciliation', { id, status, date: date ?? new Date().toISOString() })
}

/** Get all reconciliation states as a Map<id, record>. */
export async function getAllReconciliation() {
  const db = await getDB()
  const all = await db.getAll('reconciliation')
  return new Map(all.map((r) => [r.id, r]))
}

/** Clear all reconciliation data. */
export async function clearReconciliation() {
  const db = await getDB()
  return db.clear('reconciliation')
}

// ─── Full cache clear ─────────────────────────────────────────────────────────

export async function clearAllCaches() {
  await Promise.all([clearTransactions(), clearMeta(), clearReconciliation()])
}

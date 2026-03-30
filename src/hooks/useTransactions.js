import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { fetchAllTransactions } from '../services/sheets.js'
import {
  getAllTransactions,
  putTransactions,
  countTransactions,
  getMeta,
  setMeta,
  getAllReconciliation,
} from '../services/db.js'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Main data hook. Loads transactions from IndexedDB (instant) and syncs
 * from Google Sheets in the background. Merges reconciliation state.
 */
export function useTransactions(config, isAuthed) {
  const queryClient = useQueryClient()
  const syncProgress = useRef(0)

  // ── Load from IndexedDB (fast, always available) ──────────────────────────
  const {
    data: transactions = [],
    isLoading: isLoadingCache,
    error: cacheError,
  } = useQuery({
    queryKey: ['transactions', 'cache'],
    queryFn: async () => {
      const [txs, reconcileMap] = await Promise.all([
        getAllTransactions(),
        getAllReconciliation(),
      ])
      return txs.map((tx) => ({
        ...tx,
        _reconcile: reconcileMap.get(tx.id) ?? null,
      }))
    },
    enabled: true,
    staleTime: Infinity, // Only invalidated by sync
  })

  // ── Sync from Google Sheets ───────────────────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!config?.spreadsheetId || !config?.sheetName) {
        throw new Error('Spreadsheet not configured. Go to Settings.')
      }

      const fetched = await fetchAllTransactions(
        config.spreadsheetId,
        config.sheetName,
        (loaded) => { syncProgress.current = loaded }
      )

      if (fetched.length === 0) {
        throw new Error('No data returned from sheet. Check Sheet ID and tab name.')
      }

      await putTransactions(fetched)
      await setMeta('lastSync', new Date().toISOString())
      await setMeta('rowCount', fetched.length)
      return fetched.length
    },
    onSuccess: () => {
      // Invalidate cache query so it reloads from IndexedDB
      queryClient.invalidateQueries({ queryKey: ['transactions', 'cache'] })
    },
  })

  // ── Auto-sync on mount if authed and cache is stale ───────────────────────
  const autoSync = useCallback(async () => {
    if (!isAuthed || !config?.spreadsheetId) return
    const lastSync = await getMeta('lastSync')
    const count = await countTransactions()

    const isStale =
      count === 0 ||
      !lastSync ||
      Date.now() - new Date(lastSync).getTime() > SYNC_INTERVAL_MS

    if (isStale) {
      syncMutation.mutate()
    }
  }, [isAuthed, config, syncMutation])

  return {
    transactions,
    isLoadingCache,
    cacheError,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    syncCount: syncMutation.data,
    syncProgress: syncProgress.current,
    sync: () => syncMutation.mutate(),
    autoSync,
  }
}

/**
 * Returns computed aggregates from a transaction array:
 * cash position by account, category totals, cash flow summary.
 */
export function useAggregates(transactions) {
  if (!transactions.length) {
    return { byAccount: [], byCategory: [], summary: null }
  }

  // By account
  const accountMap = new Map()
  for (const tx of transactions) {
    const key = tx.account || 'Unknown'
    if (!accountMap.has(key)) {
      accountMap.set(key, { account: key, institution: tx.institution || '', balance: 0, count: 0 })
    }
    const a = accountMap.get(key)
    a.balance += tx.amount
    a.count++
  }
  const byAccount = [...accountMap.values()].sort((a, b) => b.balance - a.balance)

  // By category
  const catMap = new Map()
  for (const tx of transactions) {
    const key = tx.category || 'Uncategorized'
    if (!catMap.has(key)) catMap.set(key, { category: key, total: 0, count: 0 })
    const c = catMap.get(key)
    c.total += tx.amount
    c.count++
  }
  const byCategory = [...catMap.values()].sort((a, b) => a.total - b.total)

  // Summary
  const inflows = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const outflows = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)

  return {
    byAccount,
    byCategory,
    summary: { inflows, outflows, net: inflows + outflows, count: transactions.length },
  }
}

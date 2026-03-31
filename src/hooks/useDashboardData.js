import { useState, useEffect, useCallback, useMemo } from 'react'
import { calculateDashboardKPIs } from '../utils/dashboardAggregations.js'

/**
 * Custom hook for dashboard data fetching, sync status, and KPI calculation
 * Handles real-time syncing with polling
 */
export function useDashboardData(transactions, syncInterval = 5 * 60 * 1000) {
  const [lastSyncTime, setLastSyncTime] = useState(Date.now())
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setError] = useState(null)

  // Calculate all KPIs from transactions
  const kpis = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        netCashPosition: 0,
        netCashPositionTrend: 0,
        totalInflows30d: 0,
        totalInflows30dTrend: 0,
        totalOutflows30d: 0,
        totalOutflows30dTrend: 0,
        activeAccounts: [],
        weeklyFlows: { inflows: {}, outflows: {}, labels: [] },
        outflowDrivers: [],
        institutionalActivity: [],
        riskAlerts: [],
      }
    }

    return calculateDashboardKPIs(transactions)
  }, [transactions])

  // Determine sync status based on age of lastSyncTime
  const syncStatus = useMemo(() => {
    const timeSinceSync = Date.now() - lastSyncTime
    const minutes = Math.floor(timeSinceSync / 1000 / 60)

    if (isSyncing) {
      return {
        status: 'syncing',
        label: 'SYNCING',
        message: 'Fetching latest transactions...',
        isLive: false,
        minutesAgo: 0,
      }
    }

    if (minutes < 5) {
      return {
        status: 'live',
        label: 'LIVE',
        message: 'All data current',
        isLive: true,
        minutesAgo: minutes,
      }
    }

    if (minutes < 10) {
      return {
        status: 'stale',
        label: `${minutes}m ago`,
        message: `Last synced ${minutes} minute${minutes !== 1 ? 's' : ''} ago`,
        isLive: false,
        minutesAgo: minutes,
      }
    }

    return {
      status: 'stale',
      label: `${minutes}m ago`,
      message: `Last synced ${minutes} minute${minutes !== 1 ? 's' : ''} ago`,
      isLive: false,
      minutesAgo: minutes,
    }
  }, [lastSyncTime, isSyncing])

  // Simulate manual sync trigger (in real implementation, would refetch from Google Sheets)
  const triggerSync = useCallback(() => {
    setIsSyncing(true)
    setError(null)

    // Simulate async sync operation (500-1000ms)
    const syncTimeout = setTimeout(() => {
      setLastSyncTime(Date.now())
      setIsSyncing(false)
    }, Math.random() * 500 + 500)

    return () => clearTimeout(syncTimeout)
  }, [])

  // Auto-sync every syncInterval milliseconds (default: 5 minutes)
  useEffect(() => {
    const autoSyncInterval = setInterval(() => {
      triggerSync()
    }, syncInterval)

    return () => clearInterval(autoSyncInterval)
  }, [syncInterval, triggerSync])

  return {
    // KPI data
    kpis,

    // Sync status
    syncStatus,
    lastSyncTime,
    isSyncing,
    syncError,

    // Actions
    triggerSync,

    // Utility
    transactionCount: transactions?.length || 0,
    hasData: transactions && transactions.length > 0,
  }
}

/**
 * Hook for transaction data on the Transactions/Ledger page
 */
export function useTransactionData(transactions, filters = {}) {
  const [sortBy, setSortBy] = useState('date') // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)

  // Apply filters and sorting
  const filtered = useMemo(() => {
    if (!transactions) return []

    let result = [...transactions]

    // Apply date range filter
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      result = result.filter((tx) => {
        const txDate = new Date(tx.dateISO || tx.date).getTime()
        return txDate >= from
      })
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime()
      result = result.filter((tx) => {
        const txDate = new Date(tx.dateISO || tx.date).getTime()
        return txDate <= to
      })
    }

    // Apply account filter
    if (filters.account) {
      result = result.filter((tx) => tx.account === filters.account)
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((tx) => {
        const txStatus = (tx.status || '').toUpperCase()
        return txStatus === filters.status.toUpperCase()
      })
    }

    // Apply search filter
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((tx) => {
        const description = (tx.description || '').toLowerCase()
        const txId = (tx.transactionId || '').toLowerCase()
        const beneficiary = (tx.description || tx.beneficiary || '').toLowerCase()
        return description.includes(q) || txId.includes(q) || beneficiary.includes(q)
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0

      if (sortBy === 'date') {
        const dateA = new Date(a.dateISO || a.date).getTime()
        const dateB = new Date(b.dateISO || b.date).getTime()
        compareValue = dateB - dateA // Default to newest first
      } else if (sortBy === 'amount') {
        compareValue = (b.amount || 0) - (a.amount || 0)
      }

      return sortOrder === 'asc' ? -compareValue : compareValue
    })

    return result
  }, [transactions, filters, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filtered.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy, sortOrder])

  return {
    // Data
    transactions: paginatedData,
    filteredCount: filtered.length,
    totalCount: transactions?.length || 0,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Full filtered dataset (for exports)
    allFiltered: filtered,
  }
}

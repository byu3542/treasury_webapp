import { useState, useMemo, useEffect } from 'react'
import { filterByDatePreset, sortTransactionsDesc } from '../utils/dateUtils.js'

const EMPTY = {
  search: '',
  category: '',
  account: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  reconcileStatus: 'all', // 'all' | 'cleared' | 'pending' | 'unreconciled'
  datePreset: 'Last 30 Days', // Smart default
}

/**
 * Filter and search transactions entirely in-memory.
 * All operations < 500ms for 1000 rows.
 * Includes localStorage persistence for date preset.
 */
export function useFilters(transactions) {
  // Initialize with localStorage preference for datePreset
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('treasury_dateFilter')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...EMPTY, datePreset: parsed.preset || EMPTY.datePreset }
      } catch {
        return EMPTY
      }
    }
    return EMPTY
  })

  // Persist datePreset to localStorage
  useEffect(() => {
    localStorage.setItem(
      'treasury_dateFilter',
      JSON.stringify({ preset: filters.datePreset, appliedAt: Date.now() })
    )
  }, [filters.datePreset])

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const resetFilters = () => setFilters(EMPTY)

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v !== EMPTY[k]
  )

  const filtered = useMemo(() => {
    let result = transactions

    // Apply date preset filter first (fastest)
    if (filters.datePreset && filters.datePreset !== 'All Time') {
      result = filterByDatePreset(result, filters.datePreset)
    } else {
      // Still sort by date descending even without preset
      result = sortTransactionsDesc(result)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (tx) =>
          (tx.description ?? '').toLowerCase().includes(q) ||
          (tx.fullDescription ?? '').toLowerCase().includes(q) ||
          (tx.category ?? '').toLowerCase().includes(q) ||
          (tx.account ?? '').toLowerCase().includes(q)
      )
    }

    if (filters.category) {
      result = result.filter((tx) => tx.category === filters.category)
    }

    if (filters.account) {
      result = result.filter((tx) => tx.account === filters.account)
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      result = result.filter((tx) => {
        const d = tx.dateISO ? new Date(tx.dateISO).getTime() : new Date(tx.date).getTime()
        return d >= from
      })
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime()
      result = result.filter((tx) => {
        const d = tx.dateISO ? new Date(tx.dateISO).getTime() : new Date(tx.date).getTime()
        return d <= to
      })
    }

    if (filters.amountMin !== '') {
      const min = parseFloat(filters.amountMin)
      result = result.filter((tx) => tx.amount >= min)
    }

    if (filters.amountMax !== '') {
      const max = parseFloat(filters.amountMax)
      result = result.filter((tx) => tx.amount <= max)
    }

    if (filters.reconcileStatus !== 'all') {
      result = result.filter((tx) => {
        const status = tx._reconcile?.status ?? 'unreconciled'
        return status === filters.reconcileStatus
      })
    }

    return result
  }, [transactions, filters])

  // Unique categories & accounts for filter dropdowns
  const categories = useMemo(
    () => [...new Set(transactions.map((t) => t.category).filter(Boolean))].sort(),
    [transactions]
  )

  const accounts = useMemo(
    () => [...new Set(transactions.map((t) => t.account).filter(Boolean))].sort(),
    [transactions]
  )

  return {
    filters,
    filtered,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    categories,
    accounts,
    datePreset: filters.datePreset,
    setDatePreset: (preset) => updateFilter('datePreset', preset),
  }
}

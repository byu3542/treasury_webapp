import { useState, useMemo } from 'react'

const EMPTY = {
  search: '',
  category: '',
  account: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  reconcileStatus: 'all', // 'all' | 'cleared' | 'pending' | 'unreconciled'
}

/**
 * Filter and search transactions entirely in-memory.
 * All operations < 500ms for 1000 rows.
 */
export function useFilters(transactions) {
  const [filters, setFilters] = useState(EMPTY)

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const resetFilters = () => setFilters(EMPTY)

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v !== EMPTY[k]
  )

  const filtered = useMemo(() => {
    let result = transactions

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
  }
}

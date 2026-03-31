/**
 * Date utility functions for filtering transactions by date presets.
 */

/**
 * Parse a date string in various formats to a Date object.
 * Handles "YYYY-MM-DD", "MM/DD/YYYY", ISO strings, etc.
 */
export function parseDate(dateStr) {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr

  // Try ISO format first
  let date = new Date(dateStr)
  if (!isNaN(date)) return date

  // Try MM/DD/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    date = new Date(parts[2], parts[0] - 1, parts[1])
    if (!isNaN(date)) return date
  }

  return null
}

/**
 * Get the start date for a given preset.
 * @param {string} preset - "Last 30 Days", "Last 60 Days", "Last 6 Months", "Last Year", "All Time"
 * @returns {Date|null} Start date, or null for "All Time"
 */
export function getPresetStartDate(preset) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (preset) {
    case 'Last 30 Days':
      const d30 = new Date(today)
      d30.setDate(d30.getDate() - 30)
      return d30

    case 'Last 60 Days':
      const d60 = new Date(today)
      d60.setDate(d60.getDate() - 60)
      return d60

    case 'Last 6 Months':
      const d6m = new Date(today)
      d6m.setMonth(d6m.getMonth() - 6)
      return d6m

    case 'Last Year':
      const d1y = new Date(today)
      d1y.setFullYear(d1y.getFullYear() - 1)
      return d1y

    case 'All Time':
      return null

    default:
      return null
  }
}

/**
 * Filter transactions by a date preset and return sorted (newest first).
 * @param {Array} transactions - Array of transaction objects
 * @param {string} preset - Preset name
 * @returns {Array} Filtered and sorted transactions
 */
export function filterByDatePreset(transactions, preset) {
  if (!transactions) return []
  if (preset === 'All Time' || !preset) {
    return sortTransactionsDesc(transactions)
  }

  const startDate = getPresetStartDate(preset)
  if (!startDate) return sortTransactionsDesc(transactions)

  const filtered = transactions.filter((tx) => {
    const txDate = parseDate(tx.dateISO || tx.date)
    if (!txDate) return false
    return txDate >= startDate
  })

  return sortTransactionsDesc(filtered)
}

/**
 * Sort transactions by date descending (newest first).
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Sorted transactions
 */
export function sortTransactionsDesc(transactions) {
  return [...transactions].sort((a, b) => {
    const dateA = parseDate(a.dateISO || a.date)
    const dateB = parseDate(b.dateISO || b.date)

    if (!dateA || !dateB) return 0

    // Sort by date descending (newest first)
    const dateDiff = dateB - dateA
    if (dateDiff !== 0) return dateDiff

    // If same date, sort by amount descending
    return (b.amount || 0) - (a.amount || 0)
  })
}

/**
 * Get human-readable date range for a preset.
 * @param {string} preset - Preset name
 * @returns {string} Date range description, e.g., "Mar 2 - Mar 31"
 */
export function getDateRangeLabel(preset) {
  if (preset === 'All Time') return 'All Time'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = getPresetStartDate(preset)

  if (!startDate) return 'All Time'

  const format = (d) => {
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    return `${month} ${day}`
  }

  return `${format(startDate)} - ${format(today)}`
}

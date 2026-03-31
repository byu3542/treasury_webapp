/**
 * Formatting utilities for currency, dates, times, and percentages
 */

/**
 * Format number as USD currency
 * @param {number} amount - The amount to format
 * @param {boolean} compact - Show K/M/B notation for large numbers
 */
export function formatCurrency(amount, compact = false) {
  if (amount === null || amount === undefined) return '$0.00'

  const num = Number(amount)
  if (isNaN(num)) return '$0.00'

  if (compact && Math.abs(num) >= 1000) {
    if (Math.abs(num) >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    } else if (Math.abs(num) >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format percentage with +/- indicator
 * @param {number} percent - The percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 */
export function formatPercentage(percent, decimals = 2) {
  if (percent === null || percent === undefined) return '0%'

  const num = Number(percent)
  if (isNaN(num)) return '0%'

  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

/**
 * Format date as "MMM DD, YYYY" (e.g., "Oct 24, 2023")
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

/**
 * Format time as "HH:MM:SS UTC" (e.g., "09:42:12 UTC")
 */
export function formatTime(timeStr) {
  if (!timeStr) return '—'

  // Handle time-only format
  if (timeStr.includes(':') && !timeStr.includes('T')) {
    return `${timeStr} UTC`
  }

  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return timeStr

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * Format date and time together (e.g., "Oct 24, 2023 09:42:12 UTC")
 */
export function formatDateAndTime(dateStr) {
  if (!dateStr) return '—'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)

  const timeFormatted = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  return `${dateFormatted} ${timeFormatted} UTC`
}

/**
 * Format relative time (e.g., "2m ago", "1h ago")
 */
export function formatDistanceToNow(date) {
  if (!date) return '—'

  const d = new Date(date)
  if (isNaN(d.getTime())) return date

  const now = new Date()
  const seconds = Math.floor((now - d) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return formatDate(date)
}

/**
 * Format transaction ID (e.g., "TXN-4892-X98")
 */
export function formatTransactionId(id) {
  if (!id) return '—'
  return String(id).toUpperCase()
}

/**
 * Format category name (e.g., "PAYROLL" → "Payroll & Compensation")
 */
export function formatCategory(category) {
  if (!category) return 'Uncategorized'

  const categoryMap = {
    PAYROLL: 'Payroll & Compensation',
    'PAYROLL & COMPENSATION': 'Payroll & Compensation',
    INFRASTRUCTURE: 'Infrastructure (AWS/GCP)',
    'INFRASTRUCTURE (AWS/GCP)': 'Infrastructure (AWS/GCP)',
    'TREASURY OPERATIONS': 'Treasury Operations',
    'STRATEGIC ACQUISITIONS': 'Strategic Acquisitions',
    CAPEX: 'Capital Expenditure',
    TECHNOLOGY: 'Technology & Software',
    SUPPLY_CHAIN: 'Supply Chain',
    'SUPPLY CHAIN': 'Supply Chain',
    OPERATIONAL_EXPENSES: 'Operational Expenses',
    'OPERATIONAL EXPENSES': 'Operational Expenses',
  }

  return categoryMap[category.toUpperCase()] || category
}

/**
 * Format status badge text
 */
export function formatStatus(status) {
  if (!status) return 'Pending'

  const statusMap = {
    SETTLED: 'Settled',
    PENDING: 'Pending',
    'PENDING APPROVAL': 'Pending Approval',
    FLAGGED: 'Flagged',
    RECONCILED: 'Reconciled',
    DISPUTED: 'Disputed',
    FAILED: 'Failed',
  }

  return statusMap[status.toUpperCase()] || status
}

/**
 * Format account name with initials
 * @param {string} accountName - Full account name
 * @returns {object} { full, initials }
 */
export function formatAccount(accountName) {
  if (!accountName) return { full: 'Unknown', initials: 'UN' }

  const initials = accountName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)

  return {
    full: accountName,
    initials: initials || 'XX',
  }
}

/**
 * Format number with thousand separators (e.g., "1,234,567.89")
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'

  const n = Number(num)
  if (isNaN(n)) return '0'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

/**
 * Compact number format (e.g., "1.2M", "450K")
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0'

  const n = Number(num)
  if (isNaN(n)) return '0'

  if (Math.abs(n) >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`
  } else if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toFixed(1)}K`
  }

  return n.toFixed(0)
}

/**
 * Format runway/days value
 */
export function formatDays(days) {
  if (!days || days === 0) return '0 days'

  const d = Math.round(days)
  return `${d} day${d !== 1 ? 's' : ''}`
}

/**
 * Truncate long strings with ellipsis
 */
export function truncate(str, length = 50) {
  if (!str) return '—'
  if (str.length <= length) return str
  return `${str.substring(0, length)}…`
}

/**
 * Highlight negative numbers in red, positive in green
 * Returns CSS class name
 */
export function getAmountColorClass(amount) {
  if (!amount) return 'text-secondary'
  const num = Number(amount)
  if (num > 0) return 'text-success'
  if (num < 0) return 'text-error'
  return 'text-secondary'
}

/**
 * Get status badge color class
 */
export function getStatusColorClass(status) {
  if (!status) return 'badge-default'

  const s = status.toUpperCase()
  if (s === 'SETTLED' || s === 'RECONCILED') return 'badge-success'
  if (s === 'PENDING' || s === 'PENDING APPROVAL') return 'badge-warning'
  if (s === 'FAILED' || s === 'DISPUTED' || s === 'FLAGGED') return 'badge-error'

  return 'badge-default'
}

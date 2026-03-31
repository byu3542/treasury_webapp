/**
 * Dashboard Data Aggregation Functions
 * All KPI calculations, alert generation, and data transformations
 */

/**
 * Calculate net cash position (sum of all transaction amounts)
 */
export function getNetCashPosition(transactions) {
  if (!transactions || transactions.length === 0) return 0
  return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
}

/**
 * Calculate total inflows in specified date range (default: last 30 days)
 */
export function getTotalInflows(transactions, days = 30) {
  if (!transactions) return 0
  const since = new Date()
  since.setDate(since.getDate() - days)

  return transactions
    .filter((tx) => {
      const txDate = new Date(tx.dateISO || tx.date)
      return txDate >= since && (tx.amount || 0) > 0
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0)
}

/**
 * Calculate total outflows in specified date range (default: last 30 days)
 * Returns absolute value
 */
export function getTotalOutflows(transactions, days = 30) {
  if (!transactions) return 0
  const since = new Date()
  since.setDate(since.getDate() - days)

  const total = transactions
    .filter((tx) => {
      const txDate = new Date(tx.dateISO || tx.date)
      return txDate >= since && (tx.amount || 0) < 0
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0)

  return Math.abs(total)
}

/**
 * Get unique active accounts
 */
export function getActiveAccounts(transactions) {
  if (!transactions) return []
  const accounts = [...new Set(transactions.map((tx) => tx.account || '').filter(Boolean))]
  return accounts.sort()
}

/**
 * Calculate week-over-week trend percentage
 */
export function calculateTrendPercentage(current, previous) {
  if (!previous || previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Get inflows and outflows aggregated by week (last 12 weeks)
 * Returns { inflows: {W1, W2, ...}, outflows: {W1, W2, ...} }
 */
export function getWeeklyFlows(transactions, weeks = 12) {
  if (!transactions || transactions.length === 0) {
    return { inflows: {}, outflows: {}, labels: [] }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)

  const inflows = {}
  const outflows = {}
  const labels = []

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    const label = `W${i + 1}`

    inflows[label] = transactions
      .filter((tx) => {
        const txDate = new Date(tx.dateISO || tx.date)
        return txDate >= weekStart && txDate < weekEnd && (tx.amount || 0) > 0
      })
      .reduce((sum, tx) => sum + (tx.amount || 0), 0)

    outflows[label] = Math.abs(
      transactions
        .filter((tx) => {
          const txDate = new Date(tx.dateISO || tx.date)
          return txDate >= weekStart && txDate < weekEnd && (tx.amount || 0) < 0
        })
        .reduce((sum, tx) => sum + (tx.amount || 0), 0)
    )

    labels.push(label)
  }

  return { inflows, outflows, labels }
}

/**
 * Get top outflow drivers by category (last 30 days)
 * Returns sorted array: [{category, amount}, ...]
 */
export function getOutflowDrivers(transactions, days = 30, limit = 10) {
  if (!transactions) return []

  const since = new Date()
  since.setDate(since.getDate() - days)

  const grouped = {}
  transactions
    .filter((tx) => {
      const txDate = new Date(tx.dateISO || tx.date)
      return txDate >= since && (tx.amount || 0) < 0
    })
    .forEach((tx) => {
      const category = tx.category || 'UNCATEGORIZED'
      grouped[category] = (grouped[category] || 0) + Math.abs(tx.amount || 0)
    })

  return Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

/**
 * Get institutional activity grouped by counterparty
 * Returns array of most recent activities with counterparty metadata
 */
export function getInstitutionalActivity(transactions, limit = 4) {
  if (!transactions) return []

  const grouped = {}
  transactions.forEach((tx) => {
    const beneficiary = tx.description || tx.beneficiary || 'Unknown'
    if (!grouped[beneficiary]) {
      grouped[beneficiary] = {
        counterparty: beneficiary,
        repository: tx.account || 'Unknown',
        latestStatus: tx.status || 'PENDING',
        latestAmount: tx.amount || 0,
        latestDate: tx.dateISO || tx.date,
      }
    }
  })

  return Object.values(grouped)
    .sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate))
    .slice(0, limit)
}

/**
 * Generate risk alerts based on current financial state
 */
export function generateRiskAlerts(transactions, kpis) {
  const alerts = []

  if (!transactions || transactions.length === 0) {
    return alerts
  }

  // CRITICAL RUNWAY ALERT
  const avgDailyOutflow = getTotalOutflows(transactions, 30) / 30
  if (avgDailyOutflow > 0) {
    const runway = kpis.netCashPosition / avgDailyOutflow
    if (runway < 14 && runway > 0) {
      alerts.push({
        type: 'CRITICAL_RUNWAY',
        severity: 'critical',
        message: `Entity-04 operating at ${Math.round(runway)}-day liquidity threshold. Urgent rebalancing required from main vault.`,
        timestamp: new Date(),
      })
    }
  }

  // DATA SYNC LAG (simulated - in real implementation would track API response times)
  alerts.push({
    type: 'DATA_SYNC_LAG',
    severity: 'warning',
    message: 'Chase Institutional API reporting 420ms latency. Transaction parity delayed by 2 cycles.',
    timestamp: new Date(Date.now() - 14 * 60 * 1000), // 14m ago
  })

  // FORECAST VARIANCE
  const currentMonthStart = new Date()
  currentMonthStart.setDate(1)
  const currentMonthOutflow = getTotalOutflows(
    transactions.filter((tx) => {
      const txDate = new Date(tx.dateISO || tx.date)
      return txDate >= currentMonthStart
    })
  )

  const historicalAvg = getTotalOutflows(transactions, 90) / 3
  if (historicalAvg > 0) {
    const variance = ((currentMonthOutflow - historicalAvg) / historicalAvg) * 100
    if (Math.abs(variance) > 1) {
      alerts.push({
        type: 'FORECAST_VARIANCE',
        severity: 'warning',
        message: `Quarterly outflow forecast deviates by ${variance.toFixed(1)}% from historical benchmarks.`,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1d ago
      })
    }
  }

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return alerts
}

/**
 * Calculate all dashboard KPIs at once
 * Returns object with all metrics for rendering
 */
export function calculateDashboardKPIs(transactions, previousPeriodTransactions = null) {
  const current = {
    netCashPosition: getNetCashPosition(transactions),
    totalInflows30d: getTotalInflows(transactions, 30),
    totalOutflows30d: getTotalOutflows(transactions, 30),
    activeAccounts: getActiveAccounts(transactions),
  }

  const previous = previousPeriodTransactions
    ? {
        netCashPosition: getNetCashPosition(previousPeriodTransactions),
        totalInflows30d: getTotalInflows(previousPeriodTransactions, 30),
        totalOutflows30d: getTotalOutflows(previousPeriodTransactions, 30),
        activeAccounts: getActiveAccounts(previousPeriodTransactions),
      }
    : null

  return {
    netCashPosition: current.netCashPosition,
    netCashPositionTrend: previous
      ? calculateTrendPercentage(current.netCashPosition, previous.netCashPosition)
      : 0,
    totalInflows30d: current.totalInflows30d,
    totalInflows30dTrend: previous
      ? calculateTrendPercentage(current.totalInflows30d, previous.totalInflows30d)
      : 0,
    totalOutflows30d: current.totalOutflows30d,
    totalOutflows30dTrend: previous
      ? calculateTrendPercentage(current.totalOutflows30d, previous.totalOutflows30d)
      : 0,
    activeAccounts: current.activeAccounts,
    weeklyFlows: getWeeklyFlows(transactions, 12),
    outflowDrivers: getOutflowDrivers(transactions, 30),
    institutionalActivity: getInstitutionalActivity(transactions, 4),
    riskAlerts: generateRiskAlerts(transactions, current),
  }
}

/**
 * Get transaction metrics for transaction ledger page
 */
export function getTransactionMetrics(transactions, dateRange = { days: 1 }) {
  const since = new Date()
  since.setDate(since.getDate() - dateRange.days)

  const filtered = transactions.filter((tx) => {
    const txDate = new Date(tx.dateISO || tx.date)
    return txDate >= since
  })

  return {
    netInflow: getTotalInflows(filtered),
    totalOutflow: getTotalOutflows(filtered),
    pendingCount: filtered.filter((tx) => tx.status === 'PENDING' || tx.status === 'pending').length,
    volatilityIndex: calculateVolatilityIndex(filtered),
  }
}

/**
 * Calculate volatility index (simplified: coefficient of variation of daily flows)
 */
export function calculateVolatilityIndex(transactions) {
  if (!transactions || transactions.length === 0) return 0

  // Group transactions by date
  const dailyFlows = {}
  transactions.forEach((tx) => {
    const date = (tx.dateISO || tx.date).split('T')[0]
    dailyFlows[date] = (dailyFlows[date] || 0) + Math.abs(tx.amount || 0)
  })

  const flows = Object.values(dailyFlows)
  if (flows.length < 2) return 0

  const mean = flows.reduce((a, b) => a + b, 0) / flows.length
  if (mean === 0) return 0

  const variance = flows.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / flows.length
  const stdDev = Math.sqrt(variance)
  const cv = (stdDev / mean) * 100

  // Normalize to 0-100 scale
  return Math.min(cv, 100)
}

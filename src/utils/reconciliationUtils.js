/**
 * Reconciliation utilities for matching internal ledger vs bank statements
 * Includes variance calculation, health metrics, and anomaly detection
 */

/**
 * Calculate reconciliation health score
 * Health = (matched transactions / total transactions) * 100
 */
export function calculateHealthScore(transactions) {
  if (!transactions || transactions.length === 0) return 0
  const matched = transactions.filter((tx) => tx.status === 'matched').length
  return Math.round((matched / transactions.length) * 100)
}

/**
 * Calculate variance between internal and bank amounts
 * Positive variance = more in internal ledger, needs investigation
 * Negative variance = more in bank statement, possible missing transaction
 */
export function calculateVariance(transactions) {
  const ledgerTotal = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
  const bankTotal = transactions.reduce((sum, tx) => sum + (tx.bankAmount || 0), 0)
  return ledgerTotal - bankTotal
}

/**
 * Get reconciliation status counts
 */
export function getStatusCounts(transactions) {
  return {
    total: transactions.length,
    matched: transactions.filter((tx) => tx.status === 'matched').length,
    pending: transactions.filter((tx) => tx.status === 'pending').length,
    discrepancy: transactions.filter((tx) => tx.status === 'discrepancy').length,
    flagged: transactions.filter((tx) => tx.status === 'flagged').length,
  }
}

/**
 * Detect duplicate transactions (same amount, description within 2 days)
 */
export function detectDuplicates(transactions) {
  const duplicates = []
  const seen = new Map()

  transactions.forEach((tx) => {
    const key = `${tx.description}-${tx.amount}`
    if (seen.has(key)) {
      const previous = seen.get(key)
      const daysDiff = Math.abs(
        new Date(tx.date) - new Date(previous.date)
      ) / (1000 * 60 * 60 * 24)

      if (daysDiff <= 2) {
        duplicates.push({
          type: 'duplicate',
          severity: 'high',
          vendor: tx.description,
          amount: tx.amount,
          transactions: [previous, tx],
          message: `Duplicate transaction suspected for "${tx.description}"`,
        })
      }
    }
    seen.set(key, tx)
  })

  return duplicates
}

/**
 * Detect variance outliers (transactions > 2 std dev from mean)
 */
export function detectVarianceOutliers(transactions) {
  if (transactions.length < 3) return []

  const amounts = transactions.map((tx) => Math.abs(tx.amount || 0))
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const variance = amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)
  const threshold = mean + 2 * stdDev

  return transactions
    .filter((tx) => Math.abs(tx.amount || 0) > threshold)
    .map((tx) => ({
      type: 'outlier',
      severity: 'medium',
      message: `High variance detected: ${tx.description} (${Math.abs(tx.amount || 0).toFixed(2)})`,
      transaction: tx,
    }))
}

/**
 * Detect amount mismatches
 */
export function detectAmountMismatches(transactions) {
  return transactions
    .filter((tx) => {
      const diff = Math.abs((tx.amount || 0) - (tx.bankAmount || 0))
      return diff > 0.01 // More than 1 cent difference
    })
    .map((tx) => ({
      type: 'amount_mismatch',
      severity: 'medium',
      message: `Amount mismatch: Ledger ${tx.amount} vs Bank ${tx.bankAmount}`,
      transaction: tx,
    }))
}

/**
 * Run all anomaly detection
 */
export function detectAnomalies(transactions) {
  const anomalies = []

  // Check for duplicates
  anomalies.push(...detectDuplicates(transactions))

  // Check for variance outliers
  anomalies.push(...detectVarianceOutliers(transactions))

  // Check for amount mismatches
  anomalies.push(...detectAmountMismatches(transactions))

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 }
  anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return anomalies.slice(0, 5) // Return top 5 anomalies
}

/**
 * Get reconciliation tips based on current state
 */
export function generateReconciliationTips(transactions, filters) {
  const tips = []
  const counts = getStatusCounts(transactions)
  const healthScore = calculateHealthScore(transactions)

  // Tip 1: If many pending items
  if (counts.pending > 5) {
    tips.push({
      type: 'tip',
      severity: 'info',
      message: `${counts.pending} pending items can be auto-resolved by adjusting the 'Lookback Window' to 5 days.`,
      action: 'APPLY SETTING',
      actionType: 'applyLookback',
    })
  }

  // Tip 2: If health score is low
  if (healthScore < 80) {
    tips.push({
      type: 'tip',
      severity: 'warning',
      message: `Reconciliation health is ${healthScore}%. Review flagged transactions to improve accuracy.`,
      action: 'REVIEW FLAGGED',
      actionType: 'reviewFlagged',
    })
  }

  // Tip 3: If many discrepancies
  if (counts.discrepancy > 3) {
    tips.push({
      type: 'tip',
      severity: 'warning',
      message: `${counts.discrepancy} discrepancies detected. Consider widening the date matching window.`,
      action: 'ADJUST WINDOW',
      actionType: 'adjustWindow',
    })
  }

  return tips
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

/**
 * Format date for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

/**
 * Calculate match confidence (0-1)
 * Based on amount match, date proximity, description similarity
 */
export function calculateMatchConfidence(ledgerTx, bankTx) {
  let confidence = 0

  // Amount match: perfect match = 1.0, within $1 = 0.8, within $10 = 0.5
  const amountDiff = Math.abs((ledgerTx.amount || 0) - (bankTx.amount || 0))
  if (amountDiff === 0) confidence += 0.5
  else if (amountDiff < 1) confidence += 0.4
  else if (amountDiff < 10) confidence += 0.2

  // Date proximity: same day = 0.3, within 2 days = 0.2, within 5 days = 0.1
  const ledgerDate = new Date(ledgerTx.date).getTime()
  const bankDate = new Date(bankTx.date).getTime()
  const daysDiff = Math.abs(ledgerDate - bankDate) / (1000 * 60 * 60 * 24)

  if (daysDiff === 0) confidence += 0.3
  else if (daysDiff <= 2) confidence += 0.2
  else if (daysDiff <= 5) confidence += 0.1

  // Description similarity (simple check for common words)
  const ledgerWords = (ledgerTx.description || '').toLowerCase().split(/\s+/)
  const bankWords = (bankTx.bankDescription || '').toLowerCase().split(/\s+/)
  const commonWords = ledgerWords.filter((w) => bankWords.includes(w)).length
  const similarity = commonWords / Math.max(ledgerWords.length, bankWords.length)
  confidence += similarity * 0.2

  return Math.min(confidence, 1.0)
}

/**
 * Get match confidence color
 */
export function getConfidenceColor(confidence) {
  if (confidence >= 0.85) return 'text-success' // Green
  if (confidence >= 0.5) return 'text-amber' // Amber/Yellow
  return 'text-text-muted' // Gray
}

/**
 * Get match confidence label
 */
export function getConfidenceLabel(confidence) {
  if (confidence >= 0.85) return 'AUTO-MATCHED'
  if (confidence >= 0.5) return 'AMOUNT MISMATCH'
  return 'FIND POTENTIAL MATCH'
}

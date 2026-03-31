import { useAuth } from '../hooks/useAuth.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { useDateFilter } from '../hooks/useDateFilter.js'
import { useState, useMemo, useCallback } from 'react'
import {
  calculateHealthScore,
  calculateVariance,
  getStatusCounts,
  detectAnomalies,
  generateReconciliationTips,
  formatCurrency,
  formatDate,
  getConfidenceLabel,
  getConfidenceColor,
} from '../utils/reconciliationUtils.js'
import DateFilterControl from './Common/DateFilterControl'

// ─── Header Component ──────────────────────────────────────────────────────

function ReconciliationHeader({ healthScore, pendingCount, matchedValue, variance, onBatchReconcile, selectedCount, totalValue }) {
  return (
    <div className="space-y-4 border-b border-bg-border pb-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="rounded-lg border border-bg-border bg-bg-surface p-4">
          <div className="text-2xs uppercase tracking-widest text-text-muted mb-2">Reconciliation Health</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gold">{healthScore}%</div>
            <span className="text-xs text-teal">+1.4% vs prev week</span>
          </div>
        </div>

        {/* Pending Discrepancies */}
        <div className="rounded-lg border border-bg-border bg-bg-surface p-4">
          <div className="text-2xs uppercase tracking-widest text-text-muted mb-2">Pending Discrepancies</div>
          <div className="text-3xl font-bold text-amber">{pendingCount}</div>
          <div className="text-2xs text-text-muted mt-1">Requires manual review</div>
        </div>

        {/* Variance */}
        <div className="rounded-lg border border-bg-border bg-bg-surface p-4">
          <div className="text-2xs uppercase tracking-widest text-text-muted mb-2">Variance</div>
          <div className={`text-3xl font-bold ${variance >= 0 ? 'text-danger' : 'text-success'}`}>
            {formatCurrency(variance)}
          </div>
          <div className="text-2xs text-text-muted mt-1">Ledger vs Bank</div>
        </div>
      </div>

      {/* Quick Actions Row */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-dim border border-blue p-3">
          <span className="text-xs text-blue">
            Selected: {selectedCount} item{selectedCount !== 1 ? 's' : ''} • Total Value: {formatCurrency(totalValue)}
          </span>
          <button
            onClick={onBatchReconcile}
            className="btn-primary px-4 py-1.5 text-xs font-medium bg-success hover:bg-success/90"
          >
            Reconcile Selected
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Filter Bar Component ──────────────────────────────────────────────────

function ReconciliationFilters({ filters, onFilterChange, accounts, statuses }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-bg-border pb-4">
      {/* Date Range */}
      <div className="flex items-center gap-2">
        <label className="text-2xs uppercase tracking-widest text-text-muted">From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          className="input w-28 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-2xs uppercase tracking-widest text-text-muted">To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange('dateTo', e.target.value)}
          className="input w-28 text-xs"
        />
      </div>

      {/* Account Filter */}
      <select
        value={filters.account}
        onChange={(e) => onFilterChange('account', e.target.value)}
        className="select w-40 text-xs"
      >
        <option value="">All Accounts</option>
        {accounts.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="select w-40 text-xs"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Transaction Row Component ──────────────────────────────────────────────

function TransactionRow({ transaction, isSelected, onSelect, onReconcile }) {
  const confidence = transaction.matchConfidence || 0
  const label = getConfidenceLabel(confidence)
  const colorClass = getConfidenceColor(confidence)

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'matched':
        return <span className="text-success">✓</span>
      case 'discrepancy':
        return <span className="text-danger">!</span>
      case 'pending':
        return <span className="animate-spin">◌</span>
      default:
        return <span className="text-text-muted">−</span>
    }
  }

  const getRowClass = () => {
    const base = 'border-l-4 p-3 flex gap-4 items-center transition-colors'
    switch (transaction.status) {
      case 'matched':
        return `${base} border-l-success bg-success/5 opacity-60`
      case 'discrepancy':
        return `${base} border-l-danger bg-red-dim`
      case 'pending':
        return `${base} border-l-teal bg-teal-dim`
      default:
        return `${base} border-l-text-muted hover:bg-bg-hover`
    }
  }

  return (
    <div className={getRowClass()}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(transaction.id)}
        className="h-4 w-4 cursor-pointer accent-gold"
      />

      {/* Left Column: Internal Ledger */}
      <div className="flex-1 min-w-0">
        <div className="font-body text-sm text-text-primary truncate">{transaction.description}</div>
        <div className="font-mono text-2xs text-text-muted">{transaction.transactionId}</div>
        <div className={`font-mono text-sm font-medium ${transaction.amount >= 0 ? 'text-success' : 'text-danger'}`}>
          {formatCurrency(transaction.amount)}
        </div>
      </div>

      {/* Status */}
      <div className="text-2xl">{getStatusIcon()}</div>

      {/* Right Column: Bank Statement */}
      <div className="flex-1 min-w-0">
        <div className="font-body text-sm text-text-primary truncate">{transaction.bankDescription}</div>
        <div className="font-mono text-2xs text-text-muted">{formatDate(transaction.date)}</div>
        <div className="font-mono text-sm text-text-secondary">{formatCurrency(transaction.bankAmount)}</div>
      </div>

      {/* Match Status */}
      <div className="w-40 text-right">
        <div className={`font-mono text-2xs font-medium ${colorClass}`}>{label}</div>
        {transaction.status === 'pending' && (
          <button
            onClick={() => onReconcile(transaction.id)}
            className="text-2xs text-blue hover:text-blue/80 mt-1 underline"
          >
            Find Match
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Intelligence Briefing Component ───────────────────────────────────────

function IntelligenceBriefing({ anomalies, tips }) {
  if (!anomalies && (!tips || tips.length === 0)) {
    return null
  }

  return (
    <div className="rounded-lg border border-bg-border bg-bg-surface p-4 space-y-3">
      <div className="text-sm font-semibold text-gold">INTELLIGENCE BRIEFING</div>

      {/* Anomalies */}
      {anomalies && anomalies.length > 0 && (
        <div className="space-y-2 border-t border-bg-border pt-3">
          {anomalies.slice(0, 3).map((anomaly, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border-l-4 text-2xs ${
                anomaly.severity === 'high'
                  ? 'border-l-danger bg-red-dim text-danger'
                  : 'border-l-amber bg-amber/10 text-amber'
              }`}
            >
              <div className="font-mono font-semibold">{anomaly.type.toUpperCase()}</div>
              <div className="mt-1">{anomaly.message}</div>
              {anomaly.action && (
                <button className="mt-2 text-blue hover:underline font-mono text-2xs">
                  {anomaly.action}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="space-y-2 border-t border-bg-border pt-3">
          {tips.map((tip, idx) => (
            <div key={idx} className="p-3 rounded border-l-4 border-l-blue bg-blue-dim text-blue text-2xs">
              <div className="font-mono font-semibold">RECON TIP</div>
              <div className="mt-1">{tip.message}</div>
              {tip.action && (
                <button className="mt-2 text-blue hover:underline font-mono text-2xs font-semibold">
                  {tip.action}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function Reconciliation() {
  const { isAuthed, config } = useAuth()
  const { transactions } = useTransactions(config, isAuthed)
  const { selectedRange, startDate, endDate, handleRangeChange, getMinDateFromTransactions } = useDateFilter('last30', transactions)

  // Filter state
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    account: '',
    status: '',
  })

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Apply filters
  const filtered = useMemo(() => {
    let result = transactions

    // Apply date filter (preset or custom)
    result = result.filter((tx) => {
      const txDate = new Date(tx.dateISO || tx.date)
      return txDate >= startDate && txDate <= endDate
    })

    // Apply manual date filters (if specified)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      result = result.filter((tx) => new Date(tx.dateISO || tx.date).getTime() >= from)
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime()
      result = result.filter((tx) => new Date(tx.dateISO || tx.date).getTime() <= to)
    }

    if (filters.account) {
      result = result.filter((tx) => tx.account === filters.account)
    }

    if (filters.status) {
      result = result.filter((tx) => tx.status === filters.status)
    }

    return result
  }, [transactions, startDate, endDate, filters])

  // Calculate metrics
  const healthScore = calculateHealthScore(filtered)
  const variance = calculateVariance(filtered)
  const counts = getStatusCounts(filtered)
  const anomalies = useMemo(() => detectAnomalies(filtered), [filtered])
  const tips = useMemo(() => generateReconciliationTips(filtered, filters), [filtered, filters])

  // Get unique values for dropdowns
  const accounts = useMemo(() => [...new Set(transactions.map((t) => t.account).filter(Boolean))], [transactions])
  const statuses = ['matched', 'pending', 'discrepancy', 'flagged']

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBatchReconcile = useCallback(() => {
    // TODO: Implement batch reconcile (update status to 'matched')
    console.log('Batch reconcile:', Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [selectedIds])

  const handleReconcile = useCallback((id) => {
    // TODO: Implement single reconcile
    console.log('Reconcile:', id)
  }, [])

  // Calculate selected values
  const selectedTransactions = filtered.filter((tx) => selectedIds.has(tx.id))
  const selectedValue = selectedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)

  if (!isAuthed) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-body text-sm text-text-muted">Sign in to access reconciliation tools.</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-body text-sm text-text-muted">Configure Google Sheets in Settings to view reconciliation.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <ReconciliationHeader
        healthScore={healthScore}
        pendingCount={counts.pending}
        matchedValue={counts.matched}
        variance={variance}
        selectedCount={selectedIds.size}
        totalValue={selectedValue}
        onBatchReconcile={handleBatchReconcile}
      />

      {/* Date Filter Control */}
      <DateFilterControl
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        allTimeStartDate={getMinDateFromTransactions()}
      />

      {/* Filters */}
      <ReconciliationFilters filters={filters} onFilterChange={handleFilterChange} accounts={accounts} statuses={statuses} />

      {/* Intelligence Briefing */}
      {(anomalies.length > 0 || tips.length > 0) && <IntelligenceBriefing anomalies={anomalies} tips={tips} />}

      {/* Transaction Table */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-text-muted">No transactions found</div>
        ) : (
          filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              isSelected={selectedIds.has(tx.id)}
              onSelect={handleSelect}
              onReconcile={handleReconcile}
            />
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 border-t border-bg-border pt-3">
        <button className="btn-ghost flex-1 text-xs text-danger">🚩 Flag for Review</button>
        <button
          onClick={handleBatchReconcile}
          disabled={selectedIds.size === 0}
          className="btn-primary flex-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✓ Reconcile Selected ({selectedIds.size})
        </button>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useTransactions, useAggregates } from '../hooks/useTransactions.js'
import { useFilters } from '../hooks/useFilters.js'
import DateRangeFilter from './DateRangeFilter.jsx'

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

// Mini sparkline bar chart
function BarChart({ data, colorFn, labelFn, valueFn, height = 100 }) {
  const max = Math.max(...data.map(valueFn), 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div
            className={`w-full rounded-t-sm transition-all ${colorFn(d)}`}
            style={{ height: `${Math.max((valueFn(d) / max) * 100, 1)}%` }}
            title={`${labelFn(d)}: ${fmt(valueFn(d))}`}
          />
        </div>
      ))}
    </div>
  )
}

// Monthly cash flow breakdown
function MonthlyCashFlow({ transactions }) {
  const monthly = useMemo(() => {
    const map = new Map()
    for (const tx of transactions) {
      const d = tx.dateISO ? new Date(tx.dateISO) : new Date(tx.date)
      if (isNaN(d)) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (!map.has(key)) map.set(key, { key, label, inflow: 0, outflow: 0 })
      const b = map.get(key)
      if (tx.amount > 0) b.inflow += tx.amount
      else b.outflow += Math.abs(tx.amount)
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => v)
  }, [transactions])

  if (!monthly.length) return <p className="text-xs text-text-muted">No data</p>

  const maxVal = Math.max(...monthly.map((m) => Math.max(m.inflow, m.outflow)), 1)

  return (
    <div className="card">
      <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-text-muted">
        Monthly Cash Flow (last 12 months)
      </p>
      <div className="flex items-end gap-1.5" style={{ height: 100 }}>
        {monthly.map((m) => (
          <div key={m.key} className="flex flex-1 flex-col items-center gap-0.5">
            <div
              className="w-full flex flex-col items-center justify-end gap-px"
              style={{ height: 92 }}
            >
              <div
                className="w-full rounded-sm bg-success/70"
                style={{ height: `${(m.inflow / maxVal) * 100}%`, minHeight: m.inflow > 0 ? 2 : 0 }}
                title={`Inflow: ${fmt(m.inflow)}`}
              />
              <div
                className="w-full rounded-sm bg-danger/70"
                style={{ height: `${(m.outflow / maxVal) * 100}%`, minHeight: m.outflow > 0 ? 2 : 0 }}
                title={`Outflow: ${fmt(m.outflow)}`}
              />
            </div>
            <span className="font-mono text-2xs text-text-muted">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4">
        <span className="flex items-center gap-1 font-mono text-2xs text-text-muted">
          <span className="h-2 w-2 rounded-sm bg-success/70" /> Inflows
        </span>
        <span className="flex items-center gap-1 font-mono text-2xs text-text-muted">
          <span className="h-2 w-2 rounded-sm bg-danger/70" /> Outflows
        </span>
      </div>
    </div>
  )
}

// Category trend — top 5 spending categories month over month
function CategoryTrends({ transactions }) {
  const data = useMemo(() => {
    // Get top 5 outflow categories overall
    const catMap = new Map()
    for (const tx of transactions) {
      if (tx.amount >= 0) continue
      const c = tx.category || 'Uncategorized'
      catMap.set(c, (catMap.get(c) ?? 0) + Math.abs(tx.amount))
    }
    const top5 = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat)

    // Monthly totals per category
    const months = new Map()
    for (const tx of transactions) {
      if (!top5.includes(tx.category)) continue
      const d = tx.dateISO ? new Date(tx.dateISO) : new Date(tx.date)
      if (isNaN(d)) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!months.has(key)) months.set(key, {})
      const m = months.get(key)
      m[tx.category] = (m[tx.category] ?? 0) + Math.abs(tx.amount)
    }

    const sortedMonths = [...months.keys()].sort().slice(-6)
    return { top5, sortedMonths, months }
  }, [transactions])

  const colors = ['text-terracotta', 'text-terracotta', 'text-danger', 'text-success', 'text-warning']
  const bgColors = ['bg-terracotta', 'bg-terracotta', 'bg-danger', 'bg-success', 'bg-warning']

  if (!data.top5.length) return <p className="text-xs text-text-muted">No category data</p>

  return (
    <div className="card">
      <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-text-muted">
        Top 5 Categories — Last 6 Months
      </p>
      <div className="space-y-3">
        {data.top5.map((cat, ci) => (
          <div key={cat}>
            <div className="mb-1 flex items-center justify-between">
              <span className={`font-mono text-xs ${colors[ci]}`}>{cat}</span>
            </div>
            <div className="flex gap-1">
              {data.sortedMonths.map((m) => {
                const val = data.months.get(m)?.[cat] ?? 0
                const max = Math.max(...data.sortedMonths.map((mo) => data.months.get(mo)?.[cat] ?? 0), 1)
                const pct = (val / max) * 100
                return (
                  <div key={m} className="flex-1" title={`${m}: ${fmt(val)}`}>
                    <div className="h-6 rounded-sm bg-bg-hover">
                      <div
                        className={`h-full rounded-sm ${bgColors[ci]} opacity-60`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        {data.sortedMonths.map((m) => (
          <div key={m} className="flex-1 text-center font-mono text-2xs text-text-muted">
            {m.slice(5)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Reconciliation rate
function ReconciliationStats({ transactions }) {
  const cleared = transactions.filter((t) => t._reconcile?.status === 'cleared').length
  const total = transactions.length
  const rate = total > 0 ? (cleared / total) * 100 : 0

  return (
    <div className="card">
      <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-text-muted">
        Reconciliation
      </p>
      <div className="mb-3 flex items-end gap-2">
        <span className="font-mono text-3xl font-medium text-text-primary">
          {rate.toFixed(1)}%
        </span>
        <span className="mb-1 font-mono text-xs text-text-muted">cleared</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-hover">
        <div
          className="h-full rounded-full bg-terracotta transition-all"
          style={{ width: `${rate}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-2xs text-text-muted">
        <span>{cleared.toLocaleString()} cleared</span>
        <span>{(total - cleared).toLocaleString()} pending</span>
      </div>
    </div>
  )
}

// Top outflows table
function TopOutflows({ byCategory }) {
  const outflows = byCategory.filter((c) => c.total < 0).slice(0, 10)
  const max = outflows.length ? Math.abs(outflows[0].total) : 1

  return (
    <div className="card">
      <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-text-muted">
        Top Outflow Categories
      </p>
      <div className="space-y-2">
        {outflows.map((c, i) => (
          <div key={c.category} className="flex items-center gap-3">
            <span className="w-5 flex-shrink-0 text-right font-mono text-2xs text-text-muted">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex justify-between">
                <span className="truncate font-body text-xs text-text-primary">{c.category}</span>
                <span className="ml-2 flex-shrink-0 font-mono text-xs text-danger">{fmt(c.total)}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-bg-hover">
                <div
                  className="h-1 rounded-full bg-danger/60"
                  style={{ width: `${(Math.abs(c.total) / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="w-12 flex-shrink-0 text-right font-mono text-2xs text-text-muted">
              {c.count} txns
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  const { isAuthed, config } = useAuth()
  const { transactions, isLoadingCache } = useTransactions(config, isAuthed)
  const { filtered, datePreset, setDatePreset, filters, updateFilter } = useFilters(transactions)
  const { byAccount, byCategory, summary } = useAggregates(filtered)

  if (!isAuthed || !config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-body text-sm text-text-muted">Sign in to view analytics.</p>
      </div>
    )
  }

  if (isLoadingCache && transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-56 skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date filter */}
      <DateRangeFilter
        preset={datePreset}
        onChange={setDatePreset}
        customDateFrom={filters.dateFrom}
        customDateTo={filters.dateTo}
        onCustomDateChange={(type, value) => {
          if (type === 'from') updateFilter('dateFrom', value)
          if (type === 'to') updateFilter('dateTo', value)
        }}
      />

      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">Total Inflows</p>
            <p className="mt-1 font-mono text-xl font-medium text-success">{fmt(summary.inflows)}</p>
          </div>
          <div className="card text-center">
            <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">Total Outflows</p>
            <p className="mt-1 font-mono text-xl font-medium text-danger">{fmt(summary.outflows)}</p>
          </div>
          <div className="card text-center">
            <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">Net Position</p>
            <p className={`mt-1 font-mono text-xl font-medium ${summary.net >= 0 ? 'text-terracotta' : 'text-danger'}`}>
              {fmt(summary.net)}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <MonthlyCashFlow transactions={filtered} />
        <CategoryTrends transactions={filtered} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopOutflows byCategory={byCategory} />
        </div>
        <ReconciliationStats transactions={filtered} />
      </div>
    </div>
  )
}

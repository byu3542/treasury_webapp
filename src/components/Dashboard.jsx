import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useTransactions, useAggregates } from '../hooks/useTransactions.js'
import { useFilters } from '../hooks/useFilters.js'
import { getMeta } from '../services/db.js'
import { useState } from 'react'
import DateRangeFilter from './DateRangeFilter.jsx'

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function KpiCard({ label, value, sub, accent }) {
  const colorMap = {
    gold: 'border-gold/30 text-gold',
    teal: 'border-teal/30 text-teal',
    green: 'border-success/30 text-success',
    red: 'border-danger/30 text-danger',
    muted: 'border-bg-border text-text-secondary',
  }
  const accentClass = colorMap[accent] ?? colorMap.muted

  return (
    <div className={`card border ${accentClass.split(' ')[0]}`}>
      <p className="mb-1 font-mono text-2xs uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`kpi-value ${accentClass.split(' ')[1]}`}>{value}</p>
      {sub && <p className="mt-1 font-mono text-xs text-text-muted">{sub}</p>}
    </div>
  )
}

function AccountCard({ account, institution, balance, count }) {
  const isPositive = balance >= 0
  return (
    <div className="card flex items-center justify-between">
      <div className="min-w-0">
        <p className="truncate font-body text-sm font-medium text-text-primary">{account}</p>
        {institution && (
          <p className="font-mono text-2xs text-text-muted">{institution}</p>
        )}
        <p className="font-mono text-2xs text-text-muted">{count.toLocaleString()} txns</p>
      </div>
      <div className="ml-4 text-right">
        <p className={`font-mono text-base font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
          {fmt(balance)}
        </p>
        <div className={`status-dot ml-auto mt-1 ${isPositive ? 'cleared' : 'pending'}`} />
      </div>
    </div>
  )
}

function CategoryRow({ category, total, count, max }) {
  const pct = max > 0 ? Math.abs(total / max) * 100 : 0
  const isOutflow = total < 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-text-secondary">{category}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-muted">{count} txns</span>
          <span className={`font-mono text-xs font-medium ${isOutflow ? 'text-danger' : 'text-success'}`}>
            {fmt(total)}
          </span>
        </div>
      </div>
      <div className="h-1 w-full rounded-full bg-bg-hover">
        <div
          className={`h-1 rounded-full transition-all ${isOutflow ? 'bg-danger' : 'bg-success'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

function RiskAlerts({ transactions }) {
  const alerts = []
  const now = Date.now()

  for (const tx of transactions) {
    // Large transactions > $10k
    if (Math.abs(tx.amount) > 10_000) {
      alerts.push({
        level: 'warn',
        msg: `Large transaction: ${fmt(tx.amount)} — ${tx.description?.slice(0, 40)}`,
      })
    }
  }

  // Pending reconciliation older than 30 days
  const oldPending = transactions.filter((tx) => {
    if (tx._reconcile?.status === 'cleared') return false
    if (!tx.dateISO) return false
    return now - new Date(tx.dateISO).getTime() > 30 * 86_400_000
  })
  if (oldPending.length > 0) {
    alerts.push({
      level: 'info',
      msg: `${oldPending.length} transactions unreconciled for >30 days`,
    })
  }

  if (!alerts.length) return null

  return (
    <div className="card space-y-2">
      <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">Risk Alerts</p>
      {alerts.slice(0, 5).map((a, i) => (
        <div key={i} className="flex items-start gap-2">
          <span
            className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
              a.level === 'warn' ? 'bg-warning' : 'bg-teal'
            }`}
          />
          <p className="font-mono text-xs text-text-secondary">{a.msg}</p>
        </div>
      ))}
      {alerts.length > 5 && (
        <p className="font-mono text-xs text-text-muted">+{alerts.length - 5} more…</p>
      )}
    </div>
  )
}

function WeeklyCashFlow({ transactions }) {
  // Group by week, last 13 weeks
  const byWeek = new Map()
  const now = new Date()
  for (let w = 12; w >= 0; w--) {
    const d = new Date(now)
    d.setDate(d.getDate() - w * 7)
    const key = `W${String(d.getMonth() + 1).padStart(2, '0')}/${d.getDate()}`
    byWeek.set(key, { inflow: 0, outflow: 0 })
  }

  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - 91)

  for (const tx of transactions) {
    const d = tx.dateISO ? new Date(tx.dateISO) : new Date(tx.date)
    if (isNaN(d) || d < cutoff) continue
    const weeksAgo = Math.floor((now - d) / (7 * 86_400_000))
    if (weeksAgo > 12) continue
    const target = new Date(now)
    target.setDate(target.getDate() - weeksAgo * 7)
    const key = `W${String(target.getMonth() + 1).padStart(2, '0')}/${target.getDate()}`
    const bucket = byWeek.get(key)
    if (bucket) {
      if (tx.amount > 0) bucket.inflow += tx.amount
      else bucket.outflow += Math.abs(tx.amount)
    }
  }

  const weeks = [...byWeek.entries()]
  const maxVal = Math.max(...weeks.map(([, v]) => Math.max(v.inflow, v.outflow)), 1)

  return (
    <div className="card">
      <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-text-muted">
        13-Week Cash Flow
      </p>
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {weeks.map(([label, { inflow, outflow }]) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="flex w-full flex-col items-center justify-end gap-px" style={{ height: 72 }}>
              <div
                className="w-full rounded-sm bg-success/70"
                style={{ height: `${(inflow / maxVal) * 100}%`, minHeight: inflow > 0 ? 2 : 0 }}
              />
              <div
                className="w-full rounded-sm bg-danger/70"
                style={{ height: `${(outflow / maxVal) * 100}%`, minHeight: outflow > 0 ? 2 : 0 }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-4">
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

export default function Dashboard() {
  const { isAuthed, config } = useAuth()
  const { transactions, isLoadingCache, isSyncing, syncError, sync, autoSync } = useTransactions(config, isAuthed)
  const { filtered, datePreset, setDatePreset, filters, updateFilter } = useFilters(transactions)
  const { byAccount, byCategory, summary } = useAggregates(filtered)
  const [rowCount, setRowCount] = useState(null)

  useEffect(() => {
    getMeta('rowCount').then((n) => n && setRowCount(n))
  }, [transactions.length])

  // Trigger auto-sync if needed
  useEffect(() => { autoSync() }, [isAuthed])

  if (!config) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
            <span className="font-headline text-2xl text-gold">T</span>
          </div>
          <h2 className="mb-2 font-headline text-lg text-text-primary">Connect your Google Sheet</h2>
          <p className="mb-4 font-body text-sm text-text-secondary">
            Configure your Google OAuth2 Client ID and Spreadsheet ID in Settings to get started.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-sm text-center">
          <p className="mb-4 font-body text-sm text-text-secondary">
            Sign in with Google to load your transaction data.
          </p>
          {syncError && (
            <p className="font-mono text-xs text-danger">{syncError.message}</p>
          )}
        </div>
      </div>
    )
  }

  const isLoading = isLoadingCache || (isSyncing && transactions.length === 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-20 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-48 skeleton" />
          ))}
        </div>
      </div>
    )
  }

  const topOutflows = [...byCategory]
    .filter((c) => c.total < 0)
    .sort((a, b) => a.total - b.total)
    .slice(0, 8)

  const maxOutflow = topOutflows.length ? Math.abs(topOutflows[0].total) : 1

  return (
    <div className="space-y-4">
      {/* Date Filter */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Net Cash"
          value={summary ? fmt(summary.net) : '—'}
          sub={rowCount ? `${Number(rowCount).toLocaleString()} transactions` : undefined}
          accent={summary?.net >= 0 ? 'teal' : 'red'}
        />
        <KpiCard
          label="Total Inflows"
          value={summary ? fmt(summary.inflows) : '—'}
          accent="green"
        />
        <KpiCard
          label="Total Outflows"
          value={summary ? fmt(summary.outflows) : '—'}
          accent="red"
        />
        <KpiCard
          label="Accounts"
          value={byAccount.length}
          sub={`${filtered.length.toLocaleString()} txns`}
          accent="gold"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Cash by Account */}
        <div className="space-y-2 lg:col-span-1">
          <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
            Cash by Account
          </p>
          {byAccount.length === 0 ? (
            <div className="card text-center text-xs text-text-muted">No account data</div>
          ) : (
            byAccount.map((a) => (
              <AccountCard key={a.account} {...a} />
            ))
          )}
        </div>

        {/* 13-week chart + risk */}
        <div className="space-y-3 lg:col-span-1">
          <WeeklyCashFlow transactions={filtered} />
          <RiskAlerts transactions={filtered} />
        </div>

        {/* Category breakdown */}
        <div className="card lg:col-span-1">
          <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-text-muted">
            Top Outflows by Category
          </p>
          {topOutflows.length === 0 ? (
            <p className="text-xs text-text-muted">No outflow data</p>
          ) : (
            <div className="space-y-3">
              {topOutflows.map((c) => (
                <CategoryRow key={c.category} {...c} max={maxOutflow} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sync error banner */}
      {syncError && (
        <div className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-2">
          <p className="font-mono text-xs text-danger">{syncError.message}</p>
          <button onClick={sync} className="btn-ghost text-xs">Retry</button>
        </div>
      )}
    </div>
  )
}

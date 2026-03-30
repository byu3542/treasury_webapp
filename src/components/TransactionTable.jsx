import { useCallback, useRef, useState, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useAuth } from '../hooks/useAuth.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { useFilters } from '../hooks/useFilters.js'
import { setReconcile, getAllReconciliation } from '../services/db.js'
import { useQueryClient } from '@tanstack/react-query'

const ROW_HEIGHT = 44

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`
}

// ─── Filter Bar ──────────────────────────────────────────────────────────────

function FilterBar({ filters, updateFilter, resetFilters, hasActiveFilters, categories, accounts }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-bg-border bg-bg-surface p-3">
      {/* Search */}
      <div className="relative min-w-[180px] flex-1">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          placeholder="Search transactions…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="input pl-8 text-xs"
        />
      </div>

      {/* Category */}
      <select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="select w-36 text-xs"
      >
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Account */}
      <select
        value={filters.account}
        onChange={(e) => updateFilter('account', e.target.value)}
        className="select w-36 text-xs"
      >
        <option value="">All Accounts</option>
        {accounts.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>

      {/* Date range */}
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => updateFilter('dateFrom', e.target.value)}
        className="input w-36 text-xs"
        title="From date"
      />
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => updateFilter('dateTo', e.target.value)}
        className="input w-36 text-xs"
        title="To date"
      />

      {/* Reconcile status */}
      <select
        value={filters.reconcileStatus}
        onChange={(e) => updateFilter('reconcileStatus', e.target.value)}
        className="select w-36 text-xs"
      >
        <option value="all">All Status</option>
        <option value="cleared">Cleared</option>
        <option value="pending">Pending</option>
        <option value="unreconciled">Unreconciled</option>
      </select>

      {hasActiveFilters && (
        <button onClick={resetFilters} className="btn-ghost text-xs">
          Clear filters
        </button>
      )}
    </div>
  )
}

// ─── Table Header ─────────────────────────────────────────────────────────────

function TableHeader() {
  return (
    <div className="flex items-center border-b border-bg-border bg-bg-surface px-3 py-2">
      <div className="w-5 flex-shrink-0" /> {/* reconcile checkbox col */}
      <div className="w-20 flex-shrink-0 font-mono text-2xs uppercase tracking-widest text-text-muted">Date</div>
      <div className="min-w-0 flex-1 font-mono text-2xs uppercase tracking-widest text-text-muted">Description</div>
      <div className="w-32 flex-shrink-0 font-mono text-2xs uppercase tracking-widest text-text-muted">Category</div>
      <div className="w-28 flex-shrink-0 font-mono text-2xs uppercase tracking-widest text-text-muted">Account</div>
      <div className="w-28 flex-shrink-0 text-right font-mono text-2xs uppercase tracking-widest text-text-muted">Amount</div>
      <div className="w-8 flex-shrink-0" /> {/* status dot col */}
    </div>
  )
}

// ─── Virtual Row ──────────────────────────────────────────────────────────────

function TxRow({ index, style, data }) {
  const { items, reconcileMap, onToggleReconcile } = data
  const tx = items[index]
  if (!tx) return null

  const reconcile = reconcileMap.get(tx.id)
  const status = reconcile?.status ?? 'unreconciled'
  const isCleared = status === 'cleared'
  const isPending = status === 'pending'
  const isPositive = tx.amount > 0

  return (
    <div
      style={style}
      className={`tx-row px-3 ${isCleared ? 'reconciled' : ''}`}
    >
      {/* Reconcile checkbox */}
      <div className="w-5 flex-shrink-0">
        <input
          type="checkbox"
          checked={isCleared}
          onChange={() => onToggleReconcile(tx.id, status)}
          className="h-3 w-3 cursor-pointer accent-teal"
          title={isCleared ? 'Mark unreconciled' : 'Mark cleared'}
        />
      </div>

      {/* Date */}
      <div className="w-20 flex-shrink-0 font-mono text-xs text-text-muted">
        {fmtDate(tx.dateISO || tx.date)}
      </div>

      {/* Description */}
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate font-body text-xs text-text-primary">{tx.description || '—'}</p>
        {tx.fullDescription && tx.fullDescription !== tx.description && (
          <p className="truncate font-mono text-2xs text-text-muted">{tx.fullDescription}</p>
        )}
      </div>

      {/* Category */}
      <div className="w-32 flex-shrink-0 pr-2">
        {tx.category ? (
          <span className="badge-muted truncate max-w-full">{tx.category}</span>
        ) : (
          <span className="font-mono text-2xs text-text-muted">—</span>
        )}
      </div>

      {/* Account */}
      <div className="w-28 flex-shrink-0 pr-2">
        <p className="truncate font-mono text-2xs text-text-muted">{tx.account || '—'}</p>
      </div>

      {/* Amount */}
      <div className="w-28 flex-shrink-0 text-right">
        <span className={`font-mono text-xs font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
          {fmt(tx.amount)}
        </span>
      </div>

      {/* Status dot */}
      <div className="w-8 flex-shrink-0 flex justify-center">
        <span
          className={`status-dot ${isCleared ? 'cleared' : isPending ? 'pending' : 'unreconciled'}`}
          title={status}
        />
      </div>
    </div>
  )
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ filtered, total }) {
  const inflows = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const outflows = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const net = inflows + outflows

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-bg-border bg-bg-surface px-4 py-2">
      <span className="font-mono text-2xs text-text-muted">
        {filtered.length.toLocaleString()} of {total.toLocaleString()} rows
      </span>
      <span className="font-mono text-2xs text-text-muted">
        Inflows: <span className="text-success">{fmt(inflows)}</span>
      </span>
      <span className="font-mono text-2xs text-text-muted">
        Outflows: <span className="text-danger">{fmt(outflows)}</span>
      </span>
      <span className="font-mono text-2xs text-text-muted">
        Net: <span className={net >= 0 ? 'text-teal' : 'text-danger'}>{fmt(net)}</span>
      </span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TransactionTable() {
  const { isAuthed, config } = useAuth()
  const { transactions, isLoadingCache, isSyncing, syncError, sync } = useTransactions(config, isAuthed)
  const { filters, filtered, updateFilter, resetFilters, hasActiveFilters, categories, accounts } = useFilters(transactions)
  const [reconcileMap, setReconcileMap] = useState(new Map())
  const queryClient = useQueryClient()

  // Load reconcile state from IndexedDB
  useEffect(() => {
    getAllReconciliation().then(setReconcileMap)
  }, [transactions])

  const handleToggleReconcile = useCallback(async (id, currentStatus) => {
    const newStatus = currentStatus === 'cleared' ? 'unreconciled' : 'cleared'
    await setReconcile(id, newStatus)
    setReconcileMap((prev) => {
      const next = new Map(prev)
      next.set(id, { id, status: newStatus, date: new Date().toISOString() })
      return next
    })
    // Invalidate cache so dashboard reconciliation rate refreshes
    queryClient.invalidateQueries({ queryKey: ['transactions', 'cache'] })
  }, [queryClient])

  const itemData = { items: filtered, reconcileMap, onToggleReconcile: handleToggleReconcile }

  if (!config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-body text-sm text-text-muted">Configure Google Sheets in Settings to view transactions.</p>
      </div>
    )
  }

  if (!isAuthed) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-body text-sm text-text-muted">Sign in to view transactions.</p>
      </div>
    )
  }

  const isLoading = isLoadingCache || (isSyncing && transactions.length === 0)

  return (
    <div className="flex h-full flex-col gap-3" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Filter bar */}
      <FilterBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
        accounts={accounts}
      />

      {/* Table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-bg-border">
        <TableHeader />

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-bg-border border-t-gold" />
              <p className="font-mono text-xs text-text-muted">
                {isSyncing ? 'Syncing from Google Sheets…' : 'Loading…'}
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">
              {hasActiveFilters ? 'No transactions match the current filters.' : 'No transactions loaded.'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={filtered.length}
                  itemSize={ROW_HEIGHT}
                  itemData={itemData}
                  overscanCount={10}
                >
                  {TxRow}
                </List>
              )}
            </AutoSizer>
          </div>
        )}

        {/* Summary bar */}
        <SummaryBar filtered={filtered} total={transactions.length} />
      </div>

      {/* Sync error */}
      {syncError && (
        <div className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-2">
          <p className="font-mono text-xs text-danger">{syncError.message}</p>
          <button onClick={sync} className="btn-ghost text-xs">Retry</button>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTransactions } from '../hooks/useTransactions'
import { useDateFilter } from '../hooks/useDateFilter'
import { formatCurrency, formatDate, formatTime, formatStatus } from '../utils/formatters'
import { exportTransactionsToCSV } from '../utils/csvExport'
import DateFilterControl from '../components/Common/DateFilterControl'
import './Transactions.css'

export default function Transactions() {
  const { isAuthed, config } = useAuth()
  const { transactions } = useTransactions(config, isAuthed)
  const { selectedRange, startDate, endDate, handleRangeChange, getMinDateFromTransactions } = useDateFilter('last30', transactions)

  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  // Sorting state
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  // Get unique accounts and statuses
  const uniqueAccounts = useMemo(() => {
    const accounts = new Set(transactions.map(t => t.account).filter(Boolean))
    return Array.from(accounts).sort()
  }, [transactions])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(transactions.map(t => t.status).filter(Boolean))
    return Array.from(statuses).sort()
  }, [transactions])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Date range filter (preset or manual)
      const txDate = new Date(tx.dateISO || tx.date)
      if (txDate < startDate || txDate > endDate) return false

      // Manual date filter (if specified)
      if (dateFrom) {
        const txDateStr = new Date(tx.dateISO || tx.date).toISOString().split('T')[0]
        if (txDateStr < dateFrom) return false
      }
      if (dateTo) {
        const txDateStr = new Date(tx.dateISO || tx.date).toISOString().split('T')[0]
        if (txDateStr > dateTo) return false
      }

      // Account filter
      if (selectedAccount !== 'all' && tx.account !== selectedAccount) return false

      // Status filter
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matches = (
          (tx.description && tx.description.toLowerCase().includes(searchLower)) ||
          (tx.account && tx.account.toLowerCase().includes(searchLower)) ||
          (tx.transactionId && tx.transactionId.toLowerCase().includes(searchLower))
        )
        if (!matches) return false
      }

      return true
    })
  }, [transactions, startDate, endDate, dateFrom, dateTo, selectedAccount, selectedStatus, searchTerm])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let aValue, bValue

      if (sortBy === 'date') {
        aValue = new Date(a.dateISO || a.date).getTime()
        bValue = new Date(b.dateISO || b.date).getTime()
      } else if (sortBy === 'amount') {
        aValue = a.amount || 0
        bValue = b.amount || 0
      } else if (sortBy === 'description') {
        aValue = (a.description || '').toLowerCase()
        bValue = (b.description || '').toLowerCase()
      } else {
        return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredTransactions, sortBy, sortOrder])

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedTransactions.slice(start, end)
  }, [sortedTransactions, currentPage, pageSize])

  const totalPages = Math.ceil(sortedTransactions.length / pageSize)
  const totalFiltered = filteredTransactions.length
  const totalAll = transactions.length

  // Handle sorting header click
  const handleHeaderClick = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }, [sortBy, sortOrder])

  // Handle export
  const handleExport = useCallback(async () => {
    const filters = {
      dateFrom,
      dateTo,
      account: selectedAccount === 'all' ? null : selectedAccount,
      status: selectedStatus === 'all' ? null : selectedStatus,
      search: searchTerm || null,
    }
    try {
      await exportTransactionsToCSV(filteredTransactions, {
        filename: `UTOPIA_Transactions_${new Date().toISOString().split('T')[0]}.csv`,
        filters,
      })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export transactions. Please try again.')
    }
  }, [filteredTransactions, dateFrom, dateTo, selectedAccount, selectedStatus, searchTerm])

  if (!isAuthed || !config) {
    return (
      <div className="transactions-placeholder">
        <p>Configure Google Sheets and sign in to view transactions.</p>
      </div>
    )
  }

  return (
    <div className="transactions-page">
      {/* Page Header */}
      <div className="transactions-header">
        <h1 className="page-title">Transaction Ledger</h1>
        <p className="page-subtitle">Complete record of all institutional cash movements</p>
      </div>

      {/* Date Filter Control */}
      <DateFilterControl
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        allTimeStartDate={getMinDateFromTransactions()}
      />

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-section">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Transaction ID, description, account..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value)
                setCurrentPage(1)
              }}
              className="filter-select"
            >
              <option value="all">All Accounts</option>
              {uniqueAccounts.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setSelectedAccount('all')
                setSelectedStatus('all')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </button>
            <button
              className="btn-secondary"
              onClick={handleExport}
              disabled={totalFiltered === 0}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, totalFiltered)}</strong> to{' '}
          <strong>{Math.min(currentPage * pageSize, totalFiltered)}</strong> of{' '}
          <strong>{totalFiltered}</strong> transaction{totalFiltered !== 1 ? 's' : ''}
          {totalFiltered < totalAll && (
            <>
              {' '}(filtered from <strong>{totalAll}</strong> total)
            </>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      {paginatedTransactions.length > 0 ? (
        <div className="transactions-table">
          <div className="table-header">
            <div
              className="header-cell header-date"
              onClick={() => handleHeaderClick('date')}
            >
              DATE & TIME
              {sortBy === 'date' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </div>
            <div className="header-cell header-txn-id">TXN ID</div>
            <div className="header-cell header-description">DESCRIPTION</div>
            <div className="header-cell header-account">ACCOUNT</div>
            <div className="header-cell header-category">CATEGORY</div>
            <div className="header-cell header-status">STATUS</div>
            <div
              className="header-cell header-amount"
              onClick={() => handleHeaderClick('amount')}
            >
              AMOUNT
              {sortBy === 'amount' && <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </div>

          {paginatedTransactions.map((tx, i) => (
            <div key={i} className="table-row">
              <div className="cell cell-date">
                <div className="date-value">{formatDate(tx.dateISO || tx.date)}</div>
                <div className="time-value">{formatTime(tx.dateISO || tx.date)}</div>
              </div>
              <div className="cell cell-txn-id">
                <code>{tx.transactionId || '—'}</code>
              </div>
              <div className="cell cell-description">
                {tx.description || '—'}
              </div>
              <div className="cell cell-account">
                {tx.account || '—'}
              </div>
              <div className="cell cell-category">
                {tx.category || '—'}
              </div>
              <div className={`cell cell-status status-${tx.status?.toLowerCase() || 'unknown'}`}>
                {formatStatus(tx.status)}
              </div>
              <div className={`cell cell-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No transactions found matching your filters.</p>
          {totalAll === 0 ? (
            <p className="empty-subtext">Import transactions to get started.</p>
          ) : (
            <p className="empty-subtext">Try adjusting your filter criteria.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-ghost-small"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>

          <button
            className="btn-ghost-small"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

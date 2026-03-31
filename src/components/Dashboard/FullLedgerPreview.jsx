import { formatDate, formatTime, formatCurrency } from '../../utils/formatters'
import './FullLedgerPreview.css'

export default function FullLedgerPreview({ transactions = [] }) {
  const recentTx = transactions.slice(0, 5)

  if (!recentTx || recentTx.length === 0) {
    return (
      <div className="ledger-preview">
        <div className="table-empty">No transactions</div>
      </div>
    )
  }

  return (
    <div className="ledger-preview">
      {recentTx.map((tx, i) => (
        <div key={i} className="ledger-row">
          <div className="row-date">
            <div>{formatDate(tx.dateISO || tx.date)}</div>
            <div className="row-time">{formatTime(tx.dateISO || tx.date)}</div>
          </div>
          <div className="row-description truncate">{tx.description || '—'}</div>
          <div className={`row-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(tx.amount)}
          </div>
        </div>
      ))}
      <div className="ledger-footer">
        <a href="/transactions" className="view-link">View Full Ledger →</a>
      </div>
    </div>
  )
}

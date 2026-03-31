import { formatCurrency, formatStatus } from '../../utils/formatters'
import './InstitutionalActivityTable.css'

export default function InstitutionalActivityTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="activity-table">
        <div className="table-empty">No institutional activity</div>
      </div>
    )
  }

  return (
    <div className="activity-table">
      {data.map((activity, i) => (
        <div key={i} className="activity-row">
          <div className="activity-icon">
            {activity.counterparty.charAt(0).toUpperCase()}
          </div>
          <div className="activity-details">
            <div className="activity-counterparty">{activity.counterparty}</div>
            <div className="activity-repository">{activity.repository}</div>
          </div>
          <div className={`activity-status status-${activity.latestStatus?.toLowerCase()}`}>
            {formatStatus(activity.latestStatus)}
          </div>
          <div className="activity-amount">
            {formatCurrency(activity.latestAmount)}
          </div>
        </div>
      ))}
    </div>
  )
}

import { formatCurrency, formatPercentage } from '../../utils/formatters'
import './DashboardKPICard.css'

export default function DashboardKPICard({ title, value, trend, accounts, variant }) {
  const getTrendIcon = () => trend > 0 ? '↗️' : '↘️'
  const getTrendColor = () => trend > 0 ? 'success' : 'error'

  return (
    <div className={`kpi-card kpi-${variant}`}>
      <div className="kpi-label">{title}</div>
      <div className="kpi-value">
        {variant === 'info' ? value : formatCurrency(value, true)}
      </div>
      {variant !== 'info' && trend !== undefined && (
        <div className={`kpi-trend trend-${getTrendColor()}`}>
          {getTrendIcon()} {formatPercentage(trend)}
        </div>
      )}
      {accounts && (
        <div className="kpi-accounts">
          {accounts.map((acc) => (
            <div key={acc} className="account-avatar">
              {acc.charAt(0).toUpperCase()}
            </div>
          ))}
          {accounts.length < value && (
            <div className="account-avatar overflow">+{value - accounts.length}</div>
          )}
        </div>
      )}
      <div className={`kpi-bar kpi-bar-${variant}`} />
    </div>
  )
}

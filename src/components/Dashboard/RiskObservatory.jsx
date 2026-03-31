import './RiskObservatory.css'
import { formatDistanceToNow } from '../../utils/formatters'

export default function RiskObservatory({ alerts = [] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="risk-observatory">
        <h3 className="panel-title">RISK OBSERVATORY</h3>
        <div className="risk-empty">No alerts at this time</div>
      </div>
    )
  }

  return (
    <div className="risk-observatory">
      <h3 className="panel-title">RISK OBSERVATORY</h3>
      <div className="alerts-list">
        {alerts.slice(0, 3).map((alert, i) => (
          <div key={i} className={`alert alert-${alert.severity}`}>
            <div className="alert-icon">
              {alert.severity === 'critical' ? '🔴' : '⚠️'}
            </div>
            <div className="alert-content">
              <div className="alert-type">{alert.type.replace(/_/g, ' ')}</div>
              <p className="alert-message">{alert.message}</p>
            </div>
            <div className="alert-time">
              {formatDistanceToNow(alert.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

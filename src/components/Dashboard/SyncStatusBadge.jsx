import './SyncStatusBadge.css'

/**
 * Sync status indicator badge with polling indicator
 */
export default function SyncStatusBadge({ status, label, message, onSync, isSyncing }) {
  const getStatusColor = () => {
    switch (status) {
      case 'live':
        return 'live'
      case 'syncing':
        return 'syncing'
      case 'stale':
        return 'stale'
      default:
        return 'stale'
    }
  }

  return (
    <div className={`sync-badge ${getStatusColor()}`}>
      <div className={`sync-dot ${isSyncing ? 'spinning' : ''}`} />
      <div className="sync-content">
        <div className="sync-label">SYNC STATUS: {label}</div>
        <div className="sync-message">{message}</div>
      </div>
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="sync-button"
        title="Sync with Google Sheets"
      >
        {isSyncing ? (
          <svg className="sync-icon spinning" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 5.414 1 1 0 11-1.414-1.414A5.002 5.002 0 005.101 5H7a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.364 13.414a1 1 0 011.414-1.414A5.002 5.002 0 0014.899 15H13a1 1 0 110-2h3a1 1 0 011 1v2a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-9.414-5.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="sync-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 5.414 1 1 0 11-1.414-1.414A5.002 5.002 0 005.101 5H7a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.364 13.414a1 1 0 011.414-1.414A5.002 5.002 0 0014.899 15H13a1 1 0 110-2h3a1 1 0 011 1v2a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-9.414-5.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  )
}

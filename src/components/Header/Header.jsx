import { useState } from 'react'
import './Header.css'

/**
 * Enterprise Header Component
 * Sticky top navigation with search, notifications, and user profile
 */
export default function Header({ config, isAuthed, isSyncing, onSync }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-content">
        {/* Left: Logo & Title */}
        <div className="header-left">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
          <div className="logo-text">
            <h1 className="logo-title">Sovereign</h1>
            <p className="logo-subtitle">Treasury Command Center</p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className={`header-search ${searchOpen ? 'active' : ''}`}>
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search ledger…"
            className="search-input"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>

        {/* Right: Icons & Profile */}
        <div className="header-right">
          {/* Sync Status */}
          {isAuthed && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="icon-button"
              title="Sync with Google Sheets"
            >
              {isSyncing ? (
                <svg className="icon-spinner" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 5.414 1 1 0 11-1.414-1.414A5.002 5.002 0 005.101 5H7a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.364 13.414a1 1 0 011.414-1.414A5.002 5.002 0 0014.899 15H13a1 1 0 110-2h3a1 1 0 011 1v2a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-9.414-5.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 5.414 1 1 0 11-1.414-1.414A5.002 5.002 0 005.101 5H7a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.364 13.414a1 1 0 011.414-1.414A5.002 5.002 0 0014.899 15H13a1 1 0 110-2h3a1 1 0 011 1v2a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-9.414-5.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

          {/* Notifications */}
          <button className="icon-button" title="Notifications">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span className="notification-dot" />
          </button>

          {/* Help */}
          <button className="icon-button" title="Help">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Settings */}
          <button className="icon-button" title="Settings">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>

          {/* User Profile */}
          <div className="profile-avatar" title="User Profile">
            {config?.userName ? config.userName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

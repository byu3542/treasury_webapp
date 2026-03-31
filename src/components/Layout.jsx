import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { getMeta } from '../services/db.js'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
  { id: 'transactions', label: 'Transactions', icon: TxIcon },
  { id: 'reconciliation', label: 'Reconciliation', icon: ReconIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartIcon },
  { id: 'settings', label: 'Settings', icon: GearIcon },
]

function DashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5zm6-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7zm6-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4z" />
    </svg>
  )
}
function TxIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4 4a2 2 0 0 0-2 2v1h16V6a2 2 0 0 0-2-2H4zm14 5H2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zm-6 4H6v-1h6v1zm2-1h2v1h-2v-1z" clipRule="evenodd" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10zm8-5a.75.75 0 0 1 .75.75v4.5l3 1.5a.75.75 0 1 1-.67 1.34l-3.33-1.667A.75.75 0 0 1 9.25 10V5.75A.75.75 0 0 1 10 5z" />
    </svg>
  )
}
function ReconIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
}
function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" clipRule="evenodd" />
    </svg>
  )
}

function SyncBadge({ isSyncing, lastSync, onSync }) {
  return (
    <div className="flex items-center gap-2">
      {lastSync && (
        <span className="hidden font-mono text-2xs text-text-muted sm:block">
          synced {new Date(lastSync).toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="flex items-center gap-1.5 rounded-lg border border-bg-border px-2.5 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        title="Sync from Google Sheets"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        {isSyncing ? 'Syncing…' : 'Sync'}
      </button>
    </div>
  )
}

export default function Layout({ activeTab, onTabChange, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const { isAuthed, config, authError, isAuthLoading, signIn, signOut } = useAuth()
  const { isSyncing, sync, autoSync } = useTransactions(config, isAuthed)

  useEffect(() => {
    getMeta('lastSync').then((v) => setLastSync(v))
  }, [isSyncing])

  // Trigger auto-sync when auth + config become available
  useEffect(() => {
    if (isAuthed && config?.spreadsheetId) autoSync()
  }, [isAuthed, config?.spreadsheetId])

  // Auto-sync every 5 min
  useEffect(() => {
    if (!isAuthed) return
    const id = setInterval(() => { if (isAuthed) sync() }, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [isAuthed])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-bg-border bg-bg-surface transition-all duration-200 ${
          sidebarOpen ? 'w-52' : 'w-14'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-bg-border px-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gold/15">
            <span className="font-mono text-xs font-medium text-gold">T</span>
          </div>
          {sidebarOpen && (
            <span className="font-headline text-sm font-semibold text-text-primary">Treasury</span>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text-secondary"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              {sidebarOpen ? (
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`nav-item w-full ${activeTab === id ? 'active' : ''}`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Auth area */}
        <div className="border-t border-bg-border p-2">
          {isAuthed ? (
            <button
              onClick={signOut}
              className="nav-item w-full text-text-muted"
              title={!sidebarOpen ? 'Sign out' : undefined}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
                <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 0-2H4V5h7a1 1 0 0 0 0-2H3zm10.293 4.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L14.586 11H9a1 1 0 0 1 0-2h5.586l-1.293-1.293a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
              </svg>
              {sidebarOpen && <span>Sign out</span>}
            </button>
          ) : (
            <button
              onClick={signIn}
              disabled={isAuthLoading || !config}
              className="nav-item w-full text-gold disabled:cursor-not-allowed disabled:opacity-40"
              title={!sidebarOpen ? 'Sign in with Google' : undefined}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
                <path fillRule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clipRule="evenodd" />
              </svg>
              {sidebarOpen && <span>{isAuthLoading ? 'Signing in…' : 'Sign in'}</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-bg-border bg-bg-surface px-4">
          <div>
            <h1 className="font-headline text-base font-semibold text-text-primary">
              {NAV.find((n) => n.id === activeTab)?.label ?? 'Treasury'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {authError && (
              <span className="hidden font-mono text-xs text-danger sm:block" title={authError}>
                Auth error
              </span>
            )}
            {!isAuthed && config && (
              <button onClick={signIn} className="btn-primary text-xs">
                Connect Google Sheets
              </button>
            )}
            {!config && (
              <button onClick={() => onTabChange('settings')} className="btn-ghost text-xs">
                Configure →
              </button>
            )}
            {isAuthed && (
              <SyncBadge isSyncing={isSyncing} lastSync={lastSync} onSync={sync} />
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}

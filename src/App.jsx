import { useState, useEffect } from 'react'
import Layout from './components/Layout.jsx'
import Dashboard from './components/Dashboard.jsx'
import TransactionTable from './components/TransactionTable.jsx'
import Analytics from './components/Analytics.jsx'
import Reconciliation from './components/Reconciliation.jsx'
import Settings from './components/Settings.jsx'
import { useAuth } from './hooks/useAuth.js'
import { initDB } from './services/db.js'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dbReady, setDbReady] = useState(false)
  const { isAuthed, config } = useAuth()

  useEffect(() => {
    initDB().then(() => setDbReady(true)).catch(console.error)
  }, [])

  const tabs = {
    dashboard: <Dashboard />,
    transactions: <TransactionTable />,
    reconciliation: <Reconciliation />,
    analytics: <Analytics />,
    settings: <Settings />,
  }

  if (!dbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-bg-border border-t-gold" />
          <p className="font-mono text-sm text-text-secondary">Initializing database…</p>
        </div>
      </div>
    )
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} isAuthed={isAuthed} config={config}>
      {tabs[activeTab]}
    </Layout>
  )
}

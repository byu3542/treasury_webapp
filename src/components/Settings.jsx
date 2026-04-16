import { useState, useEffect } from 'react'
import { getMeta, setMeta, clearAllCaches, countTransactions } from '../services/db.js'
import { useAuth } from '../hooks/useAuth.js'
import { useQueryClient } from '@tanstack/react-query'

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-xs font-medium text-text-secondary">{label}</label>
      {children}
      {hint && <p className="font-mono text-2xs text-text-muted">{hint}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card space-y-4">
      <h3 className="font-headline text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

export default function Settings() {
  const { config, refreshConfig, signIn, isAuthed, signOut } = useAuth()
  const queryClient = useQueryClient()

  const [clientId, setClientId] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [sheetName, setSheetName] = useState('Sheet1')
  const [saved, setSaved] = useState(false)
  const [cacheCount, setCacheCount] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState('')

  // Load existing config from IndexedDB
  useEffect(() => {
    Promise.all([
      getMeta('clientId'),
      getMeta('spreadsheetId'),
      getMeta('sheetName'),
    ]).then(([c, s, n]) => {
      if (c) setClientId(c)
      if (s) setSpreadsheetId(s)
      if (n) setSheetName(n)
    })
    countTransactions().then(setCacheCount)
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    await Promise.all([
      setMeta('clientId', clientId.trim()),
      setMeta('spreadsheetId', spreadsheetId.trim()),
      setMeta('sheetName', sheetName.trim() || 'Sheet1'),
    ])
    await refreshConfig()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleClearCache() {
    setClearing(true)
    setClearMsg('')
    await clearAllCaches()
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    const count = await countTransactions()
    setCacheCount(count)
    setClearMsg('Cache cleared. Sync again to reload data.')
    setClearing(false)
  }

  const extractSheetId = (input) => {
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : input
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Step 1: Google Cloud setup */}
      <Section title="1. Google Cloud Setup">
        <div className="space-y-2 rounded-lg bg-bg-hover p-3">
          <p className="font-mono text-xs text-text-secondary">Follow these steps once to enable the API:</p>
          <ol className="list-inside list-decimal space-y-1.5 font-mono text-xs text-text-muted">
            <li>Go to <span className="text-terracotta">console.cloud.google.com</span></li>
            <li>Create a project → Enable <strong className="text-text-secondary">Google Sheets API</strong></li>
            <li>Go to <strong className="text-text-secondary">APIs & Services → Credentials</strong></li>
            <li>Create <strong className="text-text-secondary">OAuth 2.0 Client ID</strong> (Web application type)</li>
            <li>
              Add your domain to <strong className="text-text-secondary">Authorized JavaScript origins</strong>
              <br />
              <span className="text-terracotta">{window.location.origin}</span>
            </li>
            <li>Copy the <strong className="text-text-secondary">Client ID</strong> below</li>
          </ol>
        </div>
      </Section>

      {/* Step 2: Configuration form */}
      <Section title="2. Connection Settings">
        <form onSubmit={handleSave} className="space-y-4">
          <Field
            label="Google OAuth2 Client ID"
            hint="Ends with .apps.googleusercontent.com"
          >
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="1234567890-abc123.apps.googleusercontent.com"
              className="input"
              required
            />
          </Field>

          <Field
            label="Google Spreadsheet ID (or URL)"
            hint="Paste the full URL or just the ID from the URL"
          >
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(extractSheetId(e.target.value))}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="input"
              required
            />
          </Field>

          <Field
            label="Sheet / Tab Name"
            hint="The tab name at the bottom of your spreadsheet (default: Sheet1)"
          >
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sheet1"
              className="input"
            />
          </Field>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">
              {saved ? '✓ Saved' : 'Save & Connect'}
            </button>
            {saved && (
              <p className="font-mono text-xs text-success">
                Settings saved. Click "Sign in" to authenticate.
              </p>
            )}
          </div>
        </form>
      </Section>

      {/* Step 3: Auth */}
      <Section title="3. Authentication">
        {isAuthed ? (
          <div className="flex items-center justify-between rounded-lg bg-success/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="font-mono text-xs text-success">Connected to Google Sheets</span>
            </div>
            <button onClick={signOut} className="btn-ghost text-xs">
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-mono text-xs text-text-muted">
              Click below to authenticate with Google. A popup will open asking you to grant
              read-only access to your spreadsheet.
            </p>
            <button
              onClick={signIn}
              disabled={!clientId}
              className="btn-primary"
            >
              Sign in with Google
            </button>
            {!clientId && (
              <p className="font-mono text-2xs text-warning">Save your Client ID first.</p>
            )}
          </div>
        )}
      </Section>

      {/* Cache management */}
      <Section title="Cache & Data">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-bg-hover px-4 py-3">
            <div>
              <p className="font-mono text-xs text-text-secondary">IndexedDB cache</p>
              <p className="font-mono text-2xs text-text-muted">
                {cacheCount === null ? 'Loading…' : `${Number(cacheCount).toLocaleString()} transactions stored`}
              </p>
            </div>
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="btn-danger text-xs"
            >
              {clearing ? 'Clearing…' : 'Clear Cache'}
            </button>
          </div>
          {clearMsg && (
            <p className="font-mono text-xs text-warning">{clearMsg}</p>
          )}
          <div className="rounded-lg bg-bg-hover px-4 py-3">
            <p className="font-mono text-xs text-text-secondary">Storage info</p>
            <p className="font-mono text-2xs text-text-muted">
              Using IndexedDB (no localStorage quota limits). Token stored in sessionStorage only.
            </p>
          </div>
        </div>
      </Section>

      {/* Data model reference */}
      <Section title="Expected Column Headers">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {[
            'M-Y', 'Date', 'Description', 'Category', 'Amount', 'Account',
            'Account #', 'Institution', 'Month', 'Week', 'Transaction ID',
            'Account ID', 'Check Number', 'Full Description', 'Metadata',
            'Date Added', 'Reconcile Date', 'Categorized Date',
          ].map((h) => (
            <span key={h} className="badge-muted text-2xs">{h}</span>
          ))}
        </div>
        <p className="font-mono text-2xs text-text-muted">
          Column order must match your sheet. Transaction ID is used as the unique key — if missing,
          a composite key is generated from date + description + amount.
        </p>
      </Section>
    </div>
  )
}

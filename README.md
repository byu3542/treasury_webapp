# Treasury Management Dashboard

A production-ready treasury management web app that syncs with Google Sheets, providing real-time cash visibility, transaction management, and financial analytics.

## Features

✅ **Real-time Cash Position** — Account balances, inflow/outflow summary
✅ **Transaction Management** — Virtual-scrolled table for 1000+ rows, full-text search, filters
✅ **Reconciliation Workflow** — Mark transactions as cleared/pending with audit trail
✅ **Financial Analytics** — Monthly cash flow, category trends, top outflows, reconciliation rate
✅ **Google Sheets Integration** — OAuth2 sync, read-only API v4, offline-capable
✅ **IndexedDB Storage** — No localStorage quota limits, handles 964+ transaction rows
✅ **Dark Mode Design** — Professional B2B finance UX with gold/teal accents
✅ **Responsive Layout** — Mobile, tablet, desktop support

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      React 18 App (Vite)                │
├─────────────────────────────────────────────────────────┤
│  Components:                                            │
│  • Layout / Sidebar / Header (navigation)              │
│  • Dashboard (KPI cards, charts, cash position)        │
│  • TransactionTable (virtual-scrolled, 60 FPS)         │
│  • Analytics (monthly flows, category trends)          │
│  • Settings (OAuth2 config, cache management)          │
├─────────────────────────────────────────────────────────┤
│  Hooks:                                                 │
│  • useAuth — Google OAuth2 + token lifecycle           │
│  • useTransactions — Sync from Sheets, cache to IDB    │
│  • useFilters — In-memory search/filter (< 500ms)      │
├─────────────────────────────────────────────────────────┤
│  Services:                                              │
│  • auth.js — Google Identity Services (GIS) client     │
│  • sheets.js — Google Sheets API v4 (OAuth Bearer)     │
│  • db.js — IndexedDB schema & operations               │
├─────────────────────────────────────────────────────────┤
│  Storage:                                               │
│  • IndexedDB — transactions, metadata, reconciliation   │
│  • sessionStorage — access token (cleared on tab close) │
│  • No localStorage — avoids quota exceeded errors       │
├─────────────────────────────────────────────────────────┤
│  Google Sheets API v4                                   │
│  └─ OAuth2 implicit flow → Bearer token in fetch()     │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd treasury_webapp
npm install
```

### 2. Google Cloud Setup (One-Time)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Google Sheets API**
3. Go to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add your domain to **Authorized JavaScript origins**:
   - `http://localhost:5173` (dev)
   - `https://yourdomain.com` (production)
6. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173, go to **Settings**, and enter:
- **Google OAuth2 Client ID** (from step 2.6)
- **Google Spreadsheet ID** (from your sheet URL)
- **Sheet Tab Name** (default: `Sheet1`)

Click **Sign in** and approve the OAuth popup.

### 4. Build & Deploy

```bash
npm run build
```

Deploy the `dist/` folder to GitHub Pages, Vercel, Netlify, or any static host.

**GitHub Pages (automatic via GitHub Actions):**
- Push to `main` → CI builds & deploys to `gh-pages` branch automatically

## Expected Google Sheet Format

Your sheet should have these columns (in order):

| M-Y | Date | Description | Category | Amount | Account | Account # | Institution | Month | Week | Transaction ID | Account ID | Check Number | Full Description | Metadata | Date Added | Reconcile Date | Categorized Date |
|-----|------|-------------|----------|--------|---------|-----------|-------------|-------|------|----------------|------------|--------------|------------------|----------|------------|----------------|------------------|

- **Date**: Parsed as ISO date for sorting
- **Amount**: Numeric (positive = inflow, negative = outflow)
- **Category**: Used for filtering & analytics
- **Account**: Cash position grouped by account
- **Transaction ID**: Unique identifier (generated if missing)

## Performance Targets

✅ Load 1000 rows: < 2 seconds
✅ Search 1000 rows: < 500ms (in-memory filter)
✅ Scroll performance: 60 FPS (react-window virtual scrolling)
✅ Filter by category: Instant (cached aggregates)
✅ Sync 1000 rows: ~5s (chunked at 200 rows/request)

## Key Libraries

| Package | Purpose | Why |
|---------|---------|-----|
| **React 18** | UI framework | Modern, stable, great ecosystem |
| **Vite** | Build tool | Fast dev server, optimized bundles |
| **@tanstack/react-query** | Data fetching | Caching, auto-retry, background sync |
| **idb** | IndexedDB wrapper | Cleaner API than raw IDB, < 1KB gzipped |
| **react-window** | Virtual scrolling | 60 FPS scroll for 1000+ rows |
| **date-fns** | Date utilities | Lightweight date parsing/formatting |
| **Tailwind CSS** | Styling | Dark mode, design tokens, responsive |

## Storage Strategy

### IndexedDB Schema

```javascript
// transactions: stores parsed transactions
{
  id: string (Transaction ID or composite key)
  date: string (ISO date)
  description: string
  category: string
  amount: number
  account: string
  accountNumber: string
  institution: string
  month: string
  week: string
  accountId: string
  checkNumber: string
  fullDescription: string
  metadata: string
  dateAdded: string
  dateISO: string (for indexing)
  // ... other fields
}

// metadata: stores config & sync state
{
  key: string
  value: any
}
// Keys: 'clientId', 'spreadsheetId', 'sheetName', 'lastSync', 'rowCount'

// reconciliation: stores per-transaction reconcile state
{
  id: string (Transaction ID)
  status: 'cleared' | 'pending' | 'unreconciled'
  date: string (ISO timestamp when marked)
}
```

### Token Management

- **Access Token**: Stored in `sessionStorage` (cleared when tab/window closes)
- **Refresh**: Google Identity Services handles token refresh automatically
- **Expiry**: Tokens auto-expire after ~1 hour; refresh is transparent

## Google OAuth2 Flow

1. User clicks "Sign in with Google" in the app
2. Google Identity Services opens a consent popup
3. User approves read-only access to spreadsheets
4. Access token returned → stored in `sessionStorage`
5. All subsequent API calls use `Authorization: Bearer {token}` header
6. Token expires → GIS refreshes automatically on next request

## Sync & Caching

### Initial Load
1. Check IndexedDB for cached transactions
2. If empty or stale (>5 min), fetch from Sheets API
3. Parse CSV, transform rows, store in IndexedDB
4. Merge with reconciliation state, render UI

### Auto-Sync
- Fetches every 5 minutes (configurable in Settings)
- Checks only if a valid token exists
- Falls back to IndexedDB on network errors

### Incremental Updates
- Fetches all rows on each sync (no differential sync yet)
- Could optimize to only fetch rows changed since `lastSync` timestamp

## Development

### Project Structure

```
src/
├── main.jsx              # React app entry point
├── App.jsx               # Root component, DB init
├── components/           # React components
│   ├── Layout.jsx        # Sidebar, header, nav
│   ├── Dashboard.jsx     # KPI cards, cash by account, charts
│   ├── TransactionTable.jsx  # Virtual scrolling table
│   ├── Analytics.jsx     # Monthly flow, category trends
│   └── Settings.jsx      # OAuth2 config, cache mgmt
├── hooks/                # Custom React hooks
│   ├── useAuth.js        # Auth state & token lifecycle
│   ├── useTransactions.js    # Data fetching & caching
│   └── useFilters.js     # In-memory filtering
├── services/             # Business logic
│   ├── auth.js           # Google Identity Services
│   ├── sheets.js         # Google Sheets API v4
│   └── db.js             # IndexedDB operations
└── styles/
    └── index.css         # Global styles, Tailwind + custom
```

### Adding a New Feature

Example: Add a "Budget vs Actual" chart

1. **Add hook** (`src/hooks/useBudget.js`):
   ```javascript
   export function useBudget(transactions) {
     // compute budget vs actual from transactions
     return { budgetVsActual, variance }
   }
   ```

2. **Add component** (`src/components/BudgetChart.jsx`):
   ```javascript
   export default function BudgetChart() {
     const { budgetVsActual } = useBudget(transactions)
     return <div>{/* render chart */}</div>
   }
   ```

3. **Import in Dashboard.jsx** and render

## Troubleshooting

### "QUOTA_EXCEEDED" Error
The app now uses IndexedDB instead of localStorage, so this shouldn't happen. If you see it:
- Clear the IndexedDB cache (Settings → Clear Cache)
- Check your browser's storage quota: DevTools → Application → Storage

### "AUTH_EXPIRED"
Token expired. Click "Sign in" again. GIS should refresh automatically, but explicit re-auth clears it.

### "PERMISSION_DENIED"
Your OAuth2 Client ID doesn't have Sheets API enabled. Go back to Google Cloud Console:
1. Select your project
2. Enable Google Sheets API
3. Confirm your Authorized JavaScript origins include your domain

### Transactions Not Loading
1. Verify Spreadsheet ID is correct (try pasting the full URL)
2. Make sure the sheet tab name matches (e.g., "Sheet1", not "Transactions")
3. Check that your Google Sheet is published or shared appropriately
4. Open DevTools → Network tab, check Sheets API responses for errors

## Performance Tips

- **Use IndexedDB**: No localStorage size limits
- **Virtual scrolling**: Table auto-renders only visible rows (20–30 at a time)
- **In-memory filtering**: All filters run in JS, < 500ms for 1000 rows
- **Chunked Sheets API fetches**: Pulls 200 rows per request, not all at once
- **React Query caching**: Data fetched once, re-renders use cached data

## Deployment

### GitHub Pages (Automatic)

The workflow `.github/workflows/jekyll-gh-pages.yml` automatically:
1. Installs dependencies
2. Runs `npm run build`
3. Uploads `dist/` to GitHub Pages

Just push to `main` and the app deploys.

### Vercel / Netlify

1. Connect your repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

### Self-Hosted

```bash
npm run build
# Upload dist/ folder to your web server (Apache, Nginx, etc.)
```

## License

MIT

## Support

For issues, questions, or feature requests, open a GitHub issue or contact the maintainers.

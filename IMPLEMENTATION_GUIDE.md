# Treasury Webapp — Complete Implementation Guide

## ✅ Completed (Phase 1 - Data Layer)

### Utilities Created
- `src/utils/dashboardAggregations.js` — All KPI, alert, and aggregation logic
- `src/utils/formatters.js` — Currency, date, percentage, and text formatting
- `src/utils/chartConfigs.js` — Chart.js configurations for all charts
- `src/hooks/useDashboardData.js` — Custom hooks for data and sync status

### Pages Created
- `src/pages/Dashboard.jsx` — Main dashboard page (structure + component hierarchy)
- `src/pages/Dashboard.css` — Dashboard responsive grid layout

### Components Created (Partial)
- `src/components/Dashboard/SyncStatusBadge.jsx` + CSS — Live sync indicator
- Structure for remaining components defined

---

## 🚀 Remaining Work (Phases 2-5)

### PHASE 2: Dashboard Components (4-5 hours)

**Priority 1: Core KPI Components (1 hour)**

**File: `src/components/Dashboard/DashboardKPICard.jsx`**
```jsx
// Component Props:
// - title: string (e.g., "NET CASH POSITION")
// - value: number (e.g., 4285190)
// - trend: number (e.g., 2.1 for +2.1%)
// - accounts: string[] (optional, for "ACTIVE ACCOUNTS" variant)
// - variant: 'primary' | 'success' | 'error' | 'info'

// Features:
// ✅ Large formatted value (28px bold monospace)
// ✅ Currency/number formatting with K/M notation
// ✅ Trend indicator (↗️ green / ↘️ red)
// ✅ Bottom accent bar (4px, colored by variant)
// ✅ Account avatars (first 4 + "+N more" overflow)
// ✅ Hover effect (slight lift, border highlight)

import { formatCurrency, formatPercentage } from '../../utils/formatters'

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
```

**File: `src/components/Dashboard/DashboardKPICard.css`**
```css
.kpi-card {
  background-color: var(--bg-secondary);
  border: var(--border-width) solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
}

.kpi-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.kpi-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-tertiary);
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.kpi-trend {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.trend-success {
  color: var(--green-success);
}

.trend-error {
  color: var(--red-error);
}

.kpi-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, currentColor);
}

.kpi-bar-primary { color: var(--teal-400); }
.kpi-bar-success { color: var(--green-success); }
.kpi-bar-error { color: var(--red-error); }
.kpi-bar-info { color: var(--blue-info); }

.kpi-accounts {
  display: flex;
  gap: 8px;
  margin-top: var(--spacing-md);
}

.account-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--teal-400), var(--teal-600));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-inverse);
  border: 1px solid var(--border-default);
}

.account-avatar.overflow {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-hover);
}
```

---

**Priority 2: Chart Components (2 hours)**

**File: `src/components/Dashboard/CashFlowVelocityChart.jsx`**
```jsx
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { getCashFlowVelocityConfig } from '../../utils/chartConfigs'

export default function CashFlowVelocityChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    const config = getCashFlowVelocityConfig(data)

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(ctx, config)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  return (
    <div style={{ height: '320px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
```

**File: `src/components/Dashboard/OutflowDriversChart.jsx`**
```jsx
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { getOutflowDriversConfig } from '../../utils/chartConfigs'

export default function OutflowDriversChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const ctx = canvasRef.current.getContext('2d')
    const config = getOutflowDriversConfig(data)

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(ctx, config)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
```

---

**Priority 3: Table & Info Components (1.5 hours)**

**File: `src/components/Dashboard/RiskObservatory.jsx`**
```jsx
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
```

**File: `src/components/Dashboard/RiskObservatory.css`**
```css
.risk-observatory {
  background-color: var(--bg-secondary);
  border: var(--border-width) solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  min-height: 400px;
}

.risk-empty {
  color: var(--text-tertiary);
  font-size: 12px;
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.alert {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid;
}

.alert-critical {
  background-color: var(--red-bg);
  border-left-color: var(--red-error);
}

.alert-warning {
  background-color: var(--amber-bg);
  border-left-color: var(--amber-warning);
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-type {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.alert-critical .alert-type {
  color: var(--red-error);
}

.alert-warning .alert-type {
  color: var(--amber-warning);
}

.alert-message {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.alert-time {
  font-size: 10px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  text-align: right;
}
```

**File: `src/components/Dashboard/InstitutionalActivityTable.jsx`**
```jsx
import { formatCurrency, formatDateAndTime, formatStatus } from '../../utils/formatters'
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
```

**File: `src/components/Dashboard/FullLedgerPreview.jsx`**
```jsx
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
```

---

**Priority 4: FAB & Modal (1 hour)**

**File: `src/components/Common/FAB.jsx`**
```jsx
import './FAB.css'

export default function FAB({ onClick }) {
  return (
    <button className="fab" onClick={onClick} title="New Transaction">
      <span className="fab-icon">+</span>
    </button>
  )
}
```

**File: `src/components/Common/FAB.css`**
```css
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--teal-400);
  border: none;
  color: var(--text-inverse);
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(45, 212, 191, 0.4);
}

.fab:active {
  transform: scale(0.95);
}

@media (max-width: 767px) {
  .fab {
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}
```

**File: `src/components/Dashboard/NewTransactionModal.jsx`**
```jsx
import { useState } from 'react'
import './NewTransactionModal.css'

export default function NewTransactionModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '12:00:00',
    account: '',
    description: '',
    amount: '',
    category: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Transaction</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Transaction description"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create Transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

### PHASE 3: Transaction Ledger Page (3-4 hours)

**File: `src/pages/Transactions.jsx`**
- Similar structure to Dashboard
- Use `useTransactionData` hook for filtering/pagination
- Render TransactionTable with all columns
- Add filter controls, export button
- Support sorting, pagination

### PHASE 4: Polish & Integration (2-3 hours)
- Add error boundaries
- Loading states
- Responsive design testing
- Accessibility audit
- Performance optimization

### PHASE 5: Deployment (30 min)
- Final commit to GitHub
- GitHub Pages auto-deployment
- Smoke testing

---

## 📋 Remaining CSS Files

Create these CSS files for the components above:
- `src/components/Dashboard/InstitutionalActivityTable.css`
- `src/components/Dashboard/FullLedgerPreview.css`
- `src/components/Dashboard/NewTransactionModal.css`

All use the design tokens from `src/styles/designTokens.css`.

---

## 🎯 Quick Start for Remaining Work

1. **Copy the JSX code** from blueprints above into respective files
2. **Create CSS files** with provided styles
3. **Test each component** in isolation before integrating
4. **Wire up remaining pages** (Transactions, other tabs)
5. **Deploy to GitHub Pages**

---

## 📊 Progress Tracker

- [x] Phase 1: Data Layer (100%)
- [ ] Phase 2: Dashboard Components (0% → implement using blueprints)
- [ ] Phase 3: Transaction Page (0%)
- [ ] Phase 4: Polish (0%)
- [ ] Phase 5: Deploy (0%)

**Total Estimated Remaining Time: 8-9 hours**

**Recommended Approach:**
- Implement 1-2 components per hour
- Test incrementally
- Use provided blueprints as starting points
- Deploy after Phase 2 completion for early validation

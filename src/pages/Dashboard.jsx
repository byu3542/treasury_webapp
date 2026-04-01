import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTransactions } from '../hooks/useTransactions'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDateFilter } from '../hooks/useDateFilter'
import { formatCurrency, formatPercentage, formatDistanceToNow } from '../utils/formatters'
import './Dashboard.css'

// Import sub-components (will create these)
import SyncStatusBadge from '../components/Dashboard/SyncStatusBadge'
import DashboardKPICard from '../components/Dashboard/DashboardKPICard'
import CashFlowVelocityChart from '../components/Dashboard/CashFlowVelocityChart'
import RiskObservatory from '../components/Dashboard/RiskObservatory'
import OutflowDriversChart from '../components/Dashboard/OutflowDriversChart'
import InstitutionalActivityTable from '../components/Dashboard/InstitutionalActivityTable'
import FullLedgerPreview from '../components/Dashboard/FullLedgerPreview'
import FAB from '../components/Common/FAB'
import NewTransactionModal from '../components/Dashboard/NewTransactionModal'
import DateFilterControl from '../components/Common/DateFilterControl'

export default function Dashboard() {
  const { isAuthed, config } = useAuth()
  const { transactions, isSyncing } = useTransactions(config, isAuthed)
  const dashboardData = useDashboardData(transactions, 5 * 60 * 1000) // 5 min sync
  const { selectedRange, startDate, endDate, handleRangeChange, getMinDateFromTransactions } = useDateFilter('last30', transactions)
  const [showNewTxnModal, setShowNewTxnModal] = useState(false)

  if (!isAuthed || !config) {
    return (
      <div className="dashboard-placeholder">
        <p>Configure Google Sheets and sign in to view dashboard.</p>
      </div>
    )
  }

  const { kpis, syncStatus, triggerSync } = dashboardData

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-top">
          <h1 className="page-title">Sovereign Observatory</h1>
          <SyncStatusBadge
            status={syncStatus.status}
            label={syncStatus.label}
            message={syncStatus.message}
            onSync={triggerSync}
            isSyncing={isSyncing}
          />
        </div>
      </div>

      {/* Date Filter Control */}
      <DateFilterControl
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        allTimeStartDate={getMinDateFromTransactions()}
      />

      {/* KPI Grid */}
      <div className="kpi-grid">
        <DashboardKPICard
          title="NET CASH POSITION"
          value={kpis.netCashPosition}
          trend={kpis.netCashPositionTrend}
          variant="primary"
        />
        <DashboardKPICard
          title="TOTAL INFLOWS (30D)"
          value={kpis.totalInflows30d}
          trend={kpis.totalInflows30dTrend}
          variant="success"
        />
        <DashboardKPICard
          title="TOTAL OUTFLOWS (30D)"
          value={kpis.totalOutflows30d}
          trend={kpis.totalOutflows30dTrend}
          variant="error"
        />
        <DashboardKPICard
          title="ACTIVE ACCOUNTS"
          value={kpis.activeAccounts.length}
          accounts={kpis.activeAccounts.slice(0, 4)}
          variant="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Column: Charts */}
        <div className="content-column-large">
          {/* 12-Week Velocity Chart */}
          <div className="panel">
            <h3 className="panel-title">12-Week Cash Flow Velocity</h3>
            <p className="panel-subtitle">Aggregated movement across all institutional repositories</p>
            <CashFlowVelocityChart data={kpis.weeklyFlows} />
          </div>

          {/* Outflow Drivers */}
          <div className="panel-row">
            <div className="panel panel-medium">
              <h3 className="panel-title">Primary Outflow Drivers</h3>
              <OutflowDriversChart data={kpis.outflowDrivers} />
            </div>

            {/* Institutional Activity */}
            <div className="panel panel-medium">
              <h3 className="panel-title">Institutional Activity</h3>
              <InstitutionalActivityTable data={kpis.institutionalActivity} />
            </div>

            {/* Full Ledger Preview */}
            <div className="panel panel-medium">
              <h3 className="panel-title">Latest Transactions</h3>
              <FullLedgerPreview transactions={transactions} />
            </div>
          </div>
        </div>

        {/* Right Column: Risk Observatory */}
        <div className="content-column-small">
          <RiskObservatory alerts={kpis.riskAlerts} />
        </div>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setShowNewTxnModal(true)} />

      {/* New Transaction Modal */}
      {showNewTxnModal && (
        <NewTransactionModal
          onClose={() => setShowNewTxnModal(false)}
          onSubmit={(data) => {
            console.log('New transaction:', data)
            setShowNewTxnModal(false)
            // TODO: Save to Google Sheets
          }}
        />
      )}
    </div>
  )
}

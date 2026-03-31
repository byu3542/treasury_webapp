import { useState, useEffect } from 'react'
import './DateFilterControl.css'

export default function DateFilterControl({
  selectedRange = 'last30',
  onRangeChange,
  allTimeStartDate,
  disabled = false,
}) {
  const [range, setRange] = useState(selectedRange)
  const [showCustom, setShowCustom] = useState(false)
  const [localStartDate, setLocalStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [localEndDate, setLocalEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Calculate date range based on selection
  const calculateDateRange = (rangeType) => {
    const today = new Date()
    let startDate

    switch (rangeType) {
      case 'last30': {
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 30)
        return { startDate, endDate: today }
      }
      case 'last60': {
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 60)
        return { startDate, endDate: today }
      }
      case 'last6m': {
        startDate = new Date(today)
        startDate.setMonth(startDate.getMonth() - 6)
        return { startDate, endDate: today }
      }
      case 'lastYear': {
        startDate = new Date(today)
        startDate.setFullYear(startDate.getFullYear() - 1)
        return { startDate, endDate: today }
      }
      case 'allTime': {
        return {
          startDate: allTimeStartDate || new Date(2020, 0, 1),
          endDate: today,
        }
      }
      case 'custom': {
        return {
          startDate: new Date(localStartDate),
          endDate: new Date(localEndDate),
        }
      }
      default: {
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 30)
        return { startDate, endDate: today }
      }
    }
  }

  // Format date for display (e.g., "Jan 30")
  const formatDateDisplay = (date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${months[date.getMonth()]} ${date.getDate()}`
  }

  // Handle preset button click
  const handlePresetClick = (rangeType) => {
    if (rangeType === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      setRange(rangeType)
      const { startDate, endDate } = calculateDateRange(rangeType)
      onRangeChange(rangeType, startDate, endDate)
    }
  }

  // Handle custom date submission
  const handleCustomDateSubmit = () => {
    const start = new Date(localStartDate)
    const end = new Date(localEndDate)

    if (start > end) {
      alert('Start date must be before end date')
      return
    }

    setRange('custom')
    onRangeChange('custom', start, end)
    setShowCustom(false)
  }

  // Get current display range
  const { startDate, endDate } = calculateDateRange(range)
  const displayRange = `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`

  const presets = [
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'last60', label: 'Last 60 Days' },
    { id: 'last6m', label: 'Last 6 Months' },
    { id: 'lastYear', label: 'Last Year' },
    { id: 'allTime', label: 'All Time' },
    { id: 'custom', label: 'Custom' },
  ]

  return (
    <div className="date-filter-control">
      <label className="filter-label">FILTER BY DATE</label>

      <div className="filter-buttons-container">
        {presets.map((btn) => (
          <button
            key={btn.id}
            className={`filter-btn ${range === btn.id ? 'active' : ''}`}
            onClick={() => handlePresetClick(btn.id)}
            disabled={disabled}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="custom-date-picker">
          <div className="date-input-group">
            <label>Start Date</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label>End Date</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
            />
          </div>
          <div className="custom-actions">
            <button className="btn-apply" onClick={handleCustomDateSubmit}>
              Apply
            </button>
            <button className="btn-cancel" onClick={() => setShowCustom(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="date-range-display">{displayRange}</div>
    </div>
  )
}

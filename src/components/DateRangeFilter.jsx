import { useState } from 'react'
import { getDateRangeLabel } from '../utils/dateUtils.js'

const PRESETS = ['Last 30 Days', 'Last 60 Days', 'Last 6 Months', 'Last Year', 'All Time']

export default function DateRangeFilter({
  preset,
  onChange,
  customDateFrom,
  customDateTo,
  onCustomDateChange
}) {
  const [showCustom, setShowCustom] = useState(false)

  return (
    <div className="mb-4 space-y-3">
      <div>
        <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-text-muted">
          Filter by Date
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                onChange(p)
                setShowCustom(false)
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors ${
                preset === p && !showCustom
                  ? 'bg-terracotta/20 border border-terracotta/50 text-terracotta'
                  : 'bg-bg-hover border border-bg-border text-text-secondary hover:text-terracotta hover:border-terracotta/50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors ${
              showCustom
                ? 'bg-terracotta/20 border border-terracotta/50 text-terracotta'
                : 'bg-bg-hover border border-bg-border text-text-secondary hover:text-terracotta hover:border-terracotta/50'
            }`}
          >
            Custom
          </button>
        </div>
        {preset !== 'All Time' && !showCustom && (
          <p className="mt-2 font-mono text-2xs text-text-muted">
            {getDateRangeLabel(preset)}
          </p>
        )}
      </div>

      {/* Custom date range inputs */}
      {showCustom && (
        <div className="rounded-lg border border-bg-border bg-bg-hover/50 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block font-mono text-2xs uppercase tracking-widest text-text-muted mb-1">
                From
              </label>
              <input
                type="date"
                value={customDateFrom || ''}
                onChange={(e) => onCustomDateChange('from', e.target.value)}
                className="input w-full text-xs"
              />
            </div>
            <div>
              <label className="block font-mono text-2xs uppercase tracking-widest text-text-muted mb-1">
                To
              </label>
              <input
                type="date"
                value={customDateTo || ''}
                onChange={(e) => onCustomDateChange('to', e.target.value)}
                className="input w-full text-xs"
              />
            </div>
          </div>
          {customDateFrom || customDateTo ? (
            <p className="font-mono text-2xs text-terracotta">
              {customDateFrom && customDateTo
                ? `${customDateFrom} → ${customDateTo}`
                : customDateFrom
                ? `From ${customDateFrom}`
                : `Until ${customDateTo}`}
            </p>
          ) : (
            <p className="font-mono text-2xs text-text-muted">Select start and/or end date</p>
          )}
        </div>
      )}
    </div>
  )
}

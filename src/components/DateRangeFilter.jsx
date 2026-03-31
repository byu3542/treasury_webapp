import { getDateRangeLabel } from '../utils/dateUtils.js'

const PRESETS = ['Last 30 Days', 'Last 60 Days', 'Last 6 Months', 'Last Year', 'All Time']

export default function DateRangeFilter({ preset, onChange }) {
  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-text-muted">
        Filter by Date
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors ${
              preset === p
                ? 'bg-gold/20 border border-gold/50 text-gold'
                : 'bg-bg-hover border border-bg-border text-text-secondary hover:text-gold hover:border-gold/50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {preset !== 'All Time' && (
        <p className="mt-2 font-mono text-2xs text-text-muted">
          {getDateRangeLabel(preset)}
        </p>
      )}
    </div>
  )
}

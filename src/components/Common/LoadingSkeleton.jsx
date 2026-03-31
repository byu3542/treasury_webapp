import './LoadingSkeleton.css'

export function SkeletonCard() {
  return (
    <div className="skeleton skeleton-card">
      <div className="skeleton-line skeleton-line-sm" />
      <div className="skeleton-line skeleton-line-lg" />
      <div className="skeleton-line skeleton-line-md" />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div className="skeleton skeleton-row">
      <div className="skeleton-line skeleton-line-sm" />
      <div className="skeleton-line skeleton-line-md" />
      <div className="skeleton-line skeleton-line-lg" />
      <div className="skeleton-line skeleton-line-sm" />
      <div className="skeleton-line skeleton-line-md" />
      <div className="skeleton-line skeleton-line-sm" />
      <div className="skeleton-line skeleton-line-md" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="skeleton skeleton-chart">
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-bar"
            style={{ flex: 1, height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonBox({ width = '100%', height = '24px' }) {
  return (
    <div
      className="skeleton-line"
      style={{ width, height }}
    />
  )
}

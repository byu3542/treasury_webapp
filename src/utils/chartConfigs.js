/**
 * Chart.js configuration templates for Sovereign dashboard
 */

import { formatCurrency } from './formatters.js'

/**
 * Get Chart.js configuration for 12-week cash flow velocity (line chart)
 */
export function getCashFlowVelocityConfig(weeklyData) {
  return {
    type: 'line',
    data: {
      labels: weeklyData.labels || [],
      datasets: [
        {
          label: 'INFLOW',
          data: Object.values(weeklyData.inflows || {}),
          borderColor: '#10b981', // green-success
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#0f1620',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
        {
          label: 'OUTFLOW',
          data: Object.values(weeklyData.outflows || {}),
          borderColor: '#ef4444', // red-error
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#0f1620',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#a8b5c4',
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 500,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 22, 32, 0.95)',
          titleColor: '#f0f4f8',
          bodyColor: '#a8b5c4',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ''
              const value = formatCurrency(context.parsed.y)
              return `${label}: ${value}`
            },
          },
        },
        filler: {
          propagate: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
          ticks: {
            color: '#697a8f',
            font: {
              size: 11,
            },
            callback: (value) => {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(0)}M`
              } else if (value >= 1000) {
                return `$${(value / 1000).toFixed(0)}K`
              }
              return `$${value}`
            },
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#697a8f',
            font: {
              size: 11,
            },
          },
        },
      },
    },
  }
}

/**
 * Get Chart.js configuration for primary outflow drivers (horizontal bar chart)
 */
export function getOutflowDriversConfig(drivers) {
  return {
    type: 'bar',
    data: {
      labels: drivers.map((d) => d.category) || [],
      datasets: [
        {
          label: 'Outflow Amount',
          data: drivers.map((d) => d.amount) || [],
          backgroundColor: [
            '#ef4444', // red
            '#f97316', // orange
            '#fb923c', // orange-light
            '#fbbf24', // yellow
            '#facc15', // yellow-light
            '#eab308', // yellow-darker
            '#84cc16', // lime
            '#22c55e', // green
          ],
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(15, 22, 32, 0.95)',
          titleColor: '#f0f4f8',
          bodyColor: '#a8b5c4',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              return formatCurrency(context.parsed.x)
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
          ticks: {
            color: '#697a8f',
            font: {
              size: 11,
            },
            callback: (value) => {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(0)}M`
              } else if (value >= 1000) {
                return `$${(value / 1000).toFixed(0)}K`
              }
              return `$${value}`
            },
          },
        },
        y: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#697a8f',
            font: {
              size: 11,
            },
          },
        },
      },
    },
  }
}

/**
 * Get Chart.js configuration for volatility index mini chart (bar chart)
 */
export function getVolatilityIndexConfig(volatility) {
  // Create 10 bars representing volatility level
  const bars = Array(10)
    .fill(0)
    .map((_, i) => (i < volatility / 10 ? volatility / 10 : 0))

  return {
    type: 'bar',
    data: {
      labels: Array(10)
        .fill(0)
        .map((_, i) => i + 1),
      datasets: [
        {
          data: bars,
          backgroundColor: bars.map((b, i) => {
            if (i < 3) return 'rgba(16, 185, 129, 0.7)' // green (low)
            if (i < 6) return 'rgba(245, 158, 11, 0.7)' // amber (medium)
            return 'rgba(239, 68, 68, 0.7)' // red (high)
          }),
          borderRadius: 2,
          borderSkipped: false,
          barThickness: 6,
        },
      ],
    },
    options: {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        y: {
          display: false,
          beginAtZero: true,
          max: 10,
        },
        x: {
          display: false,
        },
      },
    },
  }
}

/**
 * Dark theme colors for charts
 */
export const chartColors = {
  primary: '#2dd4bf', // teal
  secondary: '#fbbf24', // gold
  success: '#10b981', // green
  error: '#ef4444', // red
  warning: '#f59e0b', // amber
  info: '#3b82f6', // blue
  text: {
    primary: '#f0f4f8',
    secondary: '#a8b5c4',
    tertiary: '#697a8f',
  },
  bg: {
    primary: '#0a1117',
    secondary: '#0f1620',
    tertiary: '#151c28',
  },
  border: 'rgba(255, 255, 255, 0.08)',
}

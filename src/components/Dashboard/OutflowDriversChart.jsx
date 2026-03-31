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

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

import { useState, useCallback, useMemo } from 'react'

export function useDateFilter(defaultRange = 'last30', transactions = []) {
  const [selectedRange, setSelectedRange] = useState(defaultRange)
  const [customStartDate, setCustomStartDate] = useState(null)
  const [customEndDate, setCustomEndDate] = useState(null)

  const calculateDateRange = useCallback(
    (rangeType) => {
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
          let minDate = new Date(2020, 0, 1)
          if (transactions.length > 0) {
            const dates = transactions.map((tx) => {
              const dateStr = tx.dateISO || tx.date
              return new Date(dateStr).getTime()
            })
            minDate = new Date(Math.min(...dates))
          }
          return { startDate: minDate, endDate: today }
        }
        case 'custom': {
          return {
            startDate: customStartDate || new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: customEndDate || today,
          }
        }
        default: {
          startDate = new Date(today)
          startDate.setDate(startDate.getDate() - 30)
          return { startDate, endDate: today }
        }
      }
    },
    [customStartDate, customEndDate]
  )

  const { startDate, endDate } = useMemo(() => calculateDateRange(selectedRange), [selectedRange, calculateDateRange])

  const handleRangeChange = useCallback((range, newStartDate, newEndDate) => {
    setSelectedRange(range)
    if (range === 'custom') {
      setCustomStartDate(newStartDate)
      setCustomEndDate(newEndDate)
    }
  }, [])

  const getMinDateFromTransactions = useCallback(() => {
    if (transactions.length === 0) return new Date(2020, 0, 1)
    const dates = transactions.map((tx) => {
      const dateStr = tx.dateISO || tx.date
      return new Date(dateStr).getTime()
    })
    return new Date(Math.min(...dates))
  }, [transactions])

  return {
    selectedRange,
    startDate,
    endDate,
    customStartDate,
    customEndDate,
    handleRangeChange,
    calculateDateRange,
    getMinDateFromTransactions,
  }
}

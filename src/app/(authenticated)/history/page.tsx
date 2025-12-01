'use client'

import { useState, useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { MonthSelector } from '@/components/history/MonthSelector'
import { HistoryTable } from '@/components/history/HistoryTable'
import { calculateDailyStats } from '@/lib/utils/dailyStats'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HistoryPage() {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())

  const { entries, loading } = useTimeEntries(year, month)
  const dailyStats = useMemo(() => calculateDailyStats(entries), [entries])

  const totalWorkMinutes = dailyStats.reduce((sum, stat) => sum + stat.workMinutes, 0)
  const totalWorkHours = totalWorkMinutes / 60

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    const currentDate = new Date()
    if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
      return
    }
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
    }
  }

  const handleExportCSV = () => {
    if (dailyStats.length === 0) return

    const headers = ['日付', 'ステータス', '開始時刻', '終了時刻', '休憩時間', '実働時間']
    const rows = dailyStats.map((stat) => [
      stat.date,
      stat.status === 'complete' ? '完了' : stat.status === 'in_progress' ? '稼働中' : 'データなし',
      stat.workStart || '-',
      stat.workEnd || '-',
      stat.breakMinutes > 0 ? `${Math.floor(stat.breakMinutes / 60)}:${String(stat.breakMinutes % 60).padStart(2, '0')}` : '-',
      stat.workMinutes > 0 ? `${Math.floor(stat.workMinutes / 60)}:${String(stat.workMinutes % 60).padStart(2, '0')}` : '-',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `勤怠記録_${year}年${month + 1}月.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">月次実績</h1>
        <Button
          variant="secondary"
          onClick={handleExportCSV}
          disabled={dailyStats.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          CSV出力
        </Button>
      </div>

      <MonthSelector
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">総稼働時間</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalWorkHours.toFixed(1)}時間
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">稼働日数</p>
            <p className="text-2xl font-bold text-gray-900">
              {dailyStats.filter(s => s.workMinutes > 0).length}日
            </p>
          </div>
        </div>
      </div>

      <HistoryTable stats={dailyStats} />
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useSettings } from '@/hooks/useSettings'
import { MonthSelector } from '@/components/history/MonthSelector'
import { HistoryTable } from '@/components/history/HistoryTable'
import { calculateDailyStats, type DailyStat } from '@/lib/utils/dailyStats'
import { Calendar, Clock, JapaneseYen, Plus } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function HistoryPage() {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())
  const [isAddingEntry, setIsAddingEntry] = useState(false)

  const { entries, loading, deleteEntry, addSession, replaceSession } = useTimeEntries(year, month)
  const { settings, loading: settingsLoading } = useSettings()
  const dailyStats = useMemo(() => calculateDailyStats(entries), [entries])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingStat, setDeletingStat] = useState<DailyStat | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const totalWorkMinutes = dailyStats.reduce((sum, stat) => sum + stat.workMinutes, 0)
  const totalWorkHours = totalWorkMinutes / 60
  const estimatedPayment = settings ? (totalWorkHours * settings.hourly_rate) : 0

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

  const handleEditStat = (stat: DailyStat) => {
    setEditingId(stat.id)
  }

  const handleSaveEdit = async (data: {
    date: string
    startTime: string
    endTime: string
    isEndTimeNextDay?: boolean
    entryIds: string[]
  }) => {
    try {
      await replaceSession(data)
      setEditingId(null)
    } catch (error) {
      console.error('更新エラー:', error)
      alert('打刻の更新に失敗しました')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleDeleteStat = (stat: DailyStat) => {
    setDeletingStat(stat)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingStat) return
    try {
      // セッションの全エントリを削除
      for (const entry of deletingStat.entries) {
        await deleteEntry(entry.id)
      }
      setIsDeleteDialogOpen(false)
      setDeletingStat(null)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('打刻の削除に失敗しました')
    }
  }

  const handleAddEntry = async (data: {
    date: string
    startTime: string
    endTime: string
    isEndTimeNextDay?: boolean
  }) => {
    try {
      await addSession(data)
      setIsAddingEntry(false)
    } catch (error) {
      console.error('追加エラー:', error)
      alert('打刻の追加に失敗しました')
    }
  }

  const handleExportCSV = () => {
    if (dailyStats.length === 0) return

    const headers = ['日付', '開始時刻', '終了時刻', '稼働時間']
    const rows = dailyStats.map((stat) => [
      stat.date,
      stat.workStart || '-',
      stat.workEnd || '-',
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

  if (loading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm mb-1">総稼働時間</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">
                {totalWorkHours.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400 font-medium mb-1">時間</span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm mb-1">概算報酬額</p>
            <div className="flex items-end gap-2 text-blue-600">
              <span className="text-3xl font-bold tracking-tight">
                {estimatedPayment.toLocaleString()}
              </span>
              <span className="text-sm text-blue-400 font-medium mb-1">円</span>
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-full text-orange-600">
            <JapaneseYen size={24} />
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            月次稼働実績
          </h2>

          <MonthSelector
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingEntry(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              打刻を追加
            </button>
            <button
              onClick={handleExportCSV}
              disabled={dailyStats.length === 0}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CSV出力
            </button>
          </div>
        </div>

        <HistoryTable
          stats={dailyStats}
          year={year}
          month={month}
          onEditStat={handleEditStat}
          onDeleteStat={handleDeleteStat}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          editingId={editingId}
          onAddEntry={handleAddEntry}
          isAddingEntry={isAddingEntry}
          onCancelAdd={() => setIsAddingEntry(false)}
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeletingStat(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="打刻を削除"
        message={deletingStat ? `${deletingStat.dateStr}のセッションを削除してもよろしいですか？` : ''}
        variant="danger"
        confirmText="削除"
        cancelText="キャンセル"
      />
    </div>
  )
}

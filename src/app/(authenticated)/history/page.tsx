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
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* 1. タイトル & 2. 月選択 */}
      <div className="flex flex-col items-center justify-center gap-4 pt-6 pb-2">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3">
            <div className="p-2 bg-blue-100/50 rounded-xl text-blue-600 shadow-sm ring-1 ring-blue-100">
              <Calendar size={24} strokeWidth={2.5} />
            </div>
            <span className="tracking-tight">月次稼働実績</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            月ごとの稼働状況と報酬見積もりを確認できます
          </p>
        </div>

        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60 ring-4 ring-slate-50/50">
          <MonthSelector
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      </div>

      {/* 3 & 4. サマリーカード (総稼働時間 -> 概算報酬額) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 総稼働時間 */}
        <div className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={120} className="text-blue-600 transform rotate-12 translate-x-10 -translate-y-10" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Clock size={20} />
              </div>
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">総稼働時間</p>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-extrabold text-slate-800 tracking-tighter tabular-nums bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {totalWorkHours.toFixed(1)}
              </span>
              <span className="text-lg text-slate-400 font-bold">hours</span>
            </div>
          </div>
        </div>

        {/* 概算報酬額 */}
        <div className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <JapaneseYen size={120} className="text-orange-500 transform -rotate-12 translate-x-10 -translate-y-10" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600 group-hover:scale-110 transition-transform duration-300">
                <JapaneseYen size={20} />
              </div>
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">概算報酬額</p>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-extrabold text-slate-800 tracking-tighter tabular-nums bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {estimatedPayment.toLocaleString()}
              </span>
              <span className="text-lg text-slate-400 font-bold">yen</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 打刻追加の表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center gap-4">
          <h3 className="font-bold text-slate-700">実績一覧</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddingEntry(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              打刻を追加
            </button>
            <button
              onClick={handleExportCSV}
              disabled={dailyStats.length === 0}
              className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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

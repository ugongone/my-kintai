'use client'

import { useState, useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useSettings } from '@/hooks/useSettings'
import { MonthSelector } from '@/components/history/MonthSelector'
import { HistoryTable } from '@/components/history/HistoryTable'
import { calculateDailyStats } from '@/lib/utils/dailyStats'
import { Calendar, Clock, JapaneseYen, Plus } from 'lucide-react'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { TimeEntry, EntryType } from '@/types/database'

export default function HistoryPage() {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())
  const [isAddingEntry, setIsAddingEntry] = useState(false)

  const { entries, loading, updateEntry, deleteEntry, addMultipleEntries } = useTimeEntries(year, month)
  const { settings, loading: settingsLoading } = useSettings()
  const dailyStats = useMemo(() => calculateDailyStats(entries), [entries])

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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

  const getEntryTypeLabel = (type: EntryType): string => {
    switch (type) {
      case 'work_start': return '業務開始'
      case 'work_end': return '業務終了'
      case 'break_start': return '休憩開始'
      case 'break_end': return '休憩終了'
    }
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleUpdateEntry = async (data: {
    date: string
    time: string
    entryType: EntryType
    note?: string
  }) => {
    if (!editingEntry) return
    try {
      const entryTime = new Date(`${data.date}T${data.time}`)
      await updateEntry(editingEntry.id, {
        entry_type: data.entryType,
        entry_time: entryTime.toISOString(),
        note: data.note || undefined,
      })
      setIsEditModalOpen(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('更新エラー:', error)
      alert('打刻の更新に失敗しました')
    }
  }

  const handleDeleteClick = (entry: TimeEntry) => {
    setDeletingEntry(entry)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return
    try {
      await deleteEntry(deletingEntry.id)
      setIsDeleteDialogOpen(false)
      setDeletingEntry(null)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('打刻の削除に失敗しました')
    }
  }

  const handleAddEntry = async (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
  }) => {
    try {
      await addMultipleEntries(data)
      setIsAddingEntry(false)
    } catch (error) {
      console.error('追加エラー:', error)
      alert('打刻の追加に失敗しました')
    }
  }

  const handleExportCSV = () => {
    if (dailyStats.length === 0) return

    const headers = ['日付', '開始時刻', '終了時刻', '休憩時間', '実働時間']
    const rows = dailyStats.map((stat) => [
      stat.date,
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
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteClick}
          onAddEntry={handleAddEntry}
          isAddingEntry={isAddingEntry}
          onCancelAdd={() => setIsAddingEntry(false)}
        />
      </div>

      <ManualEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingEntry(null)
        }}
        onSubmit={handleUpdateEntry}
        mode="edit"
        initialData={editingEntry ? {
          id: editingEntry.id,
          date: new Date(editingEntry.entry_time).toISOString().split('T')[0],
          time: new Date(editingEntry.entry_time).toTimeString().slice(0, 5),
          entryType: editingEntry.entry_type,
          note: editingEntry.note || '',
        } : undefined}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeletingEntry(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="打刻を削除"
        message={deletingEntry ? `${getEntryTypeLabel(deletingEntry.entry_type)}の打刻を削除してもよろしいですか？` : ''}
        variant="danger"
        confirmText="削除"
        cancelText="キャンセル"
      />
    </div>
  )
}

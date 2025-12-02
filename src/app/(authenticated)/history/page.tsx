'use client'

import { useState, useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useSettings } from '@/hooks/useSettings'
import { MonthSelector } from '@/components/history/MonthSelector'
import { HistoryTable } from '@/components/history/HistoryTable'
import { calculateDailyStats } from '@/lib/utils/dailyStats'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { TimeEntry, EntryType } from '@/types/database'

export default function HistoryPage() {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())

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
    } catch (error) {
      console.error('追加エラー:', error)
      alert('打刻の追加に失敗しました')
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

  if (loading || settingsLoading) {
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
        <div className="grid grid-cols-3 gap-4 md:gap-6">
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
          <div>
            <p className="text-sm text-gray-600 mb-1">概算報酬額</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{estimatedPayment.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <HistoryTable
        stats={dailyStats}
        year={year}
        month={month}
        onEditEntry={handleEditEntry}
        onDeleteEntry={handleDeleteClick}
        onAddEntry={handleAddEntry}
      />

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

'use client'

import { formatMinutesToHours, type DailyStat } from '@/lib/utils/dailyStats'
import { Pencil, Trash2 } from 'lucide-react'
import { AddEntryRow } from './AddEntryRow'
import { EditEntryRow } from './EditEntryRow'

type HistoryTableProps = {
  stats: DailyStat[]
  year: number
  month: number
  onEditStat: (stat: DailyStat) => void
  onDeleteStat: (stat: DailyStat) => void
  onSaveEdit: (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
    isEndTimeNextDay?: boolean
    entryIds?: string[]
  }) => void
  onCancelEdit: () => void
  editingId: string | null
  onAddEntry: (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
    isEndTimeNextDay?: boolean
  }) => void
  isAddingEntry?: boolean
  onCancelAdd?: () => void
}

export function HistoryTable({
  stats,
  year,
  month,
  onEditStat,
  onDeleteStat,
  onSaveEdit,
  onCancelEdit,
  editingId,
  onAddEntry,
  isAddingEntry = false,
  onCancelAdd,
}: HistoryTableProps) {
  const handleAddEntry = (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
  }) => {
    onAddEntry(data)
  }

  const handleCancelAdd = () => {
    if (onCancelAdd) {
      onCancelAdd()
    }
  }

  const isEditing = editingId !== null || isAddingEntry

  if (stats.length === 0 && !isAddingEntry) {
    return (
      <div className="overflow-hidden">
        <div className="p-8 text-center text-slate-500">
          この月の打刻データがありません
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">日付</th>
              <th className="px-6 py-4 font-medium">開始</th>
              <th className="px-6 py-4 font-medium">終了</th>
              <th className="px-6 py-4 font-medium">休憩</th>
              <th className="px-6 py-4 font-medium">実働時間</th>
              {isEditing && <th className="px-6 py-4 font-medium">備考</th>}
              <th className="px-6 py-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAddingEntry && (
              <AddEntryRow
                year={year}
                month={month}
                onSave={handleAddEntry}
                onCancel={handleCancelAdd}
              />
            )}
            {stats.map((stat) => {
              // 編集中の行の場合
              if (editingId === stat.id) {
                return (
                  <EditEntryRow
                    key={stat.id}
                    stat={stat}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                  />
                )
              }

              return (
                <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                    {stat.dateStr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {stat.workStart || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {stat.workEnd || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {stat.breakMinutes > 0 ? formatMinutesToHours(stat.breakMinutes) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                    {stat.workMinutes > 0 ? formatMinutesToHours(stat.workMinutes) : '-'}
                  </td>
                  {isEditing && <td className="px-6 py-4"></td>}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditStat(stat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStat(stat)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

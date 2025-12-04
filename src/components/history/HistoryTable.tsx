'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { formatMinutesToHours, type DailyStat } from '@/lib/utils/dailyStats'
import type { TimeEntry } from '@/types/database'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { AddEntryRow } from './AddEntryRow'

type HistoryTableProps = {
  stats: DailyStat[]
  year: number
  month: number
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entry: TimeEntry) => void
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
  onEditEntry,
  onDeleteEntry,
  onAddEntry,
  isAddingEntry = false,
  onCancelAdd,
}: HistoryTableProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  const toggleExpand = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  const getEntryTypeLabel = (type: string): string => {
    switch (type) {
      case 'work_start': return '業務開始'
      case 'work_end': return '業務終了'
      case 'break_start': return '休憩開始'
      case 'break_end': return '休憩終了'
      default: return type
    }
  }

  const getEntryTypeBadgeVariant = (type: string): 'default' | 'success' | 'warning' | 'danger' => {
    switch (type) {
      case 'work_start': return 'success'
      case 'work_end': return 'danger'
      case 'break_start': return 'warning'
      case 'break_end': return 'default'
      default: return 'default'
    }
  }

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

  if (stats.length === 0 && !isAddingEntry) {
    return (
      <div className="overflow-hidden">
        <div className="p-8 text-center text-slate-500">
          この月の打刻データがありません
        </div>
      </div>
    )
  }

  if (stats.length === 0 && isAddingEntry) {
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
                <th className="px-6 py-4 font-medium">備考</th>
                <th className="px-6 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AddEntryRow
                year={year}
                month={month}
                onSave={handleAddEntry}
                onCancel={handleCancelAdd}
              />
            </tbody>
          </table>
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
              {isAddingEntry && <th className="px-6 py-4 font-medium">備考</th>}
              {isAddingEntry && <th className="px-6 py-4 font-medium">操作</th>}
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
              const isExpanded = expandedDates.has(stat.date)
              return (
                <React.Fragment key={stat.date}>
                  <tr
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => toggleExpand(stat.date)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        {stat.dateStr}
                      </div>
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
                    {isAddingEntry && <td className="px-6 py-4"></td>}
                    {isAddingEntry && <td className="px-6 py-4"></td>}
                  </tr>
                  {isExpanded && stat.entries.length > 0 && (
                    <tr>
                      <td colSpan={isAddingEntry ? 7 : 5} className="px-6 py-2 bg-slate-50">
                        <div className="space-y-1">
                          {stat.entries.map((entry) => {
                            const entryTime = new Date(entry.entry_time)
                            const timeStr = `${String(entryTime.getHours()).padStart(2, '0')}:${String(entryTime.getMinutes()).padStart(2, '0')}`
                            return (
                              <div
                                key={entry.id}
                                className="flex items-center gap-4 py-2 px-4 bg-white rounded border border-slate-200"
                              >
                                <Badge variant={getEntryTypeBadgeVariant(entry.entry_type)}>
                                  {getEntryTypeLabel(entry.entry_type)}
                                </Badge>
                                <span className="text-sm text-slate-900 font-medium">
                                  {timeStr}
                                </span>
                                <span className="text-sm text-slate-500 flex-1">
                                  {entry.note || '-'}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEditEntry(entry)
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="編集"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onDeleteEntry(entry)
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="削除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

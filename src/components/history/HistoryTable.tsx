'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { formatMinutesToHours, type DailyStat } from '@/lib/utils/dailyStats'
import type { TimeEntry } from '@/types/database'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'

type HistoryTableProps = {
  stats: DailyStat[]
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entry: TimeEntry) => void
}

export function HistoryTable({ stats, onEditEntry, onDeleteEntry }: HistoryTableProps) {
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

  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        この月の打刻データがありません
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                開始時刻
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                終了時刻
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                休憩時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                実働時間
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((stat) => {
              const isExpanded = expandedDates.has(stat.date)
              return (
                <React.Fragment key={stat.date}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(stat.date)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        {stat.dateStr}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stat.status === 'complete' && (
                        <Badge variant="success">完了</Badge>
                      )}
                      {stat.status === 'in_progress' && (
                        <Badge variant="warning">稼働中</Badge>
                      )}
                      {stat.status === 'no_data' && (
                        <Badge variant="default">データなし</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.workStart || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.workEnd || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.breakMinutes > 0 ? formatMinutesToHours(stat.breakMinutes) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.workMinutes > 0 ? formatMinutesToHours(stat.workMinutes) : '-'}
                    </td>
                  </tr>
                  {isExpanded && stat.entries.length > 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-2 bg-gray-50">
                        <div className="space-y-1">
                          {stat.entries.map((entry) => {
                            const entryTime = new Date(entry.entry_time)
                            const timeStr = `${String(entryTime.getHours()).padStart(2, '0')}:${String(entryTime.getMinutes()).padStart(2, '0')}`
                            return (
                              <div
                                key={entry.id}
                                className="flex items-center gap-4 py-2 px-4 bg-white rounded border border-gray-200"
                              >
                                <Badge variant={getEntryTypeBadgeVariant(entry.entry_type)}>
                                  {getEntryTypeLabel(entry.entry_type)}
                                </Badge>
                                <span className="text-sm text-gray-900 font-medium">
                                  {timeStr}
                                </span>
                                <span className="text-sm text-gray-500 flex-1">
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

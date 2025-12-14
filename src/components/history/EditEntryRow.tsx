'use client'

import { useState } from 'react'
import { Save, X } from 'lucide-react'
import type { DailyStat } from '@/lib/utils/dailyStats'

type EditEntryRowProps = {
  stat: DailyStat
  onSave: (data: {
    date: string
    startTime: string
    endTime: string
    isEndTimeNextDay?: boolean
    entryIds: string[]
  }) => void
  onCancel: () => void
}

export function EditEntryRow({ stat, onSave, onCancel }: EditEntryRowProps) {
  // 既存のエントリから初期値を取得
  const workStartEntry = stat.entries.find(e => e.entry_type === 'work_start')
  const workEndEntry = stat.entries.find(e => e.entry_type === 'work_end')

  const getTimeFromEntry = (entry: typeof workStartEntry): string => {
    if (!entry) return ''
    const date = new Date(entry.entry_time)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 終了時刻が翌日かどうかを判定
  const isNextDay = (): boolean => {
    if (!workEndEntry) return false
    const endDate = new Date(workEndEntry.entry_time)
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
    return endDateStr > stat.date
  }

  // 翌日の場合は通常の時刻に戻す（25:00 → 01:00）
  const getEndTime = (): string => {
    if (!workEndEntry) return ''
    const date = new Date(workEndEntry.entry_time)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const [startTime, setStartTime] = useState(getTimeFromEntry(workStartEntry) || '09:00')
  const [endTime, setEndTime] = useState(getEndTime() || '18:00')
  const [isEndTimeNextDay, setIsEndTimeNextDay] = useState(isNextDay())
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (isSaving) return
    setError('')

    if (!startTime || !endTime) {
      setError('開始時刻、終了時刻は必須です')
      return
    }

    if (!isEndTimeNextDay && startTime >= endTime) {
      setError('終了時刻は開始時刻より後にしてください')
      return
    }

    setIsSaving(true)
    onSave({
      date: stat.date,
      startTime,
      endTime,
      isEndTimeNextDay,
      entryIds: stat.entries.map(e => e.id),
    })
  }

  const inputClass = "w-24 border border-amber-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"

  return (
    <tr className="bg-amber-50 animate-fade-in">
      <td className="px-6 py-3">
        <span className="font-medium text-slate-800">{stat.dateStr}</span>
      </td>
      <td className="px-6 py-3">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
          <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
            <input
              type="checkbox"
              checked={isEndTimeNextDay}
              onChange={(e) => setIsEndTimeNextDay(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            翌日
          </label>
        </div>
      </td>
      <td className="px-6 py-3">
        <span className="text-slate-400 text-xs">自動計算</span>
      </td>
      <td className="px-6 py-3">
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="保存"
          >
            <Save size={14} />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 bg-white border border-slate-300 text-slate-500 rounded hover:bg-slate-50 transition-colors"
            title="キャンセル"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

'use client'

import { useState } from 'react'
import { Save, X } from 'lucide-react'

type AddEntryRowProps = {
  year: number
  month: number
  onSave: (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
    isEndTimeNextDay?: boolean
  }) => void
  onCancel: () => void
}

export function AddEntryRow({ year, month, onSave, onCancel }: AddEntryRowProps) {
  const today = new Date()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // 最大日付は月末か今日のどちらか早い方
  const maxDate = lastDayOfMonth > today ? today : lastDayOfMonth

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const [date, setDate] = useState(formatDateForInput(maxDate))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [breakStartTime, setBreakStartTime] = useState('')
  const [breakEndTime, setBreakEndTime] = useState('')
  const [isEndTimeNextDay, setIsEndTimeNextDay] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    setError('')

    if (!date || !startTime || !endTime) {
      setError('日付、開始時刻、終了時刻は必須です')
      return
    }

    if (!isEndTimeNextDay && startTime >= endTime) {
      setError('終了時刻は開始時刻より後にしてください')
      return
    }

    // 休憩時刻のバリデーション
    if ((breakStartTime && !breakEndTime) || (!breakStartTime && breakEndTime)) {
      setError('休憩は開始と終了の両方を入力してください')
      return
    }

    if (breakStartTime && breakEndTime) {
      if (breakStartTime >= breakEndTime) {
        setError('休憩終了は休憩開始より後にしてください')
        return
      }
      // 翌日跨ぎでない場合のみ業務時間内チェック
      if (!isEndTimeNextDay && (breakStartTime < startTime || breakEndTime > endTime)) {
        setError('休憩時間は業務時間内にしてください')
        return
      }
      // 翌日跨ぎの場合は開始時刻以降であればOK
      if (isEndTimeNextDay && breakStartTime < startTime) {
        setError('休憩開始は業務開始以降にしてください')
        return
      }
    }

    onSave({
      date,
      startTime,
      endTime,
      breakStartTime: breakStartTime || undefined,
      breakEndTime: breakEndTime || undefined,
      isEndTimeNextDay,
    })
  }

  const inputClass = "w-24 border border-blue-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"

  return (
    <tr className="bg-blue-50 animate-fade-in">
      <td className="px-6 py-3">
        <input
          type="date"
          value={date}
          min={formatDateForInput(firstDayOfMonth)}
          max={formatDateForInput(maxDate)}
          onChange={(e) => setDate(e.target.value)}
          className="w-32 border border-blue-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        />
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
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            翌日
          </label>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-col gap-1">
          <input
            type="time"
            value={breakStartTime}
            onChange={(e) => setBreakStartTime(e.target.value)}
            placeholder="開始"
            className="w-20 border border-blue-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="time"
            value={breakEndTime}
            onChange={(e) => setBreakEndTime(e.target.value)}
            placeholder="終了"
            className="w-20 border border-blue-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
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
            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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

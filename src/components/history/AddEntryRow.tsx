'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check, X } from 'lucide-react'

type AddEntryRowProps = {
  year: number
  month: number
  onSave: (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
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
  const [error, setError] = useState('')

  const handleSave = () => {
    setError('')

    if (!date || !startTime || !endTime) {
      setError('日付、開始時刻、終了時刻は必須です')
      return
    }

    if (startTime >= endTime) {
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
      if (breakStartTime < startTime || breakEndTime > endTime) {
        setError('休憩時間は業務時間内にしてください')
        return
      }
    }

    onSave({
      date,
      startTime,
      endTime,
      breakStartTime: breakStartTime || undefined,
      breakEndTime: breakEndTime || undefined,
    })
  }

  return (
    <tr className="bg-blue-50">
      <td colSpan={6} className="px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">日付</label>
            <input
              type="date"
              value={date}
              min={formatDateForInput(firstDayOfMonth)}
              max={formatDateForInput(maxDate)}
              onChange={(e) => setDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">開始</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">終了</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">休憩開始</label>
            <input
              type="time"
              value={breakStartTime}
              onChange={(e) => setBreakStartTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">休憩終了</label>
            <input
              type="time"
              value={breakEndTime}
              onChange={(e) => setBreakEndTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="success" onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5">
              <Check className="w-4 h-4" />
              保存
            </Button>
            <button
              onClick={onCancel}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="キャンセル"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </td>
    </tr>
  )
}

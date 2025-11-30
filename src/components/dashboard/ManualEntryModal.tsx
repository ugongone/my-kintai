'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { EntryType } from '@/types/database'

interface ManualEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    date: string
    time: string
    entryType: EntryType
    note?: string
  }) => void
}

export function ManualEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: ManualEntryModalProps) {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })
  const [entryType, setEntryType] = useState<EntryType>('work_start')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ date, time, entryType, note: note || undefined })
    setNote('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="手動打刻">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            時刻
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            打刻種別
          </label>
          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as EntryType)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="work_start">業務開始</option>
            <option value="work_end">業務終了</option>
            <option value="break_start">休憩開始</option>
            <option value="break_end">休憩終了</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考（任意）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="備考を入力"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            登録
          </Button>
        </div>
      </form>
    </Modal>
  )
}

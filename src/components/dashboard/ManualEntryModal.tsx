'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
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
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    date: string
    time: string
    entryType: EntryType
    note?: string
  }
}

export function ManualEntryModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
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

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setDate(initialData.date)
      setTime(initialData.time)
      setEntryType(initialData.entryType)
      setNote(initialData.note || '')
    }
  }, [mode, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ date, time, entryType, note: note || undefined })
    setNote('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? '打刻を編集' : '手動打刻入力'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              時刻
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              打刻種別
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as EntryType)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
            >
              <option value="work_start">業務開始</option>
              <option value="work_end">業務終了</option>
              <option value="break_start">休憩開始</option>
              <option value="break_end">休憩終了</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            備考（作業内容など）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="LPデザイン修正、MTGなど"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 -mx-6 px-6 pb-0 mt-6 bg-slate-50 -mb-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            {mode === 'edit' ? '更新する' : '登録する'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

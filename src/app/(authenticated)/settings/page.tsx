'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { settings, loading, updateHourlyRate } = useSettings()
  const [hourlyRate, setHourlyRate] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateHourlyRate(Number(hourlyRate))
      alert('時給を更新しました')
      setHourlyRate('')
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-100 max-w-lg mx-auto mt-8">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <Settings className="text-blue-600" />
        環境設定
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            現在の時給設定 (円)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder={String(settings?.hourly_rate || 1500)}
              required
              min="0"
              step="1"
              className="flex-1 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-slate-500">円 / 時間</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ダッシュボードの概算報酬計算に使用されます。
          </p>
          <p className="text-sm text-slate-600 mt-2">
            現在の設定: <span className="font-bold">¥{settings?.hourly_rate.toLocaleString()}</span>
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving || !hourlyRate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '更新中...' : '時給を更新'}
        </button>
      </div>
    </div>
  )
}

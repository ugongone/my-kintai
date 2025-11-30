'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Button } from '@/components/ui/Button'

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
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">時給設定</h2>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">現在の時給</div>
          <div className="text-3xl font-bold text-gray-900">
            ¥{settings?.hourly_rate.toLocaleString()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しい時給（円）
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder={String(settings?.hourly_rate || 1500)}
              required
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button type="submit" variant="primary" disabled={isSaving || !hourlyRate}>
            {isSaving ? '更新中...' : '時給を更新'}
          </Button>
        </form>
      </div>
    </div>
  )
}

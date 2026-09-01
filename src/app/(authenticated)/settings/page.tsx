'use client'

import { useState } from 'react'
import { useHourlyRates } from '@/hooks/useHourlyRates'
import { resolveHourlyRate, formatEffectiveFrom } from '@/lib/utils/hourlyRate'
import { calculateWorkDate } from '@/lib/utils/workDate'
import { Settings, Trash2 } from 'lucide-react'

/** 今月1日を YYYY-MM-DD で返す */
function firstDayOfThisMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export default function SettingsPage() {
  const { rates, loading, saveRate, deleteRate } = useHourlyRates()
  const [hourlyRate, setHourlyRate] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(firstDayOfThisMonth())
  const [isSaving, setIsSaving] = useState(false)

  const today = calculateWorkDate(new Date())
  const currentRate = resolveHourlyRate(rates, today)
  // ratesは適用開始日の降順。今日時点で適用されているのは最初に見つかる1件
  const currentRateId = rates.find((rate) => rate.effective_from <= today)?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await saveRate(Number(hourlyRate), effectiveFrom)
      alert('時給を保存しました')
      setHourlyRate('')
    } catch (error) {
      console.error('更新エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`${label}からの時給設定を削除しますか？`)) return

    try {
      await deleteRate(id)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
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

      <div className="space-y-6">
        {/* 時給の追加 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              適用開始日
            </label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              この日以降の稼働分に新しい時給が適用されます。過去の稼働分は当時の時給のまま計算されます。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              時給 (円)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder={String(currentRate)}
                required
                min="0"
                step="1"
                className="flex-1 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <span className="text-slate-500">円 / 時間</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || !hourlyRate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '時給を保存'}
          </button>
        </form>

        <div className="h-px bg-slate-100" />

        {/* 時給の履歴 */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            時給の履歴（現在は ¥{currentRate.toLocaleString()}）
          </p>
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {rates.map((rate) => {
              const isCurrent = rate.id === currentRateId
              const label = formatEffectiveFrom(rate.effective_from)

              return (
                <li
                  key={rate.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 tabular-nums">{label}〜</span>
                    <span className="font-bold text-slate-800">
                      ¥{rate.hourly_rate.toLocaleString()}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        適用中
                      </span>
                    )}
                  </div>
                  {rates.length > 1 && (
                    <button
                      onClick={() => handleDelete(rate.id, label)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      aria-label="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            ダッシュボードの概算報酬計算に使用されます。
          </p>
        </div>
      </div>
    </div>
  )
}

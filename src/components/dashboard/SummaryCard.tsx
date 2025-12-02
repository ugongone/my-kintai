import { TrendingUp, JapaneseYen } from 'lucide-react'

interface SummaryCardProps {
  totalHours: number
  estimatedEarnings: number
  hourlyRate?: number
}

export function SummaryCard({ totalHours, estimatedEarnings, hourlyRate = 0 }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col justify-center">
      <h3 className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
        <TrendingUp size={16} />
        今月の実績サマリー
      </h3>
      <div className="space-y-8">
        {/* 総稼働時間 */}
        <div>
          <div className="text-slate-500 text-sm mb-1">総稼働時間</div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-800 tracking-tight">
              {totalHours.toFixed(1)}
            </span>
            <span className="text-lg text-slate-400 font-medium mb-1">時間</span>
          </div>
        </div>

        <div className="h-px bg-slate-100"></div>

        {/* 概算報酬 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-sm">概算報酬額</span>
            {hourlyRate > 0 && (
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                時給 {hourlyRate.toLocaleString()}円
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <JapaneseYen size={28} />
            <span className="text-3xl font-bold tracking-tight">
              {estimatedEarnings.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">
            ※あくまで概算（税込/抜 未考慮）です
          </p>
        </div>
      </div>
    </div>
  )
}

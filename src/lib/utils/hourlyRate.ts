import type { HourlyRate } from '@/types/database'
import type { DailyStat } from './dailyStats'

/**
 * 指定日 (YYYY-MM-DD) に適用される時給を返す
 * 適用開始日が指定日以前のもののうち、最も新しいものを使う。
 * 該当がなければ最も古い時給にフォールバックする。
 */
export function resolveHourlyRate(rates: HourlyRate[], date: string): number {
  if (rates.length === 0) return 0

  const sorted = [...rates].sort((a, b) => a.effective_from.localeCompare(b.effective_from))
  const applicable = sorted.filter((rate) => rate.effective_from <= date)

  return applicable.length > 0
    ? applicable[applicable.length - 1].hourly_rate
    : sorted[0].hourly_rate
}

/**
 * 稼働日ごとにその日の時給を掛けて概算報酬額を合計する
 */
export function calculatePayment(stats: DailyStat[], rates: HourlyRate[]): number {
  const total = stats.reduce(
    (sum, stat) => sum + (stat.workMinutes / 60) * resolveHourlyRate(rates, stat.date),
    0
  )
  return Math.round(total)
}

/** YYYY-MM-DD を M/D 形式に変換 */
export function formatEffectiveFrom(date: string): string {
  const [year, month, day] = date.split('-')
  return `${year}/${Number(month)}/${Number(day)}`
}

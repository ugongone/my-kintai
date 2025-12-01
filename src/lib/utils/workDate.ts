/**
 * entry_timeからwork_dateを計算
 * 0-4時台は前日、5-23時台は当日として扱う
 */
export function calculateWorkDate(timestamp: Date): string {
  const hour = timestamp.getHours()
  const date = new Date(timestamp)

  // 0-4時台は前日扱い
  if (hour < 5) {
    date.setDate(date.getDate() - 1)
  }

  // YYYY-MM-DD形式で返す
  return date.toISOString().split('T')[0]
}

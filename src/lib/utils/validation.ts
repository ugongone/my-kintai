import type { TimeEntry, EntryType } from '@/types/database'

export type ValidationError = {
  message: string
  severity: 'error' | 'warning'
}

/**
 * 新しい打刻エントリーのバリデーション
 */
export function validateNewEntry(
  entryType: EntryType,
  entryTime: Date,
  existingEntries: TimeEntry[]
): ValidationError[] {
  const errors: ValidationError[] = []

  const sortedEntries = [...existingEntries].sort((a, b) =>
    new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
  )

  const latestEntry = sortedEntries[sortedEntries.length - 1]

  if (!latestEntry) {
    if (entryType !== 'work_start') {
      errors.push({
        message: '最初の打刻は「業務開始」である必要があります',
        severity: 'error'
      })
    }
    return errors
  }

  // 状態遷移チェック
  const allowedTransitions: Record<EntryType, EntryType[]> = {
    work_start: ['break_start', 'work_end'],
    break_start: ['break_end'],
    break_end: ['break_start', 'work_end'],
    work_end: ['work_start']
  }

  const allowed = allowedTransitions[latestEntry.entry_type]
  if (!allowed.includes(entryType)) {
    errors.push({
      message: `現在の状態から${getEntryTypeLabel(entryType)}への遷移はできません`,
      severity: 'error'
    })
  }

  // 時刻の逆転チェック
  const timeDiff = entryTime.getTime() - new Date(latestEntry.entry_time).getTime()
  if (timeDiff < 0) {
    errors.push({
      message: '過去の時刻に打刻することはできません',
      severity: 'error'
    })
  }

  // 長時間勤務の警告（12時間以上）
  if (entryType === 'work_end') {
    const workDuration = timeDiff / (60 * 60 * 1000)
    if (workDuration > 12) {
      errors.push({
        message: `勤務時間が${workDuration.toFixed(1)}時間と長時間です。打刻に間違いがないか確認してください`,
        severity: 'warning'
      })
    }
  }

  return errors
}

function getEntryTypeLabel(type: EntryType): string {
  const labels: Record<EntryType, string> = {
    work_start: '業務開始',
    work_end: '業務終了',
    break_start: '休憩開始',
    break_end: '休憩終了'
  }
  return labels[type]
}

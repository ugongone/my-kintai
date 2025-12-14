import type { TimeEntry } from '@/types/database'

export type WorkStatus = 'offline' | 'working'

export function getCurrentStatus(entries: TimeEntry[]): WorkStatus {
  if (entries.length === 0) return 'offline'

  const latest = entries[0]
  const latestType = latest.entry_type

  if (latestType === 'work_start') {
    return 'working'
  }
  return 'offline'
}

export function getLastEntryTime(entries: TimeEntry[]): string | undefined {
  if (entries.length === 0) return undefined

  const latest = entries[0]
  const date = new Date(latest.entry_time)

  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateWorkTime(entries: TimeEntry[]): {
  totalMinutes: number
  workMinutes: number
} {
  let totalMinutes = 0

  const today = new Date()
  const todayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.entry_time)
    return entryDate.toDateString() === today.toDateString()
  })

  let workStart: Date | null = null

  for (let i = todayEntries.length - 1; i >= 0; i--) {
    const entry = todayEntries[i]
    const entryTime = new Date(entry.entry_time)

    if (entry.entry_type === 'work_start') {
      workStart = entryTime
    } else if (entry.entry_type === 'work_end' && workStart) {
      const workDuration = (entryTime.getTime() - workStart.getTime()) / 60000
      totalMinutes += workDuration
      workStart = null
    }
  }

  if (workStart) {
    const now = new Date()
    const workDuration = (now.getTime() - workStart.getTime()) / 60000
    totalMinutes += workDuration
  }

  return {
    totalMinutes,
    workMinutes: totalMinutes,
  }
}

export function calculateMonthlyStats(entries: TimeEntry[]): {
  totalHours: number
  totalDays: number
} {
  const dailyWork = new Map<string, number>()

  entries.forEach((entry) => {
    const date = new Date(entry.entry_time).toDateString()
    if (!dailyWork.has(date)) {
      dailyWork.set(date, 0)
    }
  })

  const dates = Array.from(dailyWork.keys())
  let totalMinutes = 0

  dates.forEach((date) => {
    const dayEntries = entries.filter(
      (e) => new Date(e.entry_time).toDateString() === date
    )
    const { workMinutes } = calculateWorkTime(dayEntries)
    totalMinutes += workMinutes
  })

  return {
    totalHours: totalMinutes / 60,
    totalDays: dates.length,
  }
}

import type { TimeEntry, EntryType } from '@/types/database'

export type WorkStatus = 'offline' | 'working' | 'break'

export function getCurrentStatus(entries: TimeEntry[]): WorkStatus {
  if (entries.length === 0) return 'offline'

  const latest = entries[0]
  const latestType = latest.entry_type

  if (latestType === 'work_start' || latestType === 'break_end') {
    return 'working'
  }
  if (latestType === 'break_start') {
    return 'break'
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
  breakMinutes: number
  workMinutes: number
} {
  let totalMinutes = 0
  let breakMinutes = 0

  const today = new Date()
  const todayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.entry_time)
    return entryDate.toDateString() === today.toDateString()
  })

  let workStart: Date | null = null
  let breakStart: Date | null = null

  for (let i = todayEntries.length - 1; i >= 0; i--) {
    const entry = todayEntries[i]
    const entryTime = new Date(entry.entry_time)

    if (entry.entry_type === 'work_start') {
      workStart = entryTime
    } else if (entry.entry_type === 'break_start' && workStart) {
      breakStart = entryTime
    } else if (entry.entry_type === 'break_end' && breakStart) {
      const breakDuration = (entryTime.getTime() - breakStart.getTime()) / 60000
      breakMinutes += breakDuration
      breakStart = null
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

    if (breakStart) {
      const breakDuration = (now.getTime() - breakStart.getTime()) / 60000
      breakMinutes += breakDuration
    }
  }

  const workMinutes = totalMinutes - breakMinutes

  return {
    totalMinutes,
    breakMinutes,
    workMinutes,
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

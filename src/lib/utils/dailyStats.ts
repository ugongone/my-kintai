import type { TimeEntry } from '@/types/database'

export type DailyStat = {
  date: string
  dateStr: string
  workStart?: string
  workEnd?: string
  breakMinutes: number
  workMinutes: number
  status: 'complete' | 'in_progress' | 'no_data'
  entries: TimeEntry[]
}

export function calculateDailyStats(entries: TimeEntry[]): DailyStat[] {
  const dailyMap = new Map<string, TimeEntry[]>()

  entries.forEach((entry) => {
    const date = new Date(entry.entry_time)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, [])
    }
    dailyMap.get(dateKey)!.push(entry)
  })

  const stats: DailyStat[] = []

  dailyMap.forEach((dayEntries, dateKey) => {
    const sortedEntries = dayEntries.sort((a, b) =>
      new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
    )

    let workStart: Date | null = null
    let workEnd: Date | null = null
    let breakMinutes = 0
    let workMinutes = 0
    let breakStart: Date | null = null
    let hasWorkStart = false
    let hasWorkEnd = false

    for (const entry of sortedEntries) {
      const entryTime = new Date(entry.entry_time)

      if (entry.entry_type === 'work_start') {
        workStart = entryTime
        hasWorkStart = true
      } else if (entry.entry_type === 'break_start' && workStart) {
        breakStart = entryTime
      } else if (entry.entry_type === 'break_end' && breakStart) {
        const breakDuration = (entryTime.getTime() - breakStart.getTime()) / 60000
        breakMinutes += breakDuration
        breakStart = null
      } else if (entry.entry_type === 'work_end' && workStart) {
        workEnd = entryTime
        hasWorkEnd = true
        const totalDuration = (workEnd.getTime() - workStart.getTime()) / 60000
        workMinutes = totalDuration - breakMinutes
      }
    }

    if (workStart && !workEnd) {
      const now = new Date()
      const totalDuration = (now.getTime() - workStart.getTime()) / 60000
      if (breakStart) {
        const currentBreakDuration = (now.getTime() - breakStart.getTime()) / 60000
        breakMinutes += currentBreakDuration
      }
      workMinutes = totalDuration - breakMinutes
    }

    const date = new Date(dateKey)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`

    let status: DailyStat['status'] = 'no_data'
    if (hasWorkStart && hasWorkEnd) {
      status = 'complete'
    } else if (hasWorkStart) {
      status = 'in_progress'
    }

    stats.push({
      date: dateKey,
      dateStr,
      workStart: workStart ? formatTime(workStart) : undefined,
      workEnd: workEnd ? formatTime(workEnd) : undefined,
      breakMinutes: Math.round(breakMinutes),
      workMinutes: Math.round(workMinutes),
      status,
      entries: sortedEntries,
    })
  })

  return stats.sort((a, b) => b.date.localeCompare(a.date))
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${String(mins).padStart(2, '0')}`
}

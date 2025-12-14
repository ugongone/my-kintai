import type { TimeEntry } from '@/types/database'

export type DailyStat = {
  id: string  // セッション識別子（work_startエントリのID）
  date: string
  dateStr: string
  workStart?: string
  workEnd?: string
  workMinutes: number
  entries: TimeEntry[]
}

export function calculateDailyStats(entries: TimeEntry[]): DailyStat[] {
  const dailyMap = new Map<string, TimeEntry[]>()

  // work_dateでグループ化
  entries.forEach((entry) => {
    const dateKey = entry.work_date

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

    // セッション単位で計算
    const sessions: Array<{
      id: string
      workStart: Date
      workEnd: Date | null
      workMinutes: number
      entries: TimeEntry[]
    }> = []

    let currentSession: {
      id: string
      workStart: Date
      entries: TimeEntry[]
    } | null = null

    for (const entry of sortedEntries) {
      const entryTime = new Date(entry.entry_time)

      if (entry.entry_type === 'work_start') {
        // 前のセッションが未完了なら現在時刻で終了
        if (currentSession) {
          const now = new Date()
          const duration = (now.getTime() - currentSession.workStart.getTime()) / 60000
          sessions.push({
            id: currentSession.id,
            workStart: currentSession.workStart,
            workEnd: null,
            workMinutes: duration,
            entries: currentSession.entries
          })
        }
        // 新しいセッション開始
        currentSession = {
          id: entry.id,
          workStart: entryTime,
          entries: [entry]
        }
      } else if (entry.entry_type === 'work_end' && currentSession) {
        currentSession.entries.push(entry)
        const duration = (entryTime.getTime() - currentSession.workStart.getTime()) / 60000
        sessions.push({
          id: currentSession.id,
          workStart: currentSession.workStart,
          workEnd: entryTime,
          workMinutes: duration,
          entries: currentSession.entries
        })
        currentSession = null
      }
    }

    // 最後のセッションが未完了の場合
    if (currentSession) {
      const now = new Date()
      const duration = (now.getTime() - currentSession.workStart.getTime()) / 60000
      sessions.push({
        id: currentSession.id,
        workStart: currentSession.workStart,
        workEnd: null,
        workMinutes: duration,
        entries: currentSession.entries
      })
    }

    const date = new Date(dateKey)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`

    // セッションごとにDailyStatを生成
    for (const session of sessions) {
      stats.push({
        id: session.id,
        date: dateKey,
        dateStr,
        workStart: formatTime(session.workStart),
        workEnd: session.workEnd ? formatTimeWithNextDay(session.workEnd, dateKey) : undefined,
        workMinutes: Math.round(session.workMinutes),
        entries: session.entries,
      })
    }
  })

  // 日付降順、同日内は開始時刻昇順でソート
  return stats.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return (a.workStart || '').localeCompare(b.workStart || '')
  })
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatTimeWithNextDay(date: Date, workDate: string): string {
  const endDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  if (endDateStr > workDate) {
    const hours = date.getHours() + 24
    return `${hours}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return formatTime(date)
}

export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${String(mins).padStart(2, '0')}`
}

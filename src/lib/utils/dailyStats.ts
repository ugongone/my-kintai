import type { TimeEntry } from '@/types/database'

export type DailyStat = {
  id: string  // セッション識別子（work_startエントリのID）
  date: string
  dateStr: string
  workStart?: string
  workEnd?: string
  breakMinutes: number
  workMinutes: number
  entries: TimeEntry[]
}

export function calculateDailyStats(entries: TimeEntry[]): DailyStat[] {
  const dailyMap = new Map<string, TimeEntry[]>()

  // work_dateでグループ化（B案: 全エントリが同じwork_dateを持つ）
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

    // セッション単位で計算（エントリも追跡）
    const sessions: Array<{
      id: string  // work_startエントリのID
      workStart: Date
      workEnd: Date | null
      breakMinutes: number
      workMinutes: number
      entries: TimeEntry[]
    }> = []

    let currentSession: {
      id: string
      workStart: Date | null
      workEnd: Date | null
      breakStart: Date | null
      breakMinutes: number
      entries: TimeEntry[]
    } | null = null

    for (const entry of sortedEntries) {
      const entryTime = new Date(entry.entry_time)

      if (entry.entry_type === 'work_start') {
        // 前のセッションが未完了なら現在時刻で終了
        if (currentSession && currentSession.workStart && !currentSession.workEnd) {
          const now = new Date()
          let breakMinutes = currentSession.breakMinutes
          if (currentSession.breakStart) {
            breakMinutes += (now.getTime() - currentSession.breakStart.getTime()) / 60000
          }
          const duration = (now.getTime() - currentSession.workStart.getTime()) / 60000
          sessions.push({
            id: currentSession.id,
            workStart: currentSession.workStart,
            workEnd: null,
            breakMinutes,
            workMinutes: duration - breakMinutes,
            entries: currentSession.entries
          })
        }
        // 新しいセッション開始
        currentSession = {
          id: entry.id,
          workStart: entryTime,
          workEnd: null,
          breakStart: null,
          breakMinutes: 0,
          entries: [entry]
        }
      } else if (entry.entry_type === 'break_start' && currentSession?.workStart) {
        currentSession.breakStart = entryTime
        currentSession.entries.push(entry)
      } else if (entry.entry_type === 'break_end' && currentSession?.breakStart) {
        const breakDuration = (entryTime.getTime() - currentSession.breakStart.getTime()) / 60000
        currentSession.breakMinutes += breakDuration
        currentSession.breakStart = null
        currentSession.entries.push(entry)
      } else if (entry.entry_type === 'work_end' && currentSession?.workStart) {
        currentSession.workEnd = entryTime
        currentSession.entries.push(entry)
        const duration = (entryTime.getTime() - currentSession.workStart.getTime()) / 60000
        sessions.push({
          id: currentSession.id,
          workStart: currentSession.workStart,
          workEnd: currentSession.workEnd,
          breakMinutes: currentSession.breakMinutes,
          workMinutes: duration - currentSession.breakMinutes,
          entries: currentSession.entries
        })
        currentSession = null
      }
    }

    // 最後のセッションが未完了の場合
    if (currentSession && currentSession.workStart && !currentSession.workEnd) {
      const now = new Date()
      let breakMinutes = currentSession.breakMinutes
      if (currentSession.breakStart) {
        breakMinutes += (now.getTime() - currentSession.breakStart.getTime()) / 60000
      }
      const duration = (now.getTime() - currentSession.workStart.getTime()) / 60000
      sessions.push({
        id: currentSession.id,
        workStart: currentSession.workStart,
        workEnd: null,
        breakMinutes,
        workMinutes: duration - breakMinutes,
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
        breakMinutes: Math.round(session.breakMinutes),
        workMinutes: Math.round(session.workMinutes),
        entries: session.entries,
      })
    }
  })

  return stats.sort((a, b) => b.date.localeCompare(a.date))
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatTimeWithNextDay(date: Date, workDate: string): string {
  // 終了時刻の日付がwork_dateの翌日かどうか判定
  const endDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  if (endDateStr > workDate) {
    // 翌日の場合は24+時間で表示（例: 1:00 → 25:00）
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

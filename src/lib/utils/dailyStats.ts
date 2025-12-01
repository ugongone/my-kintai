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

    // セッション単位で計算
    const sessions: Array<{
      workStart: Date
      workEnd: Date | null
      breakMinutes: number
      workMinutes: number
    }> = []

    let currentSession: {
      workStart: Date | null
      workEnd: Date | null
      breakStart: Date | null
      breakMinutes: number
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
            workStart: currentSession.workStart,
            workEnd: null,
            breakMinutes,
            workMinutes: duration - breakMinutes
          })
        }
        // 新しいセッション開始
        currentSession = {
          workStart: entryTime,
          workEnd: null,
          breakStart: null,
          breakMinutes: 0
        }
      } else if (entry.entry_type === 'break_start' && currentSession?.workStart) {
        currentSession.breakStart = entryTime
      } else if (entry.entry_type === 'break_end' && currentSession?.breakStart) {
        const breakDuration = (entryTime.getTime() - currentSession.breakStart.getTime()) / 60000
        currentSession.breakMinutes += breakDuration
        currentSession.breakStart = null
      } else if (entry.entry_type === 'work_end' && currentSession?.workStart) {
        currentSession.workEnd = entryTime
        const duration = (entryTime.getTime() - currentSession.workStart.getTime()) / 60000
        sessions.push({
          workStart: currentSession.workStart,
          workEnd: currentSession.workEnd,
          breakMinutes: currentSession.breakMinutes,
          workMinutes: duration - currentSession.breakMinutes
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
        workStart: currentSession.workStart,
        workEnd: null,
        breakMinutes,
        workMinutes: duration - breakMinutes
      })
    }

    // 全セッションの合算
    const totalBreakMinutes = sessions.reduce((sum, s) => sum + s.breakMinutes, 0)
    const totalWorkMinutes = sessions.reduce((sum, s) => sum + s.workMinutes, 0)

    // 最初のセッションの開始時刻と最後のセッションの終了時刻
    const firstSession = sessions[0]
    const lastSession = sessions[sessions.length - 1]

    const workStart = firstSession?.workStart
    const workEnd = lastSession?.workEnd

    const date = new Date(dateKey)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`

    let status: DailyStat['status'] = 'no_data'
    if (sessions.length > 0) {
      if (sessions.some(s => s.workEnd === null)) {
        status = 'in_progress'
      } else {
        status = 'complete'
      }
    }

    stats.push({
      date: dateKey,
      dateStr,
      workStart: workStart ? formatTime(workStart) : undefined,
      workEnd: workEnd ? formatTime(workEnd) : undefined,
      breakMinutes: Math.round(totalBreakMinutes),
      workMinutes: Math.round(totalWorkMinutes),
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

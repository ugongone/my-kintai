'use client'

import { useState, useMemo } from 'react'
import { StatusCard } from '@/components/dashboard/StatusCard'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { RecentHistory } from '@/components/dashboard/RecentHistory'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useSettings } from '@/hooks/useSettings'
import { getCurrentStatus, getLastEntryTime } from '@/lib/utils/workStatus'
import { calculateDailyStats } from '@/lib/utils/dailyStats'
import { validateNewEntry } from '@/lib/utils/validation'
import type { EntryType } from '@/types/database'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { entries, loading: entriesLoading, addEntry } = useTimeEntries()
  const { settings } = useSettings()

  const currentStatus = getCurrentStatus(entries)
  const lastEntryTime = getLastEntryTime(entries)
  const dailyStats = useMemo(() => calculateDailyStats(entries), [entries])
  const totalWorkMinutes = dailyStats.reduce((sum, stat) => sum + stat.workMinutes, 0)
  const totalHours = totalWorkMinutes / 60
  const hourlyRate = settings?.hourly_rate || 0
  const estimatedEarnings = totalHours * hourlyRate

  const recentEntries = dailyStats.slice(0, 3).map((stat) => ({
    id: stat.id,
    date: stat.dateStr,
    startTime: stat.workStart || '-',
    endTime: stat.workEnd,
    workTime: stat.workMinutes,
  }))

  const handlePunchIn = async () => {
    try {
      const errors = validateNewEntry('work_start', new Date(), entries)
      const criticalErrors = errors.filter(e => e.severity === 'error')

      if (criticalErrors.length > 0) {
        alert(criticalErrors.map(e => e.message).join('\n'))
        return
      }

      const warnings = errors.filter(e => e.severity === 'warning')
      if (warnings.length > 0) {
        const confirmed = confirm(
          warnings.map(e => e.message).join('\n') + '\n\n続行しますか？'
        )
        if (!confirmed) return
      }

      await addEntry('work_start')
    } catch (error) {
      console.error('打刻エラー:', error)
      alert('打刻に失敗しました')
    }
  }

  const handlePunchOut = async () => {
    try {
      const errors = validateNewEntry('work_end', new Date(), entries)
      const criticalErrors = errors.filter(e => e.severity === 'error')

      if (criticalErrors.length > 0) {
        alert(criticalErrors.map(e => e.message).join('\n'))
        return
      }

      const warnings = errors.filter(e => e.severity === 'warning')
      if (warnings.length > 0) {
        const confirmed = confirm(
          warnings.map(e => e.message).join('\n') + '\n\n続行しますか？'
        )
        if (!confirmed) return
      }

      await addEntry('work_end')
    } catch (error) {
      console.error('打刻エラー:', error)
      alert('打刻に失敗しました')
    }
  }

  const handleManualEntry = async (data: {
    date: string
    time: string
    entryType: string
    note?: string
  }) => {
    try {
      const entryTime = new Date(`${data.date}T${data.time}`)

      const errors = validateNewEntry(data.entryType as EntryType, entryTime, entries)
      const criticalErrors = errors.filter(e => e.severity === 'error')

      if (criticalErrors.length > 0) {
        alert(criticalErrors.map(e => e.message).join('\n'))
        return
      }

      await addEntry(data.entryType as EntryType, entryTime, data.note)
    } catch (error) {
      console.error('手動打刻エラー:', error)
      alert('手動打刻に失敗しました')
    }
  }

  if (entriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 打刻エリア */}
        <div className="md:col-span-2">
          <StatusCard
            currentStatus={currentStatus}
            lastEntryTime={lastEntryTime}
            onPunchIn={handlePunchIn}
            onPunchOut={handlePunchOut}
            onManualEntry={() => setIsModalOpen(true)}
          />
        </div>

        {/* 統計カード */}
        <div className="space-y-6">
          <SummaryCard
            totalHours={totalHours}
            estimatedEarnings={estimatedEarnings}
            hourlyRate={hourlyRate}
          />
        </div>
      </div>

      <RecentHistory entries={recentEntries} />

      <ManualEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleManualEntry}
      />
    </div>
  )
}

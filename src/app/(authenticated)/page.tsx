'use client'

import { useState } from 'react'
import { StatusCard } from '@/components/dashboard/StatusCard'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { RecentHistory } from '@/components/dashboard/RecentHistory'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useSettings } from '@/hooks/useSettings'
import { getCurrentStatus, getLastEntryTime, calculateMonthlyStats } from '@/lib/utils/workStatus'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { entries, loading: entriesLoading, addEntry } = useTimeEntries()
  const { settings } = useSettings()

  const currentStatus = getCurrentStatus(entries)
  const lastEntryTime = getLastEntryTime(entries)
  const { totalHours } = calculateMonthlyStats(entries)
  const estimatedEarnings = totalHours * (settings?.hourly_rate || 0)

  const recentEntries = entries.slice(0, 3).map((entry) => ({
    id: entry.id,
    date: new Date(entry.entry_time).toLocaleDateString('ja-JP'),
    status: 'completed' as const,
    startTime: new Date(entry.entry_time).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    endTime: undefined,
    breakTime: 0,
    workTime: 0,
  }))

  const handlePunchIn = async () => {
    try {
      await addEntry('work_start')
    } catch (error) {
      console.error('打刻エラー:', error)
      alert('打刻に失敗しました')
    }
  }

  const handlePunchOut = async () => {
    try {
      await addEntry('work_end')
    } catch (error) {
      console.error('打刻エラー:', error)
      alert('打刻に失敗しました')
    }
  }

  const handleBreakStart = async () => {
    try {
      await addEntry('break_start')
    } catch (error) {
      console.error('打刻エラー:', error)
      alert('打刻に失敗しました')
    }
  }

  const handleBreakEnd = async () => {
    try {
      await addEntry('break_end')
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
      await addEntry(data.entryType as any, entryTime, data.note)
    } catch (error) {
      console.error('手動打刻エラー:', error)
      alert('手動打刻に失敗しました')
    }
  }

  if (entriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">打刻・ホーム</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatusCard
            currentStatus={currentStatus}
            lastEntryTime={lastEntryTime}
            onPunchIn={handlePunchIn}
            onPunchOut={handlePunchOut}
            onBreakStart={handleBreakStart}
            onBreakEnd={handleBreakEnd}
            onManualEntry={() => setIsModalOpen(true)}
          />
        </div>

        <div className="lg:col-span-2">
          <SummaryCard
            totalHours={totalHours}
            estimatedEarnings={estimatedEarnings}
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

'use client'

import { useState } from 'react'
import { StatusCard } from '@/components/dashboard/StatusCard'
import { ManualEntryModal } from '@/components/dashboard/ManualEntryModal'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { RecentHistory } from '@/components/dashboard/RecentHistory'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // TODO: 実際のデータはフェーズ6で実装
  const currentStatus = 'offline' as const
  const totalHours = 0
  const estimatedEarnings = 0
  const recentEntries: any[] = []

  const handlePunchIn = () => {
    console.log('業務開始')
    // TODO: フェーズ6で実装
  }

  const handlePunchOut = () => {
    console.log('業務終了')
    // TODO: フェーズ6で実装
  }

  const handleBreakStart = () => {
    console.log('休憩開始')
    // TODO: フェーズ6で実装
  }

  const handleBreakEnd = () => {
    console.log('休憩終了')
    // TODO: フェーズ6で実装
  }

  const handleManualEntry = (data: any) => {
    console.log('手動打刻:', data)
    // TODO: フェーズ6で実装
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">打刻・ホーム</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatusCard
            currentStatus={currentStatus}
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

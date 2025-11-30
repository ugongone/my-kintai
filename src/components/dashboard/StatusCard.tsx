'use client'

import { useState, useEffect } from 'react'
import { Clock, Play, Pause, Square } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

type WorkStatus = 'offline' | 'working' | 'break'

interface StatusCardProps {
  onPunchIn: () => void
  onPunchOut: () => void
  onBreakStart: () => void
  onBreakEnd: () => void
  onManualEntry: () => void
  currentStatus: WorkStatus
  lastEntryTime?: string
}

const statusConfig = {
  offline: {
    label: '稼働外',
    variant: 'default' as const,
    color: 'text-slate-600',
  },
  working: {
    label: '稼働中',
    variant: 'success' as const,
    color: 'text-green-600',
  },
  break: {
    label: '休憩中',
    variant: 'warning' as const,
    color: 'text-orange-600',
  },
}

export function StatusCard({
  onPunchIn,
  onPunchOut,
  onBreakStart,
  onBreakEnd,
  onManualEntry,
  currentStatus,
  lastEntryTime,
}: StatusCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const status = statusConfig[currentStatus]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">打刻</h2>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className={`w-6 h-6 ${status.color}`} />
          <div className={`text-4xl font-bold ${status.color}`}>
            {formatTime(currentTime)}
          </div>
        </div>
        <div className="text-gray-600">{formatDate(currentTime)}</div>
        {lastEntryTime && (
          <div className="text-sm text-gray-500 mt-2">
            最終打刻: {lastEntryTime}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {currentStatus === 'offline' && (
          <Button
            variant="primary"
            fullWidth
            onClick={onPunchIn}
            className="flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            業務開始
          </Button>
        )}

        {currentStatus === 'working' && (
          <>
            <Button
              variant="warning"
              fullWidth
              onClick={onBreakStart}
              className="flex items-center justify-center gap-2"
            >
              <Pause className="w-5 h-5" />
              休憩開始
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={onPunchOut}
              className="flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              業務終了
            </Button>
          </>
        )}

        {currentStatus === 'break' && (
          <Button
            variant="success"
            fullWidth
            onClick={onBreakEnd}
            className="flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            休憩終了
          </Button>
        )}

        <button
          onClick={onManualEntry}
          className="w-full text-sm text-blue-600 hover:text-blue-700 py-2"
        >
          手動で打刻を追加
        </button>
      </div>
    </div>
  )
}

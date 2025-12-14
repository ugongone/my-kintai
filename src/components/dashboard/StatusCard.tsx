'use client'

import { useState, useEffect } from 'react'
import { Clock, Play, Square, Edit3 } from 'lucide-react'

type WorkStatus = 'offline' | 'working'

interface StatusCardProps {
  onPunchIn: () => void
  onPunchOut: () => void
  onManualEntry: () => void
  currentStatus: WorkStatus
  lastEntryTime?: string
}

export function StatusCard({
  onPunchIn,
  onPunchOut,
  onManualEntry,
  currentStatus,
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
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Clock size={120} />
      </div>

      <div>
        <h2 className="text-slate-500 font-medium mb-1">現在の時刻</h2>
        <div className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight font-mono">
          {formatTime(currentTime)}
          <span className="text-xl md:text-2xl text-slate-400 ml-3 font-normal">
            {currentTime.getSeconds().toString().padStart(2, '0')}
          </span>
        </div>
        <p className="text-slate-400 mt-2">{formatDate(currentTime)}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          {currentStatus === 'offline' && (
            <button
              onClick={onPunchIn}
              className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
            >
              <Play size={24} />
              業務開始
            </button>
          )}

          {currentStatus === 'working' && (
            <button
              onClick={onPunchOut}
              className="flex-1 min-w-[140px] bg-slate-700 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-300 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
            >
              <Square size={24} />
              業務終了
            </button>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onManualEntry}
            className="text-sm text-slate-400 hover:text-blue-600 font-medium flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
          >
            <Edit3 size={14} />
            時間を指定して打刻（修正・後日入力）
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <span
          className={`h-3 w-3 rounded-full ${
            currentStatus === 'working'
              ? 'bg-green-500 animate-pulse'
              : 'bg-slate-300'
          }`}
        ></span>
        <span className="text-sm text-slate-500 font-medium">
          ステータス: {currentStatus === 'working' ? '稼働中' : '稼働外'}
        </span>
      </div>
    </div>
  )
}

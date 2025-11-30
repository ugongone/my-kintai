import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ChevronRight } from 'lucide-react'

type WorkEntry = {
  id: string
  date: string
  status: 'completed' | 'in-progress'
  startTime: string
  endTime?: string
  breakTime: number
  workTime: number
}

interface RecentHistoryProps {
  entries: WorkEntry[]
}

export function RecentHistory({ entries }: RecentHistoryProps) {
  const formatTime = (time: string) => {
    return time
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">直近の稼働</h2>
        <Link
          href="/history"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          すべて見る
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-8">稼働履歴がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  日付
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  ステータス
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  開始
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  終了
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  休憩
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  実働
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {entry.date}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        entry.status === 'completed' ? 'success' : 'warning'
                      }
                    >
                      {entry.status === 'completed' ? '完了' : '稼働中'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {formatTime(entry.startTime)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {entry.endTime ? formatTime(entry.endTime) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {formatDuration(entry.breakTime)}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {formatDuration(entry.workTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

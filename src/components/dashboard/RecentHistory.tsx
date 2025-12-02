import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">直近の稼働</h3>
        <Link
          href="/history"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          すべて見る
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-500 text-center py-8">稼働履歴がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">日付</th>
                <th className="px-6 py-3 font-medium">ステータス</th>
                <th className="px-6 py-3 font-medium">開始</th>
                <th className="px-6 py-3 font-medium">終了</th>
                <th className="px-6 py-3 font-medium">実働時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {entry.status === 'completed' ? '稼働' : '稼働中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatTime(entry.startTime)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {entry.endTime ? formatTime(entry.endTime) : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {formatDuration(entry.workTime)}h
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

import { Badge } from '@/components/ui/Badge'
import { formatMinutesToHours, type DailyStat } from '@/lib/utils/dailyStats'

type HistoryTableProps = {
  stats: DailyStat[]
}

export function HistoryTable({ stats }: HistoryTableProps) {
  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        この月の打刻データがありません
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                開始時刻
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                終了時刻
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                休憩時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                実働時間
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((stat) => (
              <tr key={stat.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.dateStr}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {stat.status === 'complete' && (
                    <Badge variant="success">完了</Badge>
                  )}
                  {stat.status === 'in_progress' && (
                    <Badge variant="warning">稼働中</Badge>
                  )}
                  {stat.status === 'no_data' && (
                    <Badge variant="default">データなし</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.workStart || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.workEnd || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.breakMinutes > 0 ? formatMinutesToHours(stat.breakMinutes) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stat.workMinutes > 0 ? formatMinutesToHours(stat.workMinutes) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

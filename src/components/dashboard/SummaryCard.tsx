import { Clock, Coins } from 'lucide-react'

interface SummaryCardProps {
  totalHours: number
  estimatedEarnings: number
}

export function SummaryCard({ totalHours, estimatedEarnings }: SummaryCardProps) {
  const formatHours = (hours: number) => {
    return hours.toFixed(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">今月の総稼働時間</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatHours(totalHours)}
          <span className="text-lg font-normal text-gray-600 ml-1">時間</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <Coins className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">概算報酬額</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(estimatedEarnings)}
        </p>
      </div>
    </div>
  )
}

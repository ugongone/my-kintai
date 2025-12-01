import { ChevronLeft, ChevronRight } from 'lucide-react'

type MonthSelectorProps = {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function MonthSelector({ year, month, onPrevMonth, onNextMonth }: MonthSelectorProps) {
  const currentDate = new Date()
  const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth()

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="前月"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <h2 className="text-xl font-bold text-gray-900">
        {year}年{month + 1}月
      </h2>

      <button
        onClick={onNextMonth}
        disabled={isCurrentMonth}
        className={`p-2 rounded-lg transition-colors ${
          isCurrentMonth
            ? 'text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        aria-label="次月"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

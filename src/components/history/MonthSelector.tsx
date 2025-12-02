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
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-white rounded-md transition-shadow hover:shadow-sm text-slate-500"
        aria-label="前月"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="px-4 font-bold text-slate-700">
        {year}年 {month + 1}月
      </span>
      <button
        onClick={onNextMonth}
        disabled={isCurrentMonth}
        className={`p-2 rounded-md transition-shadow ${
          isCurrentMonth
            ? 'text-slate-300 cursor-not-allowed'
            : 'hover:bg-white hover:shadow-sm text-slate-500'
        }`}
        aria-label="次月"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

'use client'

import { Menu, Bell } from 'lucide-react'

type HeaderProps = {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="メニューを開く"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="text-lg font-bold text-gray-900">MyKintai</h1>

        <button
          className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          aria-label="通知"
        >
          <Bell className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  )
}

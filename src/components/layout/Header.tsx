'use client'

import { Menu, Bell } from 'lucide-react'

type HeaderProps = {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        aria-label="メニューを開く"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  )
}

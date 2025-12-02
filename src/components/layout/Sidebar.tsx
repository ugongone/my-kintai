'use client'

import { useAuth } from '@/hooks/useAuth'
import { Briefcase, Clock, Calendar, Settings, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const menuItems = [
    { href: '/', label: '打刻・ホーム', icon: Clock },
    { href: '/history', label: '月次実績', icon: Calendar },
    { href: '/settings', label: '設定', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* ロゴエリア */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Briefcase size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              My<span className="text-blue-600">Kintai</span>
            </span>
          </div>

          {/* メニューリスト */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 w-full p-3 rounded-lg transition-colors duration-200
                    ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* ユーザープロファイル */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.user_metadata?.full_name || user?.email || 'ゲスト'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={signOut}
                className="text-slate-400 hover:text-slate-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

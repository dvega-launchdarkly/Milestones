'use client'

import { useHistoryEnabled } from '@/components/LaunchDarkly/LaunchDarklyProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/search', label: 'Search Music', icon: '🔍' },
  { href: '/dashboard/history', label: 'History', icon: '📋' },
  { href: '/dashboard/settings/family', label: 'Family', icon: '👨‍👩‍👧' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { href: '/about', label: 'About', icon: 'ℹ️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const historyEnabled = useHistoryEnabled()
  const items = historyEnabled
    ? navigation
    : navigation.filter((item) => item.href !== '/dashboard/history')

  return (
    <aside className="w-64 bg-surface border-r border-ink/15 p-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Navigation
          </h2>
          <nav className="space-y-2">
            {items.map((item) => {
              const isActive =
                item.href === '/' || item.href === '/dashboard'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-ink/10 text-ink font-semibold'
                      : 'text-ink/80 hover:bg-ink/10'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

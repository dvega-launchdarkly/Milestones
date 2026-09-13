'use client'

import { useHistoryEnabled } from '@/components/LaunchDarkly/LaunchDarklyProvider'
import {
  History,
  Home,
  Info,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/search', label: 'Search Music', Icon: Search },
  { href: '/dashboard/history', label: 'Family History', Icon: History },
  { href: '/dashboard/settings/family', label: 'Invite Family', Icon: Users },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
  { href: '/about', label: 'About', Icon: Info },
]

export default function Sidebar({ mobileOpen = false }: { mobileOpen?: boolean }) {
  const pathname = usePathname()
  const historyEnabled = useHistoryEnabled()
  const items = historyEnabled
    ? navigation
    : navigation.filter((item) => item.href !== '/dashboard/history')

  return (
    <aside
      id="dashboard-sidebar"
      className={`${
        mobileOpen ? 'block' : 'hidden'
      } md:block w-full md:w-64 shrink-0 bg-surface border-b border-ink/15 md:border-b-0 md:border-r p-6`}
    >
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
                  <item.Icon className="h-5 w-5 shrink-0" aria-hidden />
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

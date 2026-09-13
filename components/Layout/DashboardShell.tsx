'use client'

import Navbar from '@/components/Layout/Navbar'
import Sidebar from '@/components/Layout/Sidebar'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar mobileOpen={menuOpen} />
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

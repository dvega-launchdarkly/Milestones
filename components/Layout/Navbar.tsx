'use client'

import Logo from '@/components/Layout/Logo'
import { UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
  menuOpen?: boolean
  onToggleMenu?: () => void
}

export default function Navbar({ menuOpen = false, onToggleMenu }: NavbarProps) {
  return (
    <nav className="bg-ink px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {onToggleMenu && (
          <button
            type="button"
            onClick={onToggleMenu}
            aria-expanded={menuOpen}
            aria-controls="dashboard-sidebar"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-surface hover:bg-surface/10 transition-colors"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        )}
        <Logo />
      </div>

      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'border border-surface rounded-full',
          },
        }}
      />
    </nav>
  )
}

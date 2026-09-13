'use client'

import Logo from '@/components/Layout/Logo'
import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const linkClass = 'text-surface font-medium hover:text-surface/80'
const lightButtonClass =
  'inline-flex items-center justify-center px-4 py-2 bg-surface text-ink font-medium rounded-full hover:bg-surface/90 transition-colors'

function NavItems({
  isSignedIn,
  onNavigate,
}: {
  isSignedIn: boolean
  onNavigate?: () => void
}) {
  return (
    <>
      <Link href="/" className={linkClass} onClick={onNavigate}>
        Home
      </Link>
      <Link href="/about" className={linkClass} onClick={onNavigate}>
        About
      </Link>
      {isSignedIn ? (
        <>
          <Link href="/dashboard" className={lightButtonClass} onClick={onNavigate}>
            Dashboard
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'border border-surface rounded-full',
              },
            }}
          />
        </>
      ) : (
        <>
          <Link href="/auth/login" className={linkClass} onClick={onNavigate}>
            Log In
          </Link>
          <Link href="/auth/signup" className={lightButtonClass} onClick={onNavigate}>
            Sign Up
          </Link>
        </>
      )}
    </>
  )
}

export default function MarketingNav() {
  const { isLoaded, isSignedIn } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const signedIn = Boolean(isLoaded && isSignedIn)

  return (
    <nav className="bg-ink">
      <div className="px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
        <Logo />

        <div className="hidden md:flex items-center gap-4">
          <NavItems isSignedIn={signedIn} />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="marketing-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-surface hover:bg-surface/10 transition-colors"
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="marketing-menu"
          className="md:hidden flex flex-col items-start gap-4 border-t border-surface/20 px-4 py-4"
        >
          <NavItems isSignedIn={signedIn} onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  )
}

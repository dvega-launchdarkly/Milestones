'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Logo from '@/components/Layout/Logo'

const linkClass = 'text-surface font-medium hover:text-surface/80'
const lightButtonClass =
  'inline-flex items-center justify-center px-4 py-2 bg-surface text-ink font-medium rounded-lg hover:bg-surface/90 transition-colors'

export default function MarketingNav() {
  const { isLoaded, isSignedIn } = useUser()

  return (
    <nav className="bg-ink px-8 py-2 flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-4">
        <Link href="/" className={linkClass}>
          Home
        </Link>
        <Link href="/about" className={linkClass}>
          About
        </Link>
        {isLoaded && isSignedIn ? (
          <>
            <Link href="/dashboard" className={lightButtonClass}>
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
            <Link href="/auth/login" className={linkClass}>
              Log In
            </Link>
            <Link href="/auth/signup" className={lightButtonClass}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

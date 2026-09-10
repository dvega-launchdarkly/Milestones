'use client'

import { UserButton } from '@clerk/nextjs'
import Logo from '@/components/Layout/Logo'

export default function Navbar() {
  return (
    <nav className="bg-ink px-8 py-4 flex items-center justify-between">
      <Logo className="h-8 w-auto" />
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

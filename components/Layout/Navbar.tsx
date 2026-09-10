'use client'

import { UserButton } from '@clerk/nextjs'
import Logo from '@/components/Layout/Logo'

export default function Navbar() {
  return (
    <nav className="bg-ink px-8 py-2 flex items-center justify-between">
      <Logo />
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

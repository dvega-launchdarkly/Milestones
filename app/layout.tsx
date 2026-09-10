import type { Metadata } from 'next'
import { Questrial } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import LaunchDarklyProvider from '@/components/LaunchDarkly/LaunchDarklyProvider'
import './globals.css'

const questrial = Questrial({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-questrial',
})

export const metadata: Metadata = {
  title: 'Milestones - Track Your Child\'s Musical Journey',
  description: 'Track what music, movies, TV, and books your children enjoy and understand their growing preferences.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={questrial.variable}>
        <body className={questrial.className}>
          <LaunchDarklyProvider>{children}</LaunchDarklyProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

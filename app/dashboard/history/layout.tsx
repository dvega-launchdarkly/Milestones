import { isHistoryEnabled } from '@/lib/launchdarkly-server'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HistoryLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  const enabled = await isHistoryEnabled(userId)

  if (!enabled) {
    redirect('/dashboard')
  }

  return children
}

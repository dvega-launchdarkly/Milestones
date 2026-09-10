import { isHistoryEnabled } from '@/lib/launchdarkly-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HistoryLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isHistoryEnabled()

  if (!enabled) {
    redirect('/dashboard')
  }

  return children
}

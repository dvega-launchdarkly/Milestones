import ChildHistoryNav from '@/components/History/ChildHistoryNav'
import { listChildrenForCurrentParent } from '@/lib/children'
import { isHistoryEnabled } from '@/lib/launchdarkly-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HistoryLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isHistoryEnabled()

  if (!enabled) {
    redirect('/dashboard')
  }

  const childProfiles = await listChildrenForCurrentParent().catch(() => [])

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-ink">History</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">All children</p>
      <ChildHistoryNav childProfiles={childProfiles} />
      {children}
    </div>
  )
}

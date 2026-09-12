import ChildIcon from '@/components/Child/ChildIcon'
import ChildHistoryNav from '@/components/History/ChildHistoryNav'
import { verifyChildOwnership } from '@/lib/auth'
import { childDisplayName } from '@/lib/child-icon-ids'
import { listChildrenForCurrentParent } from '@/lib/children'
import { isHistoryEnabled } from '@/lib/launchdarkly-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ChildHistoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { childId: string }
}) {
  const enabled = await isHistoryEnabled()

  const child = enabled
    ? await verifyChildOwnership(params.childId).catch(() => null)
    : null

  if (!child) {
    redirect('/dashboard')
  }

  const childProfiles = await listChildrenForCurrentParent().catch(() => [])

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
          <ChildIcon icon={child.icon} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">{childDisplayName(child)}</h1>
          <p className="text-sm text-gray-500 mt-1">Listening history</p>
        </div>
      </div>
      <ChildHistoryNav childProfiles={childProfiles} activeChildId={child.id} />
      {children}
    </div>
  )
}

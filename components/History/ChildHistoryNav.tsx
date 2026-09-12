import ChildIcon from '@/components/Child/ChildIcon'
import { childDisplayName } from '@/lib/child-icon-ids'
import Link from 'next/link'

interface ChildHistoryNavProps {
  childProfiles: Array<{ id: string; firstName: string; lastName: string; icon: string }>
  activeChildId?: string | null
}

const baseClass =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-colors'
const activeClass = 'bg-ink text-white border-ink'
const inactiveClass = 'bg-surface text-ink border-ink/30 hover:border-ink'

export default function ChildHistoryNav({ childProfiles, activeChildId }: ChildHistoryNavProps) {
  if (childProfiles.length === 0) return null

  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="History by child">
      <Link
        href="/dashboard/history"
        aria-current={activeChildId ? undefined : 'page'}
        className={`${baseClass} ${activeChildId ? inactiveClass : activeClass}`}
      >
        All children
      </Link>
      {childProfiles.map((child) => {
        const active = activeChildId === child.id
        return (
          <Link
            key={child.id}
            href={`/dashboard/child/${child.id}/history`}
            aria-current={active ? 'page' : undefined}
            className={`${baseClass} ${active ? activeClass : inactiveClass}`}
          >
            <ChildIcon icon={child.icon} className="h-4 w-4" />
            {childDisplayName(child)}
          </Link>
        )
      })}
    </nav>
  )
}

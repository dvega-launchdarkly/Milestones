'use client'

import ChildIcon from '@/components/Child/ChildIcon'
import { childDisplayName } from '@/lib/child-icon-ids'
import { formatAge, formatDateOnly } from '@/lib/dates'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

export interface DashboardChild {
  id: string
  firstName: string
  lastName: string
  icon: string
  birthDate: string
  songCount?: number
}

interface ChildCardProps {
  child: DashboardChild
  updatedLayout: boolean
  historyEnabled: boolean
  onDelete: () => void
}

export default function ChildCard({ child, updatedLayout, historyEnabled, onDelete }: ChildCardProps) {
  const name = childDisplayName(child)
  const songCount = child.songCount ?? 0

  return (
    <div className={`card ${updatedLayout ? 'relative' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
          <ChildIcon icon={child.icon} className="h-6 w-6" />
        </div>
        <div className={`min-w-0 ${updatedLayout ? 'pr-12' : ''}`}>
          <h2 className="text-xl font-semibold text-ink">{name}</h2>
          <p className="text-sm text-gray-500">
            {updatedLayout ? formatAge(child.birthDate) : `Born ${formatDateOnly(child.birthDate)}`}
          </p>
        </div>
        {updatedLayout && (
          <span
            className="absolute top-3 right-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-ink/10 px-2 text-sm font-semibold text-ink"
            aria-label={`${songCount} ${songCount === 1 ? 'song' : 'songs'} logged`}
            title={`${songCount} ${songCount === 1 ? 'song' : 'songs'} logged`}
          >
            {songCount}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/search" className="btn-primary">
          Log a song
        </Link>
        <Link href={`/dashboard/child/${child.id}/edit`} className="btn-secondary">
          Edit
        </Link>
        {historyEnabled && (
          <Link href={`/dashboard/child/${child.id}/history`} className="btn-outline">
            View history
          </Link>
        )}
        {updatedLayout ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${name}`}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600/70 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-700 font-medium rounded-full hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

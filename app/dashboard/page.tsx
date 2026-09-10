'use client'

import ChildIcon from '@/components/Child/ChildIcon'
import ConfirmDialog from '@/components/Common/ConfirmDialog'
import { useHistoryEnabled } from '@/components/LaunchDarkly/LaunchDarklyProvider'
import { childDisplayName } from '@/lib/child-icon-ids'
import { formatDateOnly } from '@/lib/dates'
import { requestLdContextRefresh } from '@/lib/ld-context'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Child {
  id: string
  firstName: string
  lastName: string
  icon: string
  birthDate: string
}

export default function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const historyEnabled = useHistoryEnabled()
  const [error, setError] = useState<string | null>(null)
  const [childToDelete, setChildToDelete] = useState<Child | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await fetch('/api/children')
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load children')
        }
        setChildren(data.children ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load children')
      } finally {
        setLoading(false)
      }
    }

    loadChildren()
  }, [])

  const handleDelete = async () => {
    if (!childToDelete) return

    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/children/${childToDelete.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete child')
      }
      setChildren((current) => current.filter((child) => child.id !== childToDelete.id))
      setChildToDelete(null)
      requestLdContextRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete child')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
          <p className="text-gray-600 mt-1">Your children and recent activity</p>
        </div>
        <Link href="/dashboard/child/new" className="btn-primary">
          Add Child
        </Link>
      </div>

      {loading && <p className="text-gray-600">Loading children...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && children.length === 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">No children yet</h2>
          <p className="text-gray-600 mb-4">
            Create a child profile to start logging songs.
          </p>
          <Link href="/dashboard/child/new" className="btn-primary">
            Create first profile
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {children.map((child) => (
          <div key={child.id} className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-ink">
                <ChildIcon icon={child.icon} className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">{childDisplayName(child)}</h2>
                <p className="text-sm text-gray-500">Born {formatDateOnly(child.birthDate)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard/search" className="btn-primary">
                Log a song
              </Link>
              <Link href={`/dashboard/child/${child.id}/edit`} className="btn-secondary">
                Edit
              </Link>
              {historyEnabled && (
                <Link href="/dashboard/history" className="btn-outline">
                  View history
                </Link>
              )}
              <button
                type="button"
                onClick={() => setChildToDelete(child)}
                className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {childToDelete && (
        <ConfirmDialog
          title={`Delete ${childDisplayName(childToDelete)}?`}
          description="This will permanently remove this child and all of their logged songs. This cannot be undone."
          confirmLabel="Delete child"
          confirming={deleting}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!deleting) setChildToDelete(null)
          }}
        />
      )}
    </div>
  )
}

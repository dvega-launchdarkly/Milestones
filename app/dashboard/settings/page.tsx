'use client'

import { familyRelationshipLabel, familyRoleLabel } from '@/lib/family-roles'
import { useUser } from '@clerk/nextjs'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [summary, setSummary] = useState<{
    role: string
    relationship: string | null
    memberCount: number
  } | null>(null)

  useEffect(() => {
    const loadFamily = async () => {
      try {
        const res = await fetch('/api/family')
        if (!res.ok) return
        const data = await res.json()
        setSummary({
          role: data.membership?.role ?? 'viewer',
          relationship: data.membership?.relationship ?? null,
          memberCount: data.members?.length ?? 0,
        })
      } catch {
        // The summary is decorative - the Family page is the source of truth.
      }
    }

    loadFamily()
  }, [])

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-ink mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Your account and your family.</p>

      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-ink mb-1">Account</h2>
        <p className="text-sm text-gray-500 mb-4">
          Name, email, and password are managed through your profile menu in the top right.
        </p>

        {isLoaded && user && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Name</dt>
              <dd className="font-medium text-ink truncate">{user.fullName ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Email</dt>
              <dd className="font-medium text-ink truncate">
                {user.primaryEmailAddress?.emailAddress ?? '—'}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <Link
        href="/dashboard/settings/family"
        className="card mb-6 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
      >
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink mb-1">Family</h2>
          <p className="text-sm text-gray-500">
            {summary
              ? `${familyRelationshipLabel(summary.relationship) ?? 'Relationship not set'} · ${familyRoleLabel(
                  summary.role
                )} · ${summary.memberCount} ${summary.memberCount === 1 ? 'member' : 'members'}`
              : 'Set your relationship and see who can view your family.'}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
      </Link>
    </div>
  )
}

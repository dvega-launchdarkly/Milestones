'use client'

import FamilyNameEditor from '@/components/Family/FamilyNameEditor'
import { useReleaseInviteFamily } from '@/components/LaunchDarkly/LaunchDarklyProvider'
import FamilySwitcher, { type FamilyOption } from '@/components/Family/FamilySwitcher'
import InviteSection from '@/components/Family/InviteSection'
import {
  FAMILY_RELATIONSHIPS,
  canManageFamily,
  familyRelationshipLabel,
  familyRoleLabel,
} from '@/lib/family-roles'
import { requestLdContextRefresh } from '@/lib/ld-context'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FamilyMember {
  id: string
  name: string
  email: string
  role: string
  relationship: string | null
  isCurrentUser: boolean
}

export default function FamilySettingsPage() {
  const inviteFamilyEnabled = useReleaseInviteFamily()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [relationship, setRelationship] = useState<string | null>(null)
  const [role, setRole] = useState('viewer')
  const [families, setFamilies] = useState<FamilyOption[]>([])
  const [familyName, setFamilyName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadFamily = async () => {
      try {
        const res = await fetch('/api/family')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load family')
        setMembers(data.members ?? [])
        setRelationship(data.membership?.relationship ?? null)
        setRole(data.membership?.role ?? 'viewer')
        setFamilies(data.families ?? [])
        setFamilyName(data.family?.name ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load family')
      } finally {
        setLoading(false)
      }
    }

    loadFamily()
  }, [])

  const saveRelationship = async (next: string) => {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/family', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationship: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save relationship')

      setRelationship(next)
      setMembers((current) =>
        current.map((member) =>
          member.isCurrentUser ? { ...member, relationship: next } : member
        )
      )
      setSaved(true)
      requestLdContextRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save relationship')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-ink">
        ← Settings
      </Link>
      <h1 className="text-3xl font-bold text-ink mt-2 mb-1">{familyName ?? 'Family'}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your place in this family, and everyone who can see it.
      </p>

      {loading && <p className="text-gray-600">Loading family...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && (
        <>
          <FamilySwitcher families={families} />

          {canManageFamily(role) && (
            <FamilyNameEditor initialName={familyName} onSaved={setFamilyName} />
          )}

          <section className="card mb-6">
            <h2 className="text-lg font-semibold text-ink mb-1">
              Your relationship in {familyName ?? 'this family'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Set per family — you might be a father here and an uncle somewhere else. It&apos;s a
              label only and doesn&apos;t change what you can do, which is{' '}
              {familyRoleLabel(role).toLowerCase()}.
            </p>

            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Your relationship">
              {FAMILY_RELATIONSHIPS.map((option) => {
                const selected = relationship === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={saving}
                    onClick={() => saveRelationship(option.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-colors disabled:opacity-60 ${
                      selected
                        ? 'bg-ink text-white border-ink'
                        : 'bg-surface text-ink border-ink/30 hover:border-ink'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            {saved && <p className="text-green-700 text-sm mt-4">Relationship saved.</p>}
          </section>

          {inviteFamilyEnabled && canManageFamily(role) && <InviteSection />}

          <section className="card">
            <h2 className="text-lg font-semibold text-ink mb-1">Members</h2>
            <p className="text-sm text-gray-500 mb-4">
              {canManageFamily(role)
                ? 'Everyone who can see this family.'
                : 'Only a family owner can invite or remove members.'}
            </p>

            <ul className="divide-y divide-gray-100">
              {members.map((member) => (
                <li key={member.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">
                      {member.name}
                      {member.isCurrentUser && (
                        <span className="text-gray-500 font-normal"> (you)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{member.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-ink">
                      {familyRelationshipLabel(member.relationship) ?? 'No relationship set'}
                    </p>
                    <p className="text-xs text-gray-500">{familyRoleLabel(member.role)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

'use client'

import {
  FAMILY_RELATIONSHIPS,
  FAMILY_ROLES,
  defaultRoleForRelationship,
  familyRelationshipLabel,
  familyRoleLabel,
  type FamilyRoleId,
} from '@/lib/family-roles'
import { useEffect, useState } from 'react'

interface PendingInvite {
  id: string
  email: string
  role: string
  relationship: string | null
  expiresAt: string
}

export default function InviteSection() {
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [role, setRole] = useState<FamilyRoleId>('viewer')
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInvites = async () => {
      try {
        const res = await fetch('/api/family/invites')
        if (!res.ok) return
        const data = await res.json()
        setInvites(data.invites ?? [])
      } catch {
        // Pending invites are supplementary - the form still works without them.
      }
    }

    loadInvites()
  }, [])

  const createInvite = async () => {
    setSubmitting(true)
    setError(null)
    setLink(null)
    setCopied(false)

    try {
      const res = await fetch('/api/family/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          relationship: relationship || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create invite')

      setLink(`${window.location.origin}${data.invitePath}`)
      setInvites((current) => [data.invite, ...current])
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite')
    } finally {
      setSubmitting(false)
    }
  }

  const revokeInvite = async (id: string) => {
    try {
      const res = await fetch(`/api/family/invites/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setInvites((current) => current.filter((invite) => invite.id !== id))
    } catch {
      // Leave the row in place; a refresh will show the real state.
    }
  }

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  return (
    <section className="card mb-6">
      <h2 className="text-lg font-semibold text-ink mb-1">Invite someone</h2>
      <p className="text-sm text-gray-500 mb-4">
        Creates a link you can text or email yourself. It works once and expires in 7 days.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="invite-email" className="block text-sm font-semibold text-gray-700 mb-1">
            Their email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="grandma@example.com"
            className="input-field"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="invite-relationship"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Relationship
            </label>
            <select
              id="invite-relationship"
              value={relationship}
              onChange={(event) => {
                setRelationship(event.target.value)
                setRole(defaultRoleForRelationship(event.target.value))
              }}
              className="input-field"
            >
              <option value="">Not specified</option>
              {FAMILY_RELATIONSHIPS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-sm font-semibold text-gray-700 mb-1">
              What they can do
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as FamilyRoleId)}
              className="input-field"
            >
              {FAMILY_ROLES.map((option) => (
                <option key={option} value={option}>
                  {familyRoleLabel(option)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={createInvite}
          disabled={submitting || !email.trim()}
          className="btn-primary disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create invite link'}
        </button>

        {error && <p className="text-red-600">{error}</p>}

        {link && (
          <div className="rounded-lg border border-ink/20 bg-surface p-4">
            <p className="text-sm font-semibold text-ink mb-2">
              Send this link — you won&apos;t be able to see it again.
            </p>
            <p className="text-sm text-gray-700 break-all mb-3">{link}</p>
            <button onClick={copyLink} className="btn-secondary">
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        )}
      </div>

      {invites.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Pending invites</h3>
          <ul className="divide-y divide-gray-100">
            {invites.map((invite) => (
              <li key={invite.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{invite.email}</p>
                  <p className="text-xs text-gray-500">
                    {familyRelationshipLabel(invite.relationship) ?? 'No relationship'} ·{' '}
                    {familyRoleLabel(invite.role)} · expires{' '}
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => revokeInvite(invite.id)}
                  className="text-sm text-red-600 hover:underline shrink-0"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

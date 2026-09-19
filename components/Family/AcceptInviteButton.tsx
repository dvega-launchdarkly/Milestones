'use client'

import { requestLdContextRefresh } from '@/lib/ld-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(token)}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to accept invite')

      requestLdContextRefresh()
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button onClick={accept} disabled={submitting} className="btn-primary">
        {submitting ? 'Joining...' : 'Join this family'}
      </button>
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  )
}

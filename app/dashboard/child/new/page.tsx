'use client'

import ChildForm, { type ChildFormValues } from '@/components/Child/ChildForm'
import { requestLdContextRefresh } from '@/lib/ld-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewChildPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (values: ChildFormValues) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create child')
      }
      requestLdContextRefresh()
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create child')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-ink mb-6">Add a child</h1>
      <ChildForm submitLabel="Create profile" saving={saving} error={error} onSubmit={handleSubmit} />
    </div>
  )
}

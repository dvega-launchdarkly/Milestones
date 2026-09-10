'use client'

import ChildForm, { type ChildFormValues } from '@/components/Child/ChildForm'
import { toDateInputValue } from '@/lib/dates'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditChildPage() {
  const { childId } = useParams<{ childId: string }>()
  const router = useRouter()
  const [initialValues, setInitialValues] = useState<ChildFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadChild = async () => {
      try {
        const res = await fetch(`/api/children/${childId}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load child')
        }
        setInitialValues({
          firstName: data.child.firstName,
          lastName: data.child.lastName,
          birthDate: toDateInputValue(data.child.birthDate),
          icon: data.child.icon,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load child')
      } finally {
        setLoading(false)
      }
    }

    loadChild()
  }, [childId])

  const handleSubmit = async (values: ChildFormValues) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/children/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update child')
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update child')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Loading child...</p>
  }

  if (!initialValues) {
    return <p className="text-red-600">{error || 'Child not found'}</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-ink mb-6">Edit child</h1>
      <ChildForm
        initialValues={initialValues}
        submitLabel="Save changes"
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

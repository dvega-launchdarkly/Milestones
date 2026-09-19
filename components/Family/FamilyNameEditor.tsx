'use client'

import { useState } from 'react'

interface FamilyNameEditorProps {
  initialName: string | null
  onSaved: (name: string) => void
}

export default function FamilyNameEditor({ initialName, onSaved }: FamilyNameEditorProps) {
  const [name, setName] = useState(initialName ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/family', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to rename family')

      onSaved(data.family.name)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename family')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card mb-6">
      <h2 className="text-lg font-semibold text-ink mb-1">Family name</h2>
      <p className="text-sm text-gray-500 mb-4">
        How this household appears to you and to anyone you invite.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setSaved(false)
          }}
          placeholder="The Vega family"
          className="input-field"
          aria-label="Family name"
        />
        <button
          onClick={save}
          disabled={saving || !name.trim() || name.trim() === (initialName ?? '')}
          className="btn-primary shrink-0 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">{error}</p>}
      {saved && <p className="text-green-700 text-sm mt-3">Family name saved.</p>}
    </section>
  )
}

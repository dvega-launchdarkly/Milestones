'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { CHILD_ICONS, DEFAULT_CHILD_ICON } from '@/lib/child-icons'

export interface ChildFormValues {
  firstName: string
  lastName: string
  birthDate: string
  icon: string
}

interface ChildFormProps {
  initialValues?: Partial<ChildFormValues>
  submitLabel: string
  saving?: boolean
  error?: string | null
  onSubmit: (values: ChildFormValues) => Promise<void>
}

export default function ChildForm({
  initialValues,
  submitLabel,
  saving,
  error,
  onSubmit,
}: ChildFormProps) {
  const [firstName, setFirstName] = useState(initialValues?.firstName ?? '')
  const [lastName, setLastName] = useState(initialValues?.lastName ?? '')
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate ?? '')
  const [icon, setIcon] = useState(initialValues?.icon ?? DEFAULT_CHILD_ICON)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({ firstName, lastName, birthDate, icon })
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            className="input-field"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            className="input-field"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="birthDate">
          Birth date
        </label>
        <input
          id="birthDate"
          type="date"
          className="input-field"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-gray-700 mb-3">Pick a fun icon</legend>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {CHILD_ICONS.map(({ id, label, Icon }) => {
            const selected = icon === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setIcon(id)}
                aria-label={label}
                aria-pressed={selected}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 transition-colors ${
                  selected
                    ? 'border-ink bg-ink/10 text-ink'
                    : 'border-ink/20 text-ink/70 hover:border-ink hover:text-ink'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </fieldset>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </button>
        <Link href="/dashboard" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}

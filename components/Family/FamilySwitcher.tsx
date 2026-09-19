'use client'

import { familyRoleLabel } from '@/lib/family-roles'
import { requestLdContextRefresh } from '@/lib/ld-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface FamilyOption {
  id: string
  name: string | null
  role: string
  isActive: boolean
}

export default function FamilySwitcher({ families }: { families: FamilyOption[] }) {
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  if (families.length < 2) return null

  const switchTo = async (familyId: string) => {
    setSwitching(true)

    try {
      const res = await fetch('/api/family', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeFamilyId: familyId }),
      })
      if (!res.ok) return

      requestLdContextRefresh()
      router.refresh()
      window.location.reload()
    } finally {
      setSwitching(false)
    }
  }

  return (
    <section className="card mb-6">
      <h2 className="text-lg font-semibold text-ink mb-1">Viewing</h2>
      <p className="text-sm text-gray-500 mb-4">
        You belong to more than one family. Everything in Milestones shows the one you pick here.
      </p>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Active family">
        {families.map((family, index) => (
          <button
            key={family.id}
            type="button"
            role="radio"
            aria-checked={family.isActive}
            disabled={switching || family.isActive}
            onClick={() => switchTo(family.id)}
            className={`inline-flex flex-col items-start px-4 py-2 rounded-2xl border transition-colors disabled:opacity-100 ${
              family.isActive
                ? 'bg-ink text-white border-ink'
                : 'bg-surface text-ink border-ink/30 hover:border-ink'
            }`}
          >
            <span className="font-medium">{family.name ?? `Family ${index + 1}`}</span>
            <span className={`text-xs ${family.isActive ? 'text-white/70' : 'text-gray-500'}`}>
              {familyRoleLabel(family.role)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

'use client'

import { familyRoleLabel } from '@/lib/family-roles'
import { requestLdContextRefresh } from '@/lib/ld-context'
import { Check, ChevronsUpDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface FamilyOption {
  id: string
  name: string | null
  role: string
  isActive: boolean
}

export default function ActiveFamilyBadge() {
  const pathname = usePathname()
  const [families, setFamilies] = useState<FamilyOption[]>([])
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const res = await fetch('/api/family')
        if (!res.ok) return
        const data = await res.json()
        setFamilies(data.families ?? [])
      } catch {
        // Without this the sidebar simply shows no family label.
      }
    }

    loadFamilies()
  }, [pathname])

  const active = families.find((family) => family.isActive)
  if (!active) return null

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
      // Every page is scoped to the active family, so reload rather than
      // refresh a subtree that still holds the old family's data.
      window.location.reload()
    } finally {
      setSwitching(false)
    }
  }

  const canSwitch = families.length > 1

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Family
      </h2>

      <button
        type="button"
        onClick={() => canSwitch && setOpen((value) => !value)}
        aria-expanded={canSwitch ? open : undefined}
        aria-haspopup={canSwitch ? 'listbox' : undefined}
        disabled={!canSwitch}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-ink/15 bg-white/60 px-3 py-2 text-left disabled:cursor-default"
      >
        <span className="min-w-0">
          <span className="block font-medium text-ink truncate">
            {active.name ?? 'Your family'}
          </span>
          <span className="block text-xs text-gray-500">{familyRoleLabel(active.role)}</span>
        </span>
        {canSwitch && <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />}
      </button>

      {canSwitch && open && (
        <ul role="listbox" className="mt-2 space-y-1">
          {families.map((family) => (
            <li key={family.id}>
              <button
                type="button"
                role="option"
                aria-selected={family.isActive}
                disabled={switching || family.isActive}
                onClick={() => switchTo(family.id)}
                className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  family.isActive ? 'bg-ink/10 text-ink font-medium' : 'text-ink/80 hover:bg-ink/10'
                }`}
              >
                <span className="truncate">{family.name ?? 'Unnamed family'}</span>
                {family.isActive && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

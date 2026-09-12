'use client'

import HistoryList, { type HistoryItem } from '@/components/History/HistoryList'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ChildHistoryPage() {
  const { childId } = useParams<{ childId: string }>()
  const [interactions, setInteractions] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/interactions?childId=${encodeURIComponent(childId)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load history')
        setInteractions(data.interactions ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [childId])

  return (
    <>
      {loading && <p className="text-gray-600">Loading history...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && interactions.length === 0 && (
        <p className="text-gray-600">No songs logged for this child yet.</p>
      )}
      <HistoryList items={interactions} />
    </>
  )
}

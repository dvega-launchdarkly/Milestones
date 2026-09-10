'use client'

import { childDisplayName } from '@/lib/child-icon-ids'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Interaction {
  id: string
  rating: string
  review?: string
  exposedAt: string
  child: { firstName: string; lastName: string }
  song: {
    title: string
    artist: string
    album: string
    albumArtUrl?: string | null
    genres: string[]
  }
}

export default function HistoryPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/interactions')
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
  }, [])

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-ink mb-6">History</h1>
      {loading && <p className="text-gray-600">Loading history...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && interactions.length === 0 && (
        <p className="text-gray-600">No songs logged yet.</p>
      )}
      <div className="space-y-3">
        {interactions.map((item) => (
          <div key={item.id} className="card flex items-start gap-4">
            {item.song.albumArtUrl ? (
              <div className="relative h-16 w-16 flex-shrink-0 rounded">
                <Image
                  src={item.song.albumArtUrl}
                  alt={item.song.album}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ) : (
              <div className="h-16 w-16 flex-shrink-0 rounded bg-ink/10" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {item.song.title}{' '}
                <span className="font-normal text-gray-600">by {item.song.artist}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {childDisplayName(item.child)} · {item.rating.replace('_', ' ')} ·{' '}
                {new Date(item.exposedAt).toLocaleDateString()}
              </p>
              {item.song.genres.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.song.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              {item.review && <p className="text-sm text-gray-700 mt-2">{item.review}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

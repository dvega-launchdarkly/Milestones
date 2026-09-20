'use client'

import type { HistoryItem } from '@/components/History/HistoryList'
import { childDisplayName } from '@/lib/child-icon-ids'
import { Music } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export const RECENT_SONGS_COUNT = 16

export default function RecentSongsGrid() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await fetch(`/api/interactions?limit=${RECENT_SONGS_COUNT}`)
        if (!res.ok) return
        const data = await res.json()
        setItems(data.interactions ?? [])
      } catch {
        // The dashboard is still useful without this section.
      } finally {
        setLoading(false)
      }
    }

    loadRecent()
  }, [])

  if (loading || items.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-ink mb-1">Recently added</h2>
      <p className="text-sm text-gray-500 mb-4">The last {items.length} songs you logged.</p>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-ink/10">
              {item.song.albumArtUrl ? (
                <Image
                  src={item.song.albumArtUrl}
                  alt={item.song.album}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Music className="h-6 w-6 text-ink/40" aria-hidden />
                </div>
              )}
            </div>

            <p className="mt-2 text-sm font-medium text-ink truncate" title={item.song.title}>
              {item.song.title}
            </p>
            <p className="text-xs text-gray-600 truncate" title={item.song.artist}>
              {item.song.artist}
            </p>
            <p className="text-xs text-gray-500 truncate">{childDisplayName(item.child)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import ChildIcon from '@/components/Child/ChildIcon'
import InteractionForm from '@/components/Interaction/InteractionForm'
import SongSearchBar from '@/components/Song/SongSearchBar'
import SongSearchResults from '@/components/Song/SongSearchResults'
import { childDisplayName } from '@/lib/child-icon-ids'
import { requestLdContextRefresh } from '@/lib/ld-context'
import { SpotifySearchResult } from '@/lib/types'

interface Child {
  id: string
  firstName: string
  lastName: string
  icon: string
}

export default function SearchPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [childId, setChildId] = useState('')
  const [songs, setSongs] = useState<SpotifySearchResult[]>([])
  const [selectedSong, setSelectedSong] = useState<SpotifySearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadChildren = async () => {
      const res = await fetch('/api/children')
      const data = await res.json()
      const list: Child[] = data.children ?? []
      setChildren(list)
      if (list[0]) setChildId(list[0].id)
    }

    loadChildren()
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setSongs(data.songs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = async (rating: string, review: string) => {
    if (!selectedSong || !childId) return
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        spotifyId: selectedSong.spotifyId,
        rating,
        review,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to save')
    setSelectedSong(null)
    setSaved(true)
    requestLdContextRefresh()
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-ink mb-6">Search Music</h1>

      {children.length === 0 ? (
        <p className="text-gray-600">Add a child profile before logging songs.</p>
      ) : (
        <fieldset className="mb-6">
          <legend className="block text-sm font-semibold text-gray-700 mb-2">Logging for</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Logging for">
            {children.map((child) => {
              const selected = childId === child.id
              return (
                <button
                  key={child.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChildId(child.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-colors ${
                    selected
                      ? 'bg-ink text-white border-ink'
                      : 'bg-surface text-ink border-ink/30 hover:border-ink'
                  }`}
                >
                  <ChildIcon icon={child.icon} className="h-4 w-4" />
                  {childDisplayName(child)}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <SongSearchBar onSearch={handleSearch} loading={loading} />
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {saved && <p className="text-green-700 mb-4">Song saved.</p>}

      {selectedSong ? (
        <InteractionForm
          song={selectedSong}
          onSubmit={handleSubmit}
          onCancel={() => setSelectedSong(null)}
        />
      ) : (
        <SongSearchResults songs={songs} onSelectSong={setSelectedSong} />
      )}
    </div>
  )
}

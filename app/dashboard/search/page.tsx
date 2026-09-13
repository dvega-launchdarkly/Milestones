'use client'

import { useCallback, useEffect, useState } from 'react'
import AlbumSearchResults from '@/components/Album/AlbumSearchResults'
import AlbumTrackList from '@/components/Album/AlbumTrackList'
import ChildIcon from '@/components/Child/ChildIcon'
import SegmentedSwitch from '@/components/Common/SegmentedSwitch'
import InteractionForm from '@/components/Interaction/InteractionForm'
import { useSearchMusicV2 } from '@/components/LaunchDarkly/LaunchDarklyProvider'
import SongSearchBar from '@/components/Song/SongSearchBar'
import SongSearchResults from '@/components/Song/SongSearchResults'
import { childDisplayName } from '@/lib/child-icon-ids'
import { requestLdContextRefresh } from '@/lib/ld-context'
import { SpotifyAlbumDetail, SpotifyAlbumResult, SpotifySearchResult } from '@/lib/types'
import { Disc3, Music } from 'lucide-react'

interface Child {
  id: string
  firstName: string
  lastName: string
  icon: string
}

type SearchType = 'song' | 'album'

const chipClass =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-colors'
const activeChipClass = 'bg-ink text-white border-ink'
const inactiveChipClass = 'bg-surface text-ink border-ink/30 hover:border-ink'

export default function SearchPage() {
  const searchMusicV2 = useSearchMusicV2()
  const [children, setChildren] = useState<Child[]>([])
  const [childId, setChildId] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('song')
  const [songs, setSongs] = useState<SpotifySearchResult[]>([])
  const [albums, setAlbums] = useState<SpotifyAlbumResult[]>([])
  const [selectedSong, setSelectedSong] = useState<SpotifySearchResult | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbumDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingAlbum, setLoadingAlbum] = useState(false)
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

  const handleSearch = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)
      setSaved(false)
      try {
        const res = await fetch(
          `/api/songs/search?q=${encodeURIComponent(query)}&type=${searchType}`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Search failed')
        if (searchType === 'album') {
          setAlbums(data.albums ?? [])
          setSongs([])
        } else {
          setSongs(data.songs ?? [])
          setAlbums([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    },
    [searchType]
  )

  const changeSearchType = (next: SearchType) => {
    if (next === searchType) return
    setSearchType(next)
    setSongs([])
    setAlbums([])
    setSelectedSong(null)
    setSelectedAlbum(null)
    setError(null)
    setSaved(false)
  }

  const handleSelectAlbum = async (album: SpotifyAlbumResult) => {
    setLoadingAlbum(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/albums/${encodeURIComponent(album.spotifyId)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load album')
      setSelectedAlbum(data.album)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load album')
    } finally {
      setLoadingAlbum(false)
    }
  }

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

  // Without the switch the search box has to explain that it covers both.
  const searchBarLabel = !searchMusicV2
    ? 'Search for a song'
    : searchType === 'album'
      ? 'Album name'
      : 'Song name'

  const searchBarPlaceholder = !searchMusicV2
    ? 'Search by song title, artist, or album...'
    : searchType === 'album'
      ? 'Search by album title or artist...'
      : 'Search by song title or artist...'

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
                  className={`${chipClass} ${selected ? activeChipClass : inactiveChipClass}`}
                >
                  <ChildIcon icon={child.icon} className="h-4 w-4" />
                  {childDisplayName(child)}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {searchMusicV2 && (
        <SegmentedSwitch
          label="Search for"
          value={searchType}
          onChange={changeSearchType}
          options={[
            { value: 'song', label: 'A song', Icon: Music },
            { value: 'album', label: 'An album', Icon: Disc3 },
          ]}
        />
      )}

      <SongSearchBar
        onSearch={handleSearch}
        loading={loading}
        label={searchBarLabel}
        placeholder={searchBarPlaceholder}
      />
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {saved && <p className="text-green-700 mb-4">Song saved.</p>}
      {loadingAlbum && <p className="text-gray-600 mb-4">Loading album...</p>}

      {selectedSong ? (
        <InteractionForm
          song={selectedSong}
          onSubmit={handleSubmit}
          onCancel={() => setSelectedSong(null)}
        />
      ) : selectedAlbum ? (
        <AlbumTrackList
          album={selectedAlbum}
          onSelectTrack={setSelectedSong}
          onBack={() => setSelectedAlbum(null)}
        />
      ) : searchType === 'album' ? (
        <AlbumSearchResults albums={albums} onSelectAlbum={handleSelectAlbum} />
      ) : (
        <SongSearchResults songs={songs} onSelectSong={setSelectedSong} />
      )}
    </div>
  )
}

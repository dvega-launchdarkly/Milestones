'use client'

import { useEffect, useState } from 'react'

interface SongSearchBarProps {
  onSearch: (query: string) => void
  loading?: boolean
  label?: string
  placeholder?: string
}

export default function SongSearchBar({
  onSearch,
  loading,
  label = 'Search for a song',
  placeholder = 'Search by song title, artist, or album...',
}: SongSearchBarProps) {
  const [query, setQuery] = useState('')
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      if (query.length >= 2) {
        onSearch(query)
      }
    }, 700) // Debounced to keep keystrokes from burning Spotify's request quota

    setDebounceTimer(timer)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div className="card mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="input-field"
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin text-primary-600">⌛</div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">Start typing to search Spotify's catalog...</p>
    </div>
  )
}

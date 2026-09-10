'use client'

import Image from 'next/image'
import { SpotifySearchResult } from '@/lib/types'

interface SongSearchResultsProps {
  songs: SpotifySearchResult[]
  onSelectSong: (song: SpotifySearchResult) => void
}

export default function SongSearchResults({ songs, onSelectSong }: SongSearchResultsProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-ink mb-4">Search Results</h3>
      {songs.map((song) => (
        <button
          key={song.spotifyId}
          onClick={() => onSelectSong(song)}
          className="w-full card flex items-start gap-4 hover:shadow-md transition-shadow text-left"
        >
          {/* Album Art */}
          {song.albumArtUrl && (
            <div className="relative h-16 w-16 flex-shrink-0 rounded">
              <Image
                src={song.albumArtUrl}
                alt={song.album}
                fill
                className="object-cover rounded"
              />
            </div>
          )}

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-ink truncate">{song.title}</h4>
            <p className="text-sm text-gray-600 truncate">{song.artist}</p>
            <p className="text-xs text-gray-500 truncate">{song.album}</p>
          </div>

          {/* Duration */}
          <div className="text-right text-sm text-gray-600">
            {Math.floor(song.duration / 60000)}:{String(Math.floor((song.duration % 60000) / 1000)).padStart(2, '0')}
          </div>
        </button>
      ))}
    </div>
  )
}

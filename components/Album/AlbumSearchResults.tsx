'use client'

import { SpotifyAlbumResult } from '@/lib/types'
import Image from 'next/image'

interface AlbumSearchResultsProps {
  albums: SpotifyAlbumResult[]
  onSelectAlbum: (album: SpotifyAlbumResult) => void
}

export default function AlbumSearchResults({ albums, onSelectAlbum }: AlbumSearchResultsProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-ink mb-4">Search Results</h3>
      {albums.map((album) => (
        <button
          key={album.spotifyId}
          onClick={() => onSelectAlbum(album)}
          className="w-full card flex items-start gap-4 hover:shadow-md transition-shadow text-left"
        >
          {album.albumArtUrl && (
            <div className="relative h-16 w-16 flex-shrink-0 rounded">
              <Image
                src={album.albumArtUrl}
                alt={album.name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-ink truncate">{album.name}</h4>
            <p className="text-sm text-gray-600 truncate">{album.artist}</p>
            <p className="text-xs text-gray-500 truncate">
              {album.totalTracks} {album.totalTracks === 1 ? 'track' : 'tracks'}
              {album.releaseDate ? ` · ${album.releaseDate.slice(0, 4)}` : ''}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

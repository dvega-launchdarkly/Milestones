'use client'

import { SpotifyAlbumDetail, SpotifySearchResult } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface AlbumTrackListProps {
  album: SpotifyAlbumDetail
  onSelectTrack: (track: SpotifySearchResult) => void
  onBack: () => void
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function AlbumTrackList({ album, onSelectTrack, onBack }: AlbumTrackListProps) {
  return (
    <div className="card">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-ink mb-4"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to albums
      </button>

      <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
        {album.albumArtUrl && (
          <div className="relative h-24 w-24 rounded-lg flex-shrink-0">
            <Image
              src={album.albumArtUrl}
              alt={album.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-ink">{album.name}</h2>
          <p className="text-lg text-gray-600">{album.artist}</p>
          <p className="text-sm text-gray-500">
            {album.totalTracks} {album.totalTracks === 1 ? 'track' : 'tracks'}
            {album.releaseDate ? ` · ${album.releaseDate.slice(0, 4)}` : ''}
          </p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-2">Pick a track to log</h3>
      <ul className="divide-y divide-gray-100">
        {album.tracks.map((track, index) => (
          <li key={track.spotifyId}>
            <button
              onClick={() => onSelectTrack(track)}
              className="w-full flex items-center gap-4 py-3 text-left hover:bg-surface/60 rounded px-2 -mx-2 transition-colors"
            >
              <span className="w-6 text-sm text-gray-400 tabular-nums">{index + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-ink truncate">{track.title}</span>
                <span className="block text-sm text-gray-600 truncate">{track.artist}</span>
              </span>
              <span className="text-sm text-gray-600">{formatDuration(track.duration)}</span>
            </button>
          </li>
        ))}
      </ul>

      {album.tracks.length === 0 && (
        <p className="text-gray-600">No tracks found for this album.</p>
      )}
    </div>
  )
}

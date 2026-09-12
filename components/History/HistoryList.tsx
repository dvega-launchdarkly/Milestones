import { childDisplayName } from '@/lib/child-icon-ids'
import Image from 'next/image'

export interface HistoryItem {
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

interface HistoryListProps {
  items: HistoryItem[]
  showChildName?: boolean
}

export default function HistoryList({ items, showChildName = false }: HistoryListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
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
              {showChildName && `${childDisplayName(item.child)} · `}
              {item.rating.replace('_', ' ')} ·{' '}
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
  )
}

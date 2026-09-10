'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SpotifySearchResult } from '@/lib/types'

interface InteractionFormProps {
  song: SpotifySearchResult
  onSubmit: (rating: string, review: string) => void
  onCancel: () => void
  loading?: boolean
}

export default function InteractionForm({
  song,
  onSubmit,
  onCancel,
  loading,
}: InteractionFormProps) {
  const [rating, setRating] = useState<'thumbs_up' | 'thumbs_down' | 'neutral' | null>(null)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating) {
      alert('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(rating, review)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      {/* Song Header */}
      <div className="flex gap-4 mb-8 pb-8 border-b border-gray-200">
        {song.albumArtUrl && (
          <div className="relative h-24 w-24 rounded-lg flex-shrink-0">
            <Image
              src={song.albumArtUrl}
              alt={song.album}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-ink">{song.title}</h2>
          <p className="text-lg text-gray-600">{song.artist}</p>
          <p className="text-sm text-gray-500">{song.album}</p>
        </div>
      </div>

      {/* Rating Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          How did your child react?
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setRating('thumbs_up')}
            className={`flex-1 py-4 px-4 border-2 rounded-full font-semibold transition-all ${
              rating === 'thumbs_up'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-surface border-ink/20 text-ink hover:border-green-300'
            }`}
            disabled={submitting}
          >
            👍 Loved It
          </button>
          <button
            onClick={() => setRating('neutral')}
            className={`flex-1 py-4 px-4 border-2 rounded-full font-semibold transition-all ${
              rating === 'neutral'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-surface border-ink/20 text-ink hover:border-blue-300'
            }`}
            disabled={submitting}
          >
            😐 Neutral
          </button>
          <button
            onClick={() => setRating('thumbs_down')}
            className={`flex-1 py-4 px-4 border-2 rounded-full font-semibold transition-all ${
              rating === 'thumbs_down'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-surface border-ink/20 text-ink hover:border-red-300'
            }`}
            disabled={submitting}
          >
            👎 Not Interested
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Add a note (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="e.g., They danced to this one! Started dancing when the beat dropped..."
          disabled={submitting}
          className="input-field resize-none"
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || !rating}
          className="btn-primary flex-1"
        >
          {submitting ? 'Saving...' : 'Save Song'}
        </button>
        <button onClick={onCancel} disabled={submitting} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </div>
  )
}

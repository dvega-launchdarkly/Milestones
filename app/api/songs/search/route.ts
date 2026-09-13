import { requireAuth } from '@/lib/auth'
import { searchSpotifyAlbums, searchSpotifyTracks } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    requireAuth()

    const query = request.nextUrl.searchParams.get('q')
    const limit = Number(request.nextUrl.searchParams.get('limit') || 10)
    const type = request.nextUrl.searchParams.get('type') || 'song'

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (type !== 'song' && type !== 'album') {
      return NextResponse.json({ error: 'type must be "song" or "album"' }, { status: 400 })
    }

    if (type === 'album') {
      const albums = await searchSpotifyAlbums(query, limit)
      return NextResponse.json({ albums })
    }

    const songs = await searchSpotifyTracks(query, limit)
    return NextResponse.json({ songs })
  } catch (error) {
    console.error('Error searching songs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search songs' },
      { status: 401 }
    )
  }
}

import { requireAuth } from '@/lib/auth'
import { searchSpotifyTracks } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    requireAuth()

    const query = request.nextUrl.searchParams.get('q')
    const limit = Number(request.nextUrl.searchParams.get('limit') || 10)

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
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

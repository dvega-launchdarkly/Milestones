import { requireAuth } from '@/lib/auth'
import { getSpotifyAlbum } from '@/lib/spotify'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { albumId: string } }) {
  try {
    requireAuth()
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const album = await getSpotifyAlbum(params.albumId)
    return NextResponse.json({ album })
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch album' },
      { status: 500 }
    )
  }
}

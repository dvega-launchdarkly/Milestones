import { getCurrentParent, verifyChildOwnership } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSpotifyTrack, getSpotifyTracksWithGenres } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GENRE_BACKFILL_LIMIT = 5

export async function GET(request: NextRequest) {
  try {
    const parent = await getCurrentParent()
    const childId = request.nextUrl.searchParams.get('childId')
    const limit = Number(request.nextUrl.searchParams.get('limit') || 20)
    const offset = Number(request.nextUrl.searchParams.get('offset') || 0)

    if (childId) {
      await verifyChildOwnership(childId)
    }

    const where = childId
      ? { childId }
      : { child: { parentId: parent.id } }

    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        include: { song: true, child: true },
        orderBy: { exposedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.interaction.count({ where }),
    ])

    // Each song needs a track and an artist lookup, so only a few are
    // backfilled per request to stay inside Spotify's quota. The rest are
    // picked up on later loads.
    const songsMissingGenres = interactions
      .map((item) => item.song)
      .filter((song) => song.genres.length === 0)
      .slice(0, GENRE_BACKFILL_LIMIT)

    if (songsMissingGenres.length > 0) {
      try {
        const tracks = await getSpotifyTracksWithGenres(
          songsMissingGenres.map((song) => song.spotifyId)
        )

        await Promise.all(
          songsMissingGenres.map(async (song) => {
            const track = tracks.get(song.spotifyId)
            if (!track) return
            const updated = await prisma.song.update({
              where: { id: song.id },
              data: { genres: track.genres ?? [] },
            })
            song.genres = updated.genres
          })
        )
      } catch (enrichError) {
        console.error('Error enriching song genres:', enrichError)
      }
    }

    return NextResponse.json({ interactions, total })
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch interactions' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { childId, spotifyId, rating, review } = await request.json()

    if (!childId || !spotifyId || !rating) {
      return NextResponse.json(
        { error: 'childId, spotifyId, and rating are required' },
        { status: 400 }
      )
    }

    await verifyChildOwnership(childId)

    let song = await prisma.song.findUnique({ where: { spotifyId } })
    if (!song || song.genres.length === 0) {
      const track = await getSpotifyTrack(spotifyId)
      const songData = {
        spotifyId: track.spotifyId,
        title: track.title,
        artist: track.artist,
        album: track.album,
        albumArtUrl: track.albumArtUrl,
        duration: track.duration,
        previewUrl: track.previewUrl,
        spotifyUrl: track.spotifyUrl,
        genres: track.genres ?? [],
      }

      song = song
        ? await prisma.song.update({ where: { id: song.id }, data: songData })
        : await prisma.song.create({ data: songData })
    }

    const interaction = await prisma.interaction.create({
      data: {
        childId,
        songId: song.id,
        rating,
        review: review || null,
      },
      include: { song: true },
    })

    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    console.error('Error creating interaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create interaction' },
      { status: 500 }
    )
  }
}

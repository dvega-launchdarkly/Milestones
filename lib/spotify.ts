import { SpotifySearchResult, SpotifyTokenResponse, SpotifySearchResponse } from './types'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getSpotifyToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(await spotifyErrorMessage('Spotify token request failed', response))
  }

  const data: SpotifyTokenResponse = await response.json()

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getSpotifyToken()
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    if (response.status === 401) {
      cachedToken = null
    }
    throw new Error(await spotifyErrorMessage(`Spotify request failed for ${path}`, response))
  }

  return response.json()
}

async function spotifyErrorMessage(prefix: string, response: Response) {
  const body = await response.text()
  const detail = body.trim() || response.statusText || 'no response body'
  return `${prefix} (${response.status}): ${detail.slice(0, 300)}`
}

function uniqueIds(ids: string[]) {
  const seen = new Map<string, true>()
  const result: string[] = []
  for (const id of ids) {
    if (!id || seen.has(id)) continue
    seen.set(id, true)
    result.push(id)
  }
  return result
}

type SpotifyArtist = {
  id?: string
  name: string
  genres?: string[]
}

type SpotifyTrack = {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  preview_url?: string | null
  external_urls: { spotify: string }
}

async function getArtistGenres(artistIds: string[]): Promise<Map<string, string[]>> {
  const genresByArtist = new Map<string, string[]>()
  const ids = uniqueIds(artistIds)

  await Promise.all(
    ids.map(async (id) => {
      const artist = await spotifyGet<SpotifyArtist>(`/artists/${encodeURIComponent(id)}`)
      if (artist?.id) {
        genresByArtist.set(artist.id, artist.genres ?? [])
      }
    })
  )

  return genresByArtist
}

function mapTrack(track: SpotifyTrack, genres: string[] = []): SpotifySearchResult {
  return {
    spotifyId: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    album: track.album.name,
    albumArtUrl: track.album.images[0]?.url,
    duration: track.duration_ms,
    previewUrl: track.preview_url ?? undefined,
    spotifyUrl: track.external_urls.spotify,
    genres,
  }
}

export async function searchSpotifyTracks(query: string, limit: number = 10): Promise<SpotifySearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: Math.min(Math.max(limit, 1), 10).toString(),
  })

  const data = await spotifyGet<SpotifySearchResponse>(`/search?${params}`)
  return data.tracks.items.map((track) => mapTrack(track))
}

export async function getSpotifyTracksWithGenres(spotifyIds: string[]): Promise<Map<string, SpotifySearchResult>> {
  const results = new Map<string, SpotifySearchResult>()
  const ids = uniqueIds(spotifyIds)

  const tracks = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          return await spotifyGet<SpotifyTrack>(`/tracks/${encodeURIComponent(id)}`)
        } catch (error) {
          console.error(`Failed to fetch Spotify track ${id}:`, error)
          return null
        }
      })
    )
  ).filter((track): track is SpotifyTrack => Boolean(track))

  const artistIds = tracks.map((track) => track.artists[0]?.id).filter((id): id is string => Boolean(id))
  let genresByArtist = new Map<string, string[]>()
  if (artistIds.length > 0) {
    try {
      genresByArtist = await getArtistGenres(artistIds)
    } catch (error) {
      console.error('Failed to fetch Spotify artist genres:', error)
    }
  }

  for (const track of tracks) {
    const genres = genresByArtist.get(track.artists[0]?.id ?? '') ?? []
    results.set(track.id, mapTrack(track, genres))
  }

  return results
}

export async function getSpotifyTrack(spotifyId: string): Promise<SpotifySearchResult> {
  const tracks = await getSpotifyTracksWithGenres([spotifyId])
  const track = tracks.get(spotifyId)

  if (!track) {
    throw new Error('Spotify track not found')
  }

  return track
}

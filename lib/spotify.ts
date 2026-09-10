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
    throw new Error(`Spotify token request failed: ${response.statusText}`)
  }

  const data: SpotifyTokenResponse = await response.json()

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

async function getArtistGenres(artistIds: string[]): Promise<Map<string, string[]>> {
  const genresByArtist = new Map<string, string[]>()
  const uniqueIds = [...new Set(artistIds.filter(Boolean))]

  if (uniqueIds.length === 0) {
    return genresByArtist
  }

  const token = await getSpotifyToken()

  for (let i = 0; i < uniqueIds.length; i += 50) {
    const batch = uniqueIds.slice(i, i + 50)
    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${batch.join(',')}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error(`Spotify artist fetch failed: ${response.statusText}`)
    }

    const data = await response.json()
    for (const artist of data.artists ?? []) {
      if (artist?.id) {
        genresByArtist.set(artist.id, artist.genres ?? [])
      }
    }
  }

  return genresByArtist
}

function mapTrack(track: {
  id: string
  name: string
  artists: Array<{ id?: string; name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  preview_url?: string | null
  external_urls: { spotify: string }
}, genres: string[] = []): SpotifySearchResult {
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
  const token = await getSpotifyToken()

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
  })

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.statusText}`)
  }

  const data: SpotifySearchResponse = await response.json()
  return data.tracks.items.map((track) => mapTrack(track))
}

export async function getSpotifyTracksWithGenres(spotifyIds: string[]): Promise<Map<string, SpotifySearchResult>> {
  const results = new Map<string, SpotifySearchResult>()
  const uniqueIds = [...new Set(spotifyIds.filter(Boolean))]

  if (uniqueIds.length === 0) {
    return results
  }

  const token = await getSpotifyToken()

  for (let i = 0; i < uniqueIds.length; i += 50) {
    const batch = uniqueIds.slice(i, i + 50)
    const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${batch.join(',')}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error(`Spotify track fetch failed: ${response.statusText}`)
    }

    const data = await response.json()
    const tracks = (data.tracks ?? []).filter(Boolean)
    const artistIds = tracks.map((track: { artists: Array<{ id?: string }> }) => track.artists[0]?.id)
    const genresByArtist = await getArtistGenres(artistIds)

    for (const track of tracks) {
      const genres = genresByArtist.get(track.artists[0]?.id) ?? []
      results.set(track.id, mapTrack(track, genres))
    }
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

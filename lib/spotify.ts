import {
  SpotifyAlbumDetail,
  SpotifyAlbumResult,
  SpotifySearchResponse,
  SpotifySearchResult,
  SpotifyTokenResponse,
} from './types'

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

// Catalog metadata barely changes, and Development Mode apps have a small
// request quota, so successful responses are cached and concurrent requests for
// the same path share one fetch.
const RESPONSE_TTL_MS = 10 * 60 * 1000
const MAX_CACHED_RESPONSES = 300

const responseCache = new Map<string, { value: unknown; expiresAt: number }>()
const inFlightRequests = new Map<string, Promise<unknown>>()

function pruneResponseCache() {
  const now = Date.now()
  const expired: string[] = []
  responseCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) expired.push(key)
  })
  expired.forEach((key) => responseCache.delete(key))

  while (responseCache.size > MAX_CACHED_RESPONSES) {
    const oldest = responseCache.keys().next()
    if (oldest.done) break
    responseCache.delete(oldest.value)
  }
}

function formatRetryAfter(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 1) return 'in a minute'
  if (seconds < 60) return `in ${seconds}s`
  const minutes = Math.ceil(seconds / 60)
  return `in about ${minutes} minute${minutes === 1 ? '' : 's'}`
}

async function spotifyGet<T>(path: string): Promise<T> {
  const cached = responseCache.get(path)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T
  }

  const pending = inFlightRequests.get(path)
  if (pending) {
    return pending as Promise<T>
  }

  const request = (async () => {
    const token = await getSpotifyToken()
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      if (response.status === 401) {
        cachedToken = null
      }

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after') ?? 0)
        throw new Error(
          `Spotify is rate limiting this app. Try again ${formatRetryAfter(retryAfter)}.`
        )
      }

      throw new Error(await spotifyErrorMessage(`Spotify request failed for ${path}`, response))
    }

    const value = (await response.json()) as T
    responseCache.set(path, { value, expiresAt: Date.now() + RESPONSE_TTL_MS })
    pruneResponseCache()
    return value
  })()

  inFlightRequests.set(path, request)

  try {
    return await request
  } finally {
    inFlightRequests.delete(path)
  }
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

// Spotify caps search results at 10 for Development Mode apps.
function clampSearchLimit(limit: number) {
  return Math.min(Math.max(limit, 1), 10)
}

export async function searchSpotifyTracks(query: string, limit: number = 10): Promise<SpotifySearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: clampSearchLimit(limit).toString(),
  })

  const data = await spotifyGet<SpotifySearchResponse>(`/search?${params}`)
  return data.tracks.items.map((track) => mapTrack(track))
}

type SpotifySimplifiedAlbum = {
  id: string
  name: string
  artists: SpotifyArtist[]
  images: Array<{ url: string }>
  release_date?: string
  total_tracks: number
  external_urls: { spotify: string }
}

// Tracks nested inside an album response are "simplified": they carry no album
// name or art, so both are copied from the parent album.
type SpotifySimplifiedTrack = {
  id: string
  name: string
  artists: SpotifyArtist[]
  duration_ms: number
  preview_url?: string | null
  external_urls: { spotify: string }
}

type SpotifyAlbumSearchResponse = {
  albums?: { items?: SpotifySimplifiedAlbum[] }
}

type SpotifyAlbumTracksResponse = {
  items?: SpotifySimplifiedTrack[]
  next?: string | null
}

type SpotifyAlbumResponse = SpotifySimplifiedAlbum & {
  tracks?: SpotifyAlbumTracksResponse
}

const ALBUM_TRACK_PAGE_SIZE = 50
const MAX_ALBUM_TRACKS = 200

function mapAlbum(album: SpotifySimplifiedAlbum): SpotifyAlbumResult {
  return {
    spotifyId: album.id,
    name: album.name,
    artist: album.artists.map((artist) => artist.name).join(', '),
    albumArtUrl: album.images?.[0]?.url,
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    spotifyUrl: album.external_urls.spotify,
  }
}

function mapSimplifiedTrack(
  track: SpotifySimplifiedTrack,
  album: SpotifySimplifiedAlbum
): SpotifySearchResult {
  const artist = track.artists?.map((entry) => entry.name).join(', ')

  return {
    spotifyId: track.id,
    title: track.name,
    artist: artist || album.artists.map((entry) => entry.name).join(', '),
    album: album.name,
    albumArtUrl: album.images?.[0]?.url,
    duration: track.duration_ms,
    previewUrl: track.preview_url ?? undefined,
    spotifyUrl: track.external_urls.spotify,
    genres: [],
  }
}

export async function searchSpotifyAlbums(query: string, limit: number = 10): Promise<SpotifyAlbumResult[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'album',
    limit: clampSearchLimit(limit).toString(),
  })

  const data = await spotifyGet<SpotifyAlbumSearchResponse>(`/search?${params}`)
  return (data.albums?.items ?? []).filter((album) => Boolean(album?.id)).map(mapAlbum)
}

export async function getSpotifyAlbum(albumId: string): Promise<SpotifyAlbumDetail> {
  const album = await spotifyGet<SpotifyAlbumResponse>(`/albums/${encodeURIComponent(albumId)}`)

  const items = [...(album.tracks?.items ?? [])]
  let hasMore = Boolean(album.tracks?.next)

  while (hasMore && items.length < MAX_ALBUM_TRACKS) {
    const page = await spotifyGet<SpotifyAlbumTracksResponse>(
      `/albums/${encodeURIComponent(albumId)}/tracks?limit=${ALBUM_TRACK_PAGE_SIZE}&offset=${items.length}`
    )
    const pageItems = page.items ?? []
    if (pageItems.length === 0) break
    items.push(...pageItems)
    hasMore = Boolean(page.next)
  }

  return {
    ...mapAlbum(album),
    tracks: items
      .filter((track) => Boolean(track?.id))
      .map((track) => mapSimplifiedTrack(track, album)),
  }
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

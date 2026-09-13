// Spotify API Types
export interface SpotifySearchResult {
  spotifyId: string
  title: string
  artist: string
  album: string
  albumArtUrl?: string
  duration: number
  previewUrl?: string
  spotifyUrl: string
  genres?: string[]
}

export interface SpotifyAlbumResult {
  spotifyId: string
  name: string
  artist: string
  albumArtUrl?: string
  releaseDate?: string
  totalTracks: number
  spotifyUrl: string
}

export interface SpotifyAlbumDetail extends SpotifyAlbumResult {
  tracks: SpotifySearchResult[]
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  duration_ms: number
  preview_url?: string
  external_urls: { spotify: string }
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

// Child Profile
export interface ChildProfile {
  id: string
  firstName: string
  lastName: string
  icon: string
  birthDate: Date
  createdAt: Date
}

// Interaction
export interface InteractionRecord {
  id: string
  childId: string
  songId: string
  song: SpotifySearchResult
  rating: 'thumbs_up' | 'thumbs_down' | 'neutral'
  review?: string
  exposedAt: Date
  createdAt: Date
}

export interface InteractionStats {
  thumbsUp: number
  thumbsDown: number
  neutral: number
  topArtists: Array<{ name: string; count: number }>
  totalInteractions: number
}

// Family Member
export interface FamilyMember {
  id: string
  email: string
  name: string
  role: 'viewer' | 'editor'
  createdAt: Date
}

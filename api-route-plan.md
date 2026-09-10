# API Route Plan

All routes live in `/app/api/` directory (Next.js 13+ App Router).

## Authentication Routes

### `POST /api/auth/signup`
- **Purpose**: Register a new parent account
- **Body**: `{ email, password, name }`
- **Response**: `{ success, userId, token }`
- **Protection**: None (public endpoint)

### `POST /api/auth/login`
- **Purpose**: Authenticate parent and return session token
- **Body**: `{ email, password }`
- **Response**: `{ success, userId, token }`
- **Protection**: None (public endpoint)

### `POST /api/auth/logout`
- **Purpose**: Clear session
- **Response**: `{ success }`
- **Protection**: Requires auth token

### `GET /api/auth/me`
- **Purpose**: Get current authenticated user
- **Response**: `{ id, email, name, children[], familyMembers[] }`
- **Protection**: Requires auth token

---

## Child Profile Routes

### `GET /api/children`
- **Purpose**: Get all child profiles for authenticated parent
- **Response**: `{ children: [{ id, name, birthDate, createdAt }] }`
- **Protection**: Requires auth token (parent only)

### `POST /api/children`
- **Purpose**: Create a new child profile
- **Body**: `{ name, birthDate }`
- **Response**: `{ id, name, birthDate }`
- **Protection**: Requires auth token (parent only)

### `GET /api/children/:childId`
- **Purpose**: Get single child profile (with stats)
- **Response**: `{ id, name, birthDate, totalInteractions, likes, dislikes }`
- **Protection**: Requires auth token (parent or authorized family member)

### `PUT /api/children/:childId`
- **Purpose**: Update child profile
- **Body**: `{ name, birthDate }`
- **Response**: `{ id, name, birthDate }`
- **Protection**: Requires auth token (parent only)

### `DELETE /api/children/:childId`
- **Purpose**: Delete child profile (and all interactions)
- **Response**: `{ success }`
- **Protection**: Requires auth token (parent only)

---

## Family Member Routes

### `GET /api/family-members`
- **Purpose**: Get all family members for authenticated parent
- **Response**: `{ familyMembers: [{ id, email, name, role, createdAt }] }`
- **Protection**: Requires auth token (parent only)

### `POST /api/family-members`
- **Purpose**: Invite a family member
- **Body**: `{ email, name, role }`
- **Response**: `{ id, email, name, role }`
- **Protection**: Requires auth token (parent only)
- **Note**: Would eventually send invitation email

### `DELETE /api/family-members/:memberId`
- **Purpose**: Remove a family member's access
- **Response**: `{ success }`
- **Protection**: Requires auth token (parent only)

---

## Song/Spotify Routes

### `GET /api/songs/search?q=query`
- **Purpose**: Search Spotify for songs
- **Query Params**: `q` (search query), `limit` (default 10)
- **Response**: `{ songs: [{ spotifyId, title, artist, album, albumArtUrl, previewUrl, spotifyUrl }] }`
- **Protection**: Requires auth token
- **Backend**: Calls Spotify API, caches results in DB if popular

### `GET /api/songs/:spotifyId`
- **Purpose**: Get song details (check if already in DB, or fetch from Spotify)
- **Response**: `{ id, spotifyId, title, artist, album, albumArtUrl, previewUrl }`
- **Protection**: Requires auth token

---

## Interaction Routes (Core Feature)

### `POST /api/interactions`
- **Purpose**: Log that a child was exposed to a song with a reaction
- **Body**: `{ childId, spotifyId, rating, review? }`
- **Response**: `{ id, childId, songId, rating, review, exposedAt }`
- **Protection**: Requires auth token (parent or authorized family member, but family members can't write yet)
- **Logic**: 
  - Verify parent owns the child
  - Upsert song into DB (from Spotify if needed)
  - Create interaction record

### `GET /api/interactions?childId=xyz&limit=20&offset=0`
- **Purpose**: Get interaction history for a child
- **Query Params**: `childId`, `limit` (default 20), `offset` (for pagination)
- **Response**: `{ interactions: [{ id, song: {...}, rating, review, exposedAt }], total }`
- **Protection**: Requires auth token (parent or authorized family member)

### `GET /api/interactions/stats?childId=xyz`
- **Purpose**: Get summary stats for a child (likes vs dislikes, most played artists, etc.)
- **Response**: `{ thumbsUp, thumbsDown, neutral, topArtists: [...], topGenres: [...] }`
- **Protection**: Requires auth token (parent or authorized family member)

### `PUT /api/interactions/:interactionId`
- **Purpose**: Update an interaction (change rating or review)
- **Body**: `{ rating?, review? }`
- **Response**: `{ id, rating, review, updatedAt }`
- **Protection**: Requires auth token (parent only)

### `DELETE /api/interactions/:interactionId`
- **Purpose**: Delete an interaction record
- **Response**: `{ success }`
- **Protection**: Requires auth token (parent only)

---

## Dashboard/Analytics Routes

### `GET /api/dashboard?childId=xyz`
- **Purpose**: Get dashboard data (quick stats, recent activity)
- **Response**: `{ child: {...}, recentInteractions: [...], stats: {...} }`
- **Protection**: Requires auth token (parent or authorized family member)

---

## Key Patterns

**Auth**: All routes (except /api/auth/signup and /api/auth/login) verify JWT token in header
**Ownership**: All routes verify the parent owns the resource being accessed
**Family Members**: For v1, family members can only VIEW (read routes only)
**Error Codes**: 
- `401`: Unauthorized (no token or invalid)
- `403`: Forbidden (token valid but no permission)
- `404`: Not found
- `400`: Bad request (validation error)

---

## Middleware Structure

Create middleware file (`middleware.ts` or `lib/auth.ts`):
- `verifyToken(req)` — Extracts and validates JWT
- `requireParent(req)` — Ensures user is a parent (can create/write)
- `requireAccessToChild(req, childId)` — Ensures parent/family member can view this child
- `verifyOwnership(req, resourceId)` — Ensures parent owns the resource being modified

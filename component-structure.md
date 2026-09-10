# Component & Page Structure

Using Next.js 13+ App Router with TypeScript.

## Directory Layout

```
app/
├── layout.tsx                 # Root layout with navbar
├── page.tsx                   # Landing page (redirect if logged in)
├── auth/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── logout/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx             # Authenticated layout
│   ├── page.tsx               # Main dashboard
│   ├── search/
│   │   └── page.tsx           # Search for songs
│   ├── history/
│   │   └── page.tsx           # View all interactions
│   ├── child/
│   │   ├── [childId]/
│   │   │   ├── page.tsx       # Child detail page
│   │   │   └── stats/
│   │   │       └── page.tsx   # Child stats/trends
│   │   └── new/
│   │       └── page.tsx       # Create child profile
│   └── settings/
│       ├── page.tsx           # Account settings
│       └── family/
│           └── page.tsx       # Manage family members
└── api/
    ├── auth/
    │   ├── signup/route.ts
    │   ├── login/route.ts
    │   ├── logout/route.ts
    │   └── me/route.ts
    ├── children/
    │   ├── route.ts           # GET all, POST create
    │   └── [childId]/route.ts # GET, PUT, DELETE
    ├── family-members/
    │   ├── route.ts           # GET all, POST invite
    │   └── [memberId]/route.ts # DELETE
    ├── songs/
    │   ├── search/route.ts    # GET search from Spotify
    │   └── [spotifyId]/route.ts # GET song details
    ├── interactions/
    │   ├── route.ts           # GET list, POST create
    │   ├── [interactionId]/route.ts # GET, PUT, DELETE
    │   └── stats/route.ts     # GET stats for child
    └── dashboard/
        └── route.ts           # GET dashboard data

components/
├── Auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AuthGuard.tsx          # Redirects unauthenticated users
├── Layout/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── Child/
│   ├── ChildSelector.tsx      # Dropdown to pick which child
│   ├── ChildCard.tsx          # Display child profile
│   ├── ChildForm.tsx          # Create/edit child
│   └── ChildStats.tsx         # Show child's stats
├── Song/
│   ├── SongCard.tsx           # Display song with album art
│   ├── SongSearchBar.tsx      # Search input
│   ├── SongSearchResults.tsx  # List of search results
│   └── SongDetails.tsx        # Full song info modal
├── Interaction/
│   ├── InteractionCard.tsx    # Display single interaction
│   ├── InteractionHistory.tsx # List of interactions
│   ├── RatingButtons.tsx      # Thumbs up/down/neutral
│   ├── ReviewInput.tsx        # Text review form
│   └── InteractionForm.tsx    # Combined form for logging
├── Family/
│   ├── FamilyMemberList.tsx
│   ├── FamilyMemberCard.tsx
│   └── InviteFamilyForm.tsx
└── Common/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Loading.tsx
    ├── Error.tsx
    └── EmptyState.tsx

lib/
├── auth.ts                    # Auth utilities (JWT, verify token)
├── spotify.ts                 # Spotify API calls
├── db.ts                      # Prisma client
├── api-client.ts              # Fetch wrapper with auth headers
└── types.ts                   # TypeScript interfaces

styles/
└── globals.css                # Tailwind/CSS

public/
└── icons/                     # SVGs for thumbs up/down, etc.
```

---

## Key Pages & Their Purpose

### `app/page.tsx` - Landing/Home
- If logged in: redirect to `/dashboard`
- If not: show call-to-action (login/signup buttons)

### `app/auth/login/page.tsx` - Login Page
- **Components**: `LoginForm`
- **Action**: Authenticate user, set JWT token in session

### `app/auth/signup/page.tsx` - Signup Page
- **Components**: `SignupForm`
- **Action**: Create parent account, set JWT token in session

### `app/dashboard/page.tsx` - Main Dashboard
- **Components**: `ChildSelector`, `ChildStats`, `InteractionHistory`
- **Shows**: 
  - Quick stats for selected child
  - Recent interactions
  - "Quick add song" button → leads to search
- **Protected**: Requires auth

### `app/dashboard/search/page.tsx` - Song Search
- **Components**: `SongSearchBar`, `SongSearchResults`, `RatingButtons`, `ReviewInput`
- **Flow**:
  1. Parent enters song title or artist
  2. Results from Spotify appear
  3. Click a song → opens interaction form
  4. Set rating + optional review
  5. Save → creates interaction record

### `app/dashboard/history/page.tsx` - Full History
- **Components**: `ChildSelector`, `InteractionHistory`
- **Shows**: All interactions for selected child with pagination/filters

### `app/dashboard/child/[childId]/page.tsx` - Child Detail
- **Components**: `ChildCard`, `ChildStats`, `InteractionHistory`
- **Shows**: Profile info, summary stats, recent activity

### `app/dashboard/child/new/page.tsx` - Create Child
- **Components**: `ChildForm`
- **Action**: Create new child profile

### `app/dashboard/settings/family/page.tsx` - Manage Family
- **Components**: `FamilyMemberList`, `FamilyMemberCard`, `InviteFamilyForm`
- **Actions**: Invite family members, remove access

---

## Key Component Details

### `AuthGuard.tsx`
```
- Wraps protected pages
- Checks for valid JWT token
- Redirects to /auth/login if missing
- Shows loading state while verifying
```

### `ChildSelector.tsx`
```
- Dropdown of all parent's children
- Clicking a child loads that child's data
- Stores selected child in context or URL param
```

### `RatingButtons.tsx`
```
- Three buttons: 👍 (thumbs up), 👎 (thumbs down), ➖ (neutral)
- Toggle state (clicked button stays highlighted)
- Returns rating value to parent component
```

### `SongSearchBar.tsx`
```
- Input field with debounced search
- Calls /api/songs/search?q=query
- Returns results in real-time dropdown OR full page results
```

### `InteractionForm.tsx`
```
- Displays song details (album art, title, artist)
- Shows RatingButtons
- Shows ReviewInput (optional text field)
- Submit button saves to /api/interactions POST
```

### `ChildStats.tsx`
```
- Calls /api/interactions/stats?childId=xyz
- Displays:
  - Total tracks exposed
  - Thumbs up count
  - Thumbs down count
  - Top 5 artists
  - Favorite genres (derived from tracks)
  - Chart showing likes/dislikes over time
```

---

## State Management

**Simple approach for MVP:**
- Use React Context for:
  - Current authenticated user
  - Selected child profile
  - Is loading state
- Use URL params for:
  - Current page/filter
  - Selected child ID
- Use `useEffect` + fetch for:
  - Loading data from API routes

**Could upgrade to:**
- TanStack Query (React Query) for server state
- Zustand or Jotai for client state
- But not needed yet

---

## UI Framework

Recommendation: **Tailwind CSS + Headless UI**
- Tailwind for styling (utility-first)
- Headless UI or Radix UI for components (modals, dropdowns, etc.)
- Keep it clean and simple for MVP

Alternatively: **shadcn/ui** (pre-built components on top of Tailwind + Radix)

---

## Flow: Logging a Song for a Child

1. Parent clicks "Add Music" on dashboard
2. Routed to `/dashboard/search`
3. Searches for song (calls `/api/songs/search`)
4. Clicks a result song
5. Modal/form appears with:
   - Song details (album art, title, artist)
   - RatingButtons (select thumbs up/down/neutral)
   - ReviewInput (optional notes)
6. Clicks "Save"
7. Calls `POST /api/interactions` with { childId, spotifyId, rating, review }
8. Returns to dashboard (or stays on search)
9. New interaction appears in child's history

---

## Flow: Viewing Child Stats

1. Parent clicks on child name or goes to `/dashboard/child/[childId]`
2. Page loads ChildStats component
3. Component calls `/api/interactions/stats?childId=xyz`
4. Displays:
   - Thumbs up / thumbs down counts
   - Most played artists
   - Interaction timeline
   - Top songs
5. Can click "View All" to go to history page

---

## LaunchDarkly Integration Points

Future flags to create:
- `feature-search-enabled` — Toggle song search on/off
- `feature-reviews-enabled` — Toggle review text field
- `feature-family-members` — Toggle family member invite UI
- `feature-stats-dashboard` — Toggle stats page
- `ui-dark-mode` — A/B test dark mode

For MVP, just wire up LaunchDarkly context but don't gate features yet.

# 🎵 Milestones

Track what music, movies, TV, and books your children enjoy and understand their growing preferences.

## Project Overview

Milestones is a Next.js + TypeScript application that helps parents track media exposure for their children. The MVP focuses on music, allowing parents to:

- Search Spotify's catalog
- Log songs their children are exposed to
- Rate reactions (thumbs up/down/neutral)
- Add optional notes/reviews
- Share view-only access with family members
- Track preferences over time
- Manage multiple child profiles

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk
- **External APIs**: Spotify Web API
- **Future**: LaunchDarkly for feature flags

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud)
- Clerk account (https://dashboard.clerk.com)
- Spotify Developer account (https://developer.spotify.com)

## Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone <your-repo>
cd milestones
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

#### Database Setup

1. Create a PostgreSQL database locally or use a cloud provider (e.g., Neon, Railway, Supabase)
2. Add your `DATABASE_URL` to `.env.local`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/milestones"
```

#### Clerk Setup

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**
4. Add to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### Spotify Setup

1. Go to https://developer.spotify.com/dashboard
2. Log in or create an account
3. Create a new application
4. Accept the terms and create
5. Copy your **Client ID** and **Client Secret**
6. Add to `.env.local`:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

#### LaunchDarkly (Optional, for future use)

```env
NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID=your_client_id
```

### 3. Set Up Database Schema

Run Prisma migrations to create tables:

```bash
npm run prisma:migrate
```

This will:
- Create the database schema
- Generate Prisma client

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
milestones/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Clerk
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/               # Protected routes
│   │   ├── page.tsx            # Dashboard home
│   │   ├── search/page.tsx      # Song search
│   │   └── ...more pages
│   └── api/                     # API routes
│       ├── children/
│       ├── songs/
│       └── interactions/
├── components/                   # React components
│   ├── Layout/                  # Navbar, Sidebar
│   ├── Song/                    # Song-related components
│   └── Interaction/             # Interaction components
├── lib/                         # Utilities
│   ├── db.ts                    # Prisma client
│   ├── auth.ts                  # Auth helpers
│   ├── spotify.ts               # Spotify API client
│   └── types.ts                 # TypeScript types
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── styles/                      # Global styles
├── .env.example                 # Environment template
├── next.config.js               # Next.js config
├── tailwind.config.ts           # Tailwind config
└── tsconfig.json                # TypeScript config
```

## Key Features (MVP)

### ✅ Completed
- User authentication (Clerk)
- Create and manage child profiles
- Search Spotify catalog (Client Credentials flow)
- Log songs with ratings (thumbs up/down/neutral)
- Add optional review notes
- Responsive UI with Tailwind CSS

### 🚧 In Progress / Coming Next
- View interaction history
- Child statistics page
- Family member management
- Permissions system for view-only access
- Analytics dashboard
- Export/sharing features

### 📋 Future Roadmap
- LaunchDarkly integration for feature flags
- Movie/TV tracking
- Book tracking
- Playlist generation from child's preferences
- Parent discussion/collaboration features
- Advanced analytics

## API Routes

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Children
- `GET /api/children` - List all children
- `POST /api/children` - Create child
- `GET /api/children/:id` - Get child details
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Songs
- `GET /api/songs/search?q=query` - Search Spotify

### Interactions
- `GET /api/interactions?childId=xyz` - Get history
- `POST /api/interactions` - Log new interaction
- `PUT /api/interactions/:id` - Update interaction
- `DELETE /api/interactions/:id` - Delete interaction
- `GET /api/interactions/stats?childId=xyz` - Get statistics

### Family
- `GET /api/family-members` - List family
- `POST /api/family-members` - Invite member
- `DELETE /api/family-members/:id` - Remove member

## Development Workflow

### Database Changes

If you modify `prisma/schema.prisma`, run:

```bash
npm run prisma:migrate
```

This creates a migration file and applies it.

### View Database

To inspect your database visually:

```bash
npm run prisma:studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555)

### Add New Routes

1. Create file in `app/api/[route]/route.ts`
2. Use `getCurrentParent()` to get authenticated user
3. Use `verifyChildOwnership()` to check permissions
4. Import `prisma` from `@/lib/db`
5. Return `NextResponse.json()`

### Add New Components

1. Create in `components/` organized by feature
2. Use client-side `'use client'` directive if needed
3. Keep components focused and reusable
4. Use Tailwind classes for styling

## Testing

Currently using manual testing. Next:

```bash
npm install --save-dev jest @testing-library/react
```

Add test files as `*.test.ts` or `*.test.tsx`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project into Vercel
3. Add environment variables in Vercel dashboard
4. Deploy on push

### Other Platforms

For Docker/traditional hosting, ensure:
- Node.js 18+
- PostgreSQL accessible
- All env vars configured
- Run `npm run build` then `npm run start`

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules .next
npm install
npm run prisma:generate
```

### Database connection issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network rules

### Spotify search returns no results
- Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
- Check Spotify API dashboard for rate limits
- Note: Uses `Client Credentials` flow (app-level auth, not user auth)

### Clerk authentication not working
- Verify publishable/secret keys
- Check callback URLs match your app domain
- Clear browser cookies

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open Pull Request

## License

MIT

## Support

For questions or issues, open a GitHub issue or contact the maintainer.

---

**Happy tracking! 🎵👶**

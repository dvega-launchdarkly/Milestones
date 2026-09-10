# 🚀 Milestones Quick Start

Get Milestones running in 5 minutes!

## Step 1: Clone & Install (1 min)

```bash
git clone <repo-url>
cd milestones
npm install
```

## Step 2: Get Your API Keys (2 min)

### Clerk
1. Go to https://dashboard.clerk.com
2. Create an app
3. Copy **Publishable Key** and **Secret Key**

### Spotify
1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Copy **Client ID** and **Client Secret**

### PostgreSQL
- Create a database (local, Neon, Railway, etc.)
- Copy the connection string

## Step 3: Environment Variables (1 min)

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/milestones"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Spotify
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
```

## Step 4: Database Setup (1 min)

```bash
npm run prisma:migrate
```

## Step 5: Run! (1 min)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## What's Ready to Use

✅ **Authentication** - Sign up, login, logout
✅ **Child Profiles** - Create and list children
✅ **Song Search** - Search Spotify catalog
✅ **Log Songs** - Rate songs (👍 👎 😐) + add notes
✅ **Responsive UI** - Works on mobile and desktop

## Next Steps to Implement

- [ ] View interaction history
- [ ] Child statistics page
- [ ] Family member invitations
- [ ] Analytics dashboard
- [ ] LaunchDarkly integration

## Need Help?

1. Check `README.md` for detailed docs
2. See `API Route Plan` for endpoint reference
3. Review database schema in `prisma/schema.prisma`

## Common Issues

**"Cannot find module" error?**
```bash
rm -rf node_modules .next
npm install
```

**Spotify search not working?**
- Double-check your API keys are correct
- Verify they're in `.env.local` (not `.env`)

**Clerk login loop?**
- Clear browser cookies
- Check callback URLs in Clerk dashboard

---

**Ready to build! 🎵**

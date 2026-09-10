import Link from 'next/link'
import type { Metadata } from 'next'
import MarketingNav from '@/components/Layout/MarketingNav'

export const metadata: Metadata = {
  title: 'About — Milestones',
  description: 'How Milestones helps you track the music your child is discovering.',
}

const steps = [
  {
    number: '1',
    title: 'Create a parent account',
    body: 'Sign up on the landing page. Clerk handles email, password, and verification. Milestones never stores your password.',
  },
  {
    number: '2',
    title: 'Land on your dashboard',
    body: 'After signup or login you go to /dashboard. Signed-out visitors cannot open the dashboard or APIs.',
  },
  {
    number: '3',
    title: 'Add a child profile',
    body: 'Create a profile with a name and birth date. Songs are always logged for a specific child, so you can track more than one kid.',
  },
  {
    number: '4',
    title: 'Search Spotify',
    body: 'Type a title, artist, or album. The app searches Spotify and shows matching tracks with album art.',
  },
  {
    number: '5',
    title: 'Rate the reaction',
    body: 'Pick a song, then choose Loved It, Neutral, or Not Interested. Add an optional note, like “they danced when the beat dropped.”',
  },
  {
    number: '6',
    title: 'Review the history',
    body: 'Saved songs show up in History with the child, rating, and date. The first time you do this, Milestones also creates your parent row in the database and links it to your Clerk account.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface">
      <MarketingNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">
            How it works
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4">
            From hearing a song to remembering why it mattered
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Milestones is a logbook for parents. You record what your child hears, how they
            react, and what you noticed in the moment.
          </p>
        </header>

        <ol className="space-y-4 pb-8">
          {steps.map((step) => (
            <li key={step.number} className="card flex gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white font-bold">
                {step.number}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">{step.title}</h2>
                <p className="text-gray-600 mt-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-ink mb-4">Who does what</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-ink mb-1">Clerk</h3>
              <p className="text-gray-600">
                Owns the account: sign up, login, and the session that proves you are signed in.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-1">Milestones + Neon</h3>
              <p className="text-gray-600">
                Stores parents, children, songs, and ratings. Your Clerk user id is the link.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-1">Spotify</h3>
              <p className="text-gray-600">
                Provides the catalog. We search tracks; we do not play full songs or create playlists yet.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-6 mb-12">
          <h2 className="text-xl font-semibold text-ink mb-2">Not built yet</h2>
          <p className="text-gray-600">
            Family invitations, child stats, and sharing a view-only feed are planned. The
            sidebar links are there so the path is obvious; those pages are still placeholders.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-16">
          <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
            Create an account
          </Link>
          <Link href="/" className="btn-outline text-lg px-8 py-3">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}

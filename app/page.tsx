'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import MarketingNav from '@/components/Layout/MarketingNav'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  return (
    <main className="min-h-screen bg-surface">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-ink mb-6">
            Track Your Child's Musical Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover what music, movies, TV shows, and books capture your child's attention.
            Build a personalized record of their growing preferences and share it with family.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                  Get Started Free
                </Link>
                <Link href="/auth/login" className="btn-outline text-lg px-8 py-3">
                  Already have an account?
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 py-20">
          <div className="card">
        
            <h3 className="text-xl font-semibold mb-2">Search & Log Music</h3>
            <p className="text-gray-600">
              Search Spotify's massive catalog and instantly log songs your child is exposed to.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Rate Preferences</h3>
            <p className="text-gray-600">
              Track likes and dislikes. Add notes to remember what made them dance or smile.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Share with Family</h3>
            <p className="text-gray-600">
              Give grandparents and family members view-only access to see your child's journey.
            </p>
          </div>
        </div>

        <footer className="border-t border-gray-200 py-8 text-center text-gray-600">
          <p>
            &copy; 2026 Milestones. Built for my kids.{' '}
            <Link href="/about" className="text-ink hover:underline">
              How it works
            </Link>
          </p>
        </footer>
      </div>
    </main>
  )
}

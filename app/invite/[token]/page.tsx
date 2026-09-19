import AcceptInviteButton from '@/components/Family/AcceptInviteButton'
import MarketingNav from '@/components/Layout/MarketingNav'
import { prisma } from '@/lib/db'
import { familyRelationshipLabel, familyRoleLabel } from '@/lib/family-roles'
import { hashInviteToken, invitePath, isInviteUsable } from '@/lib/invites'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function InvitePage({ params }: { params: { token: string } }) {
  const { userId } = auth()

  const invite = await prisma.familyInvite.findUnique({
    where: { tokenHash: hashInviteToken(params.token) },
    include: {
      family: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  })

  const usable = invite ? isInviteUsable(invite) : false
  const returnTo = invitePath(params.token)

  return (
    <main className="min-h-screen bg-surface">
      <MarketingNav />
      <div className="max-w-xl mx-auto px-4 py-16">
        {!usable || !invite ? (
          <div className="card">
            <h1 className="text-2xl font-bold text-ink mb-2">This invite isn&apos;t valid</h1>
            <p className="text-gray-600 mb-6">
              It may have been used already, revoked, or expired. Ask whoever invited you to
              send a new link.
            </p>
            <Link href="/" className="btn-secondary">
              Go home
            </Link>
          </div>
        ) : (
          <div className="card">
            <h1 className="text-2xl font-bold text-ink mb-2">
              Join {invite.family.name ?? 'a family'} on Milestones
            </h1>
            <p className="text-gray-600 mb-6">
              {invite.invitedBy?.name ?? 'Someone'} invited you
              {invite.relationship
                ? ` as ${familyRelationshipLabel(invite.relationship)?.toLowerCase()}`
                : ''}
              . You&apos;ll be able to {familyRoleLabel(invite.role).toLowerCase()}.
            </p>

            {userId ? (
              <AcceptInviteButton token={params.token} />
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/auth/signup?redirect_url=${encodeURIComponent(returnTo)}`}
                  className="btn-primary"
                >
                  Create an account
                </Link>
                <Link
                  href={`/auth/login?redirect_url=${encodeURIComponent(returnTo)}`}
                  className="btn-outline"
                >
                  I already have one
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

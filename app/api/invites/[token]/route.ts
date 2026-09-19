import { getCurrentParent } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashInviteToken, isInviteUsable } from '@/lib/invites'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(_request: Request, { params }: { params: { token: string } }) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Sign in to accept this invite' }, { status: 401 })
  }

  try {
    const invite = await prisma.familyInvite.findUnique({
      where: { tokenHash: hashInviteToken(params.token) },
    })

    if (!invite || !isInviteUsable(invite)) {
      return NextResponse.json({ error: 'This invite is no longer valid' }, { status: 410 })
    }

    // Creates the Parent record if this is their first visit after signing up.
    const parent = await getCurrentParent()

    await prisma.$transaction(async (tx) => {
      const existing = await tx.familyMembership.findUnique({
        where: { familyId_parentId: { familyId: invite.familyId, parentId: parent.id } },
      })

      if (!existing) {
        await tx.familyMembership.create({
          data: {
            familyId: invite.familyId,
            parentId: parent.id,
            role: invite.role,
            relationship: invite.relationship,
          },
        })
      }

      await tx.familyInvite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedById: parent.id,
        },
      })

      // Land them in the family they just joined.
      await tx.parent.update({
        where: { id: parent.id },
        data: { activeFamilyId: invite.familyId },
      })
    })

    return NextResponse.json({ familyId: invite.familyId })
  } catch (error) {
    console.error('Error accepting invite:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invite' },
      { status: 500 }
    )
  }
}

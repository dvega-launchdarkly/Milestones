import { getCurrentFamilyContext } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  canManageFamily,
  isFamilyRelationshipId,
  isFamilyRoleId,
} from '@/lib/family-roles'
import { createInviteToken, inviteExpiryDate, invitePath } from '@/lib/invites'
import { isInviteFamilyEnabled } from '@/lib/launchdarkly-server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const { family, membership } = await getCurrentFamilyContext()

    if (!canManageFamily(membership.role)) {
      return NextResponse.json({ invites: [] })
    }

    const invites = await prisma.familyInvite.findMany({
      where: { familyId: family.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        relationship: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Error listing invites:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list invites' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isInviteFamilyEnabled())) {
      return NextResponse.json({ error: 'Family invites are not available' }, { status: 404 })
    }

    const { parent, family, membership } = await getCurrentFamilyContext()

    if (!canManageFamily(membership.role)) {
      return NextResponse.json(
        { error: 'Only a family owner can invite members' },
        { status: 403 }
      )
    }

    const { email, role, relationship } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    if (!isFamilyRoleId(role)) {
      return NextResponse.json({ error: 'Unknown role' }, { status: 400 })
    }

    if (relationship != null && !isFamilyRelationshipId(relationship)) {
      return NextResponse.json({ error: 'Unknown relationship' }, { status: 400 })
    }

    const { token, tokenHash } = createInviteToken()

    const invite = await prisma.familyInvite.create({
      data: {
        familyId: family.id,
        email: normalizedEmail,
        role,
        relationship: relationship ?? null,
        tokenHash,
        invitedById: parent.id,
        expiresAt: inviteExpiryDate(),
      },
      select: { id: true, email: true, role: true, relationship: true, expiresAt: true },
    })

    // The raw token is returned exactly once - it is not recoverable later.
    return NextResponse.json({ invite, invitePath: invitePath(token) }, { status: 201 })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invite' },
      { status: 500 }
    )
  }
}

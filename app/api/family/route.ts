import { getCurrentFamilyContext, setActiveFamily } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canManageFamily, isFamilyRelationshipId } from '@/lib/family-roles'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const { parent, family, membership, memberships } = await getCurrentFamilyContext()

    const familyMemberships = await prisma.familyMembership.findMany({
      where: { familyId: family.id },
      include: { parent: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      family: { id: family.id, name: family.name },
      membership: { role: membership.role, relationship: membership.relationship },
      members: familyMemberships.map((entry) => ({
        id: entry.id,
        name: entry.parent.name,
        email: entry.parent.email,
        role: entry.role,
        relationship: entry.relationship,
        isCurrentUser: entry.parentId === parent.id,
      })),
      families: memberships.map((entry) => ({
        id: entry.familyId,
        name: entry.family.name,
        role: entry.role,
        isActive: entry.familyId === family.id,
      })),
    })
  } catch (error) {
    console.error('Error fetching family:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch family' },
      { status: 401 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (typeof body.activeFamilyId === 'string') {
      await setActiveFamily(body.activeFamilyId)
      return NextResponse.json({ activeFamilyId: body.activeFamilyId })
    }

    const { family, membership } = await getCurrentFamilyContext()

    if (typeof body.name === 'string') {
      if (!canManageFamily(membership.role)) {
        return NextResponse.json(
          { error: 'Only a family owner can rename the family' },
          { status: 403 }
        )
      }

      const name = body.name.trim()

      if (!name) {
        return NextResponse.json({ error: 'A family name is required' }, { status: 400 })
      }

      const updated = await prisma.family.update({
        where: { id: family.id },
        data: { name: name.slice(0, 80) },
      })

      return NextResponse.json({ family: { id: updated.id, name: updated.name } })
    }

    if (!isFamilyRelationshipId(body.relationship)) {
      return NextResponse.json({ error: 'Unknown relationship' }, { status: 400 })
    }

    const updated = await prisma.familyMembership.update({
      where: { id: membership.id },
      data: { relationship: body.relationship },
    })

    return NextResponse.json({
      membership: { role: updated.role, relationship: updated.relationship },
    })
  } catch (error) {
    console.error('Error updating family:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update family' },
      { status: 500 }
    )
  }
}

import { getCurrentFamilyContext } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canManageFamily } from '@/lib/family-roles'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  _request: Request,
  { params }: { params: { inviteId: string } }
) {
  try {
    const { family, membership } = await getCurrentFamilyContext()

    if (!canManageFamily(membership.role)) {
      return NextResponse.json(
        { error: 'Only a family owner can revoke invites' },
        { status: 403 }
      )
    }

    const invite = await prisma.familyInvite.findUnique({ where: { id: params.inviteId } })

    if (!invite || invite.familyId !== family.id) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    await prisma.familyInvite.update({
      where: { id: invite.id },
      data: { status: 'revoked' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking invite:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke invite' },
      { status: 500 }
    )
  }
}

import { auth, currentUser } from '@clerk/nextjs/server'
import { getCurrentFamilyContext } from './auth'
import { prisma } from './db'
import { isFamilyRoleId } from './family-roles'
import {
  ANONYMOUS_LD_CONTEXT,
  buildClerkOnlyUserContext,
  buildLdMultiContext,
  type LdContext,
} from './ld-context'

function clerkDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
} | null) {
  if (!user) return undefined
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || undefined
}

export async function getLdContextForCurrentUser(): Promise<LdContext> {
  const { userId } = auth()
  if (!userId) return ANONYMOUS_LD_CONTEXT

  const clerkUser = await currentUser()
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress
  const clerkName = clerkDisplayName(clerkUser)

  try {
    const { parent, family, membership } = await getCurrentFamilyContext()
    const [children, interactionCount, memberships] = await Promise.all([
      prisma.childProfile.findMany({
        where: { familyId: family.id },
        select: { birthDate: true },
      }),
      prisma.interaction.count({
        where: { child: { familyId: family.id } },
      }),
      prisma.familyMembership.findMany({
        where: { familyId: family.id },
        select: { relationship: true },
      }),
    ])

    const relationships = memberships
      .map((entry) => entry.relationship)
      .filter((relationship): relationship is string => Boolean(relationship))
      .filter((relationship, index, all) => all.indexOf(relationship) === index)
      .sort()

    return buildLdMultiContext({
      clerkUserId: userId,
      email: parent.email || clerkEmail,
      name: parent.name || clerkName,
      accountCreatedAt: clerkUser?.createdAt ?? parent.createdAt,
      familyId: family.id,
      role: isFamilyRoleId(membership.role) ? membership.role : 'viewer',
      relationship: membership.relationship,
      childBirthDates: children.map((child) => child.birthDate),
      interactionCount,
      familyMemberCount: memberships.length,
      relationships,
    })
  } catch {
    return buildClerkOnlyUserContext({
      id: userId,
      email: clerkEmail,
      name: clerkName,
      createdAt: clerkUser?.createdAt,
    })
  }
}

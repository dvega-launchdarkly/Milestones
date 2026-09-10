import { auth, currentUser } from '@clerk/nextjs/server'
import { getCurrentParent } from './auth'
import { prisma } from './db'
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
    const parent = await getCurrentParent()
    const [children, interactionCount, familyMemberCount] = await Promise.all([
      prisma.childProfile.findMany({
        where: { parentId: parent.id },
        select: { birthDate: true },
      }),
      prisma.interaction.count({
        where: { child: { parentId: parent.id } },
      }),
      prisma.familyMember.count({
        where: { parentId: parent.id },
      }),
    ])

    return buildLdMultiContext({
      clerkUserId: userId,
      email: parent.email || clerkEmail,
      name: parent.name || clerkName,
      accountCreatedAt: clerkUser?.createdAt ?? parent.createdAt,
      parentId: parent.id,
      role: 'parent',
      childBirthDates: children.map((child) => child.birthDate),
      interactionCount,
      familyMemberCount,
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

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './db'
import { canEditFamily } from './family-roles'

/**
 * Get the current user's parent record from database
 * Creates one if it doesn't exist
 */
export async function getCurrentParent() {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Not authenticated')
  }

  // Try to find existing parent record
  let parent = await prisma.parent.findUnique({
    where: { clerkId: userId },
  })

  // If doesn't exist, create it
  if (!parent) {
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()

    if (!email) {
      throw new Error('Authenticated user is missing an email address')
    }

    parent = await prisma.parent.create({
      data: {
        clerkId: userId,
        email,
        name: name || email,
      },
    })
  }

  return parent
}

function defaultFamilyName(parentName: string) {
  const first = parentName.trim().split(/\s+/)[0]
  return first ? `${first}'s family` : 'My family'
}

/**
 * Get the current user's household, along with their membership in it.
 * Creates the household on first use for accounts that predate memberships.
 */
export async function getCurrentFamilyContext() {
  const parent = await getCurrentParent()

  const memberships = await prisma.familyMembership.findMany({
    where: { parentId: parent.id },
    include: { family: true },
    orderBy: { createdAt: 'asc' },
  })

  if (memberships.length === 0) {
    const membership = await prisma.familyMembership.create({
      data: {
        role: 'owner',
        parent: { connect: { id: parent.id } },
        family: { create: { name: defaultFamilyName(parent.name) } },
      },
      include: { family: true },
    })

    return { parent, membership, family: membership.family, memberships: [membership] }
  }

  const active =
    memberships.find((entry) => entry.familyId === parent.activeFamilyId) ?? memberships[0]

  return { parent, membership: active, family: active.family, memberships }
}

/**
 * Switch which household the user is viewing. Only households they belong to.
 */
export async function setActiveFamily(familyId: string) {
  const parent = await getCurrentParent()

  const membership = await prisma.familyMembership.findFirst({
    where: { parentId: parent.id, familyId },
  })

  if (!membership) {
    throw new Error('Unauthorized: you are not a member of that family')
  }

  await prisma.parent.update({
    where: { id: parent.id },
    data: { activeFamilyId: familyId },
  })

  return membership
}

/**
 * Verify the current user's household owns a child.
 * Pass requireEdit for anything that writes - viewers are read-only.
 */
export async function verifyChildOwnership(
  childId: string,
  options: { requireEdit?: boolean } = {}
) {
  const { family, membership } = await getCurrentFamilyContext()

  const child = await prisma.childProfile.findUnique({
    where: { id: childId },
  })

  if (!child || child.familyId !== family.id) {
    throw new Error('Unauthorized: Child not found or does not belong to you')
  }

  if (options.requireEdit && !canEditFamily(membership.role)) {
    throw new Error('Unauthorized: your family role is view-only')
  }

  return child
}

/**
 * Verify the current user may make changes in their household.
 */
export async function requireFamilyEditAccess() {
  const context = await getCurrentFamilyContext()

  if (!canEditFamily(context.membership.role)) {
    throw new Error('Unauthorized: your family role is view-only')
  }

  return context
}

/**
 * Verify that the current user is the parent who owns an interaction
 */
export async function verifyInteractionOwnership(interactionId: string) {
  const { family } = await getCurrentFamilyContext()

  const interaction = await prisma.interaction.findUnique({
    where: { id: interactionId },
    include: { child: true },
  })

  if (!interaction || interaction.child.familyId !== family.id) {
    throw new Error('Unauthorized: Interaction not found or does not belong to you')
  }

  return interaction
}

/**
 * Check if current user is authenticated
 */
export function requireAuth() {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Not authenticated')
  }
  return userId
}

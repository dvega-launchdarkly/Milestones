import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './db'

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

/**
 * Verify that the current user is the parent of a child
 */
export async function verifyChildOwnership(childId: string) {
  const parent = await getCurrentParent()

  const child = await prisma.childProfile.findUnique({
    where: { id: childId },
  })

  if (!child || child.parentId !== parent.id) {
    throw new Error('Unauthorized: Child not found or does not belong to you')
  }

  return child
}

/**
 * Verify that the current user is the parent who owns an interaction
 */
export async function verifyInteractionOwnership(interactionId: string) {
  const parent = await getCurrentParent()

  const interaction = await prisma.interaction.findUnique({
    where: { id: interactionId },
    include: { child: true },
  })

  if (!interaction || interaction.child.parentId !== parent.id) {
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

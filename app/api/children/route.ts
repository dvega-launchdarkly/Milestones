import { getCurrentParent } from '@/lib/auth'
import { parseChildInput } from '@/lib/child'
import { parseDateOnly } from '@/lib/dates'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/children
 * Get all children for the current parent
 */
export async function GET() {
  try {
    const parent = await getCurrentParent()

    const children = await prisma.childProfile.findMany({
      where: { parentId: parent.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ children })
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch children' },
      { status: 401 }
    )
  }
}

/**
 * POST /api/children
 * Create a new child profile
 */
export async function POST(request: NextRequest) {
  try {
    const parent = await getCurrentParent()
    const parsed = parseChildInput(await request.json())

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const child = await prisma.childProfile.create({
      data: {
        parentId: parent.id,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        icon: parsed.icon,
        birthDate: parseDateOnly(parsed.birthDate),
      },
    })

    return NextResponse.json(child, { status: 201 })
  } catch (error) {
    console.error('Error creating child:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create child' },
      { status: 500 }
    )
  }
}

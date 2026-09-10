import { verifyChildOwnership } from '@/lib/auth'
import { parseChildInput } from '@/lib/child'
import { parseDateOnly } from '@/lib/dates'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const child = await verifyChildOwnership(params.childId)
    return NextResponse.json({ child })
  } catch (error) {
    console.error('Error fetching child:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch child' },
      { status: 401 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    await verifyChildOwnership(params.childId)
    const parsed = parseChildInput(await request.json())

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const child = await prisma.childProfile.update({
      where: { id: params.childId },
      data: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        icon: parsed.icon,
        birthDate: parseDateOnly(parsed.birthDate),
      },
    })

    return NextResponse.json({ child })
  } catch (error) {
    console.error('Error updating child:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update child' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    await verifyChildOwnership(params.childId)

    await prisma.childProfile.delete({
      where: { id: params.childId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting child:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete child' },
      { status: 500 }
    )
  }
}

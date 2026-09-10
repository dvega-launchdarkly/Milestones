import { getLdContextForCurrentUser } from '@/lib/ld-context-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const context = await getLdContextForCurrentUser()
    return NextResponse.json(context)
  } catch (error) {
    console.error('Error building LaunchDarkly context:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to build LaunchDarkly context' },
      { status: 401 }
    )
  }
}

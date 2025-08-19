import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, verifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const READONLY = process.env.API_READONLY === 'true'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Readonly / fail-open guard for production
    if (READONLY) {
      return NextResponse.json({ success: true, data: [] })
    }

    const recentCapsules = await (db as any)
      .select()
      .from(capsules)
      .where(eq(capsules.walletAddress, walletAddress))
      .orderBy(desc(capsules.createdAt))
      .limit(limit)

    const recentVerifications = await (db as any)
      .select()
      .from(verifications)
      .where(eq(verifications.verifierAddress, walletAddress))
      .orderBy(desc(verifications.verifiedAt))
      .limit(limit)

    const activities = [
      ...recentCapsules.map((c: any) => ({
        id: c.id,
        action: 'Created capsule',
        description: c.description || `Capsule #${c.tokenId}`,
        timestamp: c.createdAt
      })),
      ...recentVerifications.map((v: any) => ({
        id: v.id,
        action: 'Verified capsule',
        description: `Capsule #${v.capsuleId}`,
        timestamp: v.verifiedAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({ success: true, data: activities })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    // Fail-open fallback in production
    if (READONLY) {
      return NextResponse.json({ success: true, data: [] })
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user activity' },
      { status: 500 }
    )
  }
} 
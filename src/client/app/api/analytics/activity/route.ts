import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, verifications } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

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

    // Get recent capsules
    const recentCapsules = await db
      .select({
        id: capsules.id,
        tokenId: capsules.tokenId,
        description: capsules.description,
        createdAt: capsules.createdAt,
        type: db.raw('"capsule"').as('type')
      })
      .from(capsules)
      .where(eq(capsules.walletAddress, walletAddress))
      .orderBy(desc(capsules.createdAt))
      .limit(limit)

    // Get recent verifications
    const recentVerifications = await db
      .select({
        id: verifications.id,
        capsuleId: verifications.capsuleId,
        verifierAddress: verifications.verifierAddress,
        verifiedAt: verifications.verifiedAt,
        type: db.raw('"verification"').as('type')
      })
      .from(verifications)
      .where(eq(verifications.verifierAddress, walletAddress))
      .orderBy(desc(verifications.verifiedAt))
      .limit(limit)

    // Combine and sort activities
    const activities = [
      ...recentCapsules.map((capsule: any) => ({
        ...capsule,
        action: 'Created capsule',
        description: capsule.description || `Capsule #${capsule.tokenId}`,
        timestamp: capsule.createdAt
      })),
      ...recentVerifications.map((verification: any) => ({
        ...verification,
        action: 'Verified capsule',
        description: `Capsule #${verification.capsuleId}`,
        timestamp: verification.verifiedAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: activities
    })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user activity' },
      { status: 500 }
    )
  }
} 
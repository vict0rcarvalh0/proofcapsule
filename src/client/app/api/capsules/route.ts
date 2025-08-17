import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, users, userStats } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

// GET /api/capsules - Get all capsules (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const isPublic = searchParams.get('public')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = db.select().from(capsules)

    // Apply filters
    if (walletAddress) {
      query = query.where(eq(capsules.walletAddress, walletAddress))
    }

    if (isPublic !== null) {
      const publicFilter = isPublic === 'true'
      query = query.where(eq(capsules.isPublic, publicFilter))
    }

    // Apply pagination and ordering
    const results = await query
      .orderBy(desc(capsules.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching capsules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch capsules' },
      { status: 500 }
    )
  }
}

// POST /api/capsules - Create a new capsule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tokenId,
      walletAddress,
      contentHash,
      description,
      location,
      ipfsHash,
      isPublic,
      blockNumber,
      transactionHash,
      gasUsed
    } = body

    // Validate required fields
    if (!tokenId || !walletAddress || !contentHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if content hash already exists
    const existingCapsule = await db
      .select()
      .from(capsules)
      .where(eq(capsules.contentHash, contentHash))
      .limit(1)

    if (existingCapsule.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Content hash already exists' },
        { status: 409 }
      )
    }

    // Create the capsule
    const [newCapsule] = await db
      .insert(capsules)
      .values({
        tokenId,
        walletAddress,
        contentHash,
        description,
        location,
        ipfsHash,
        isPublic: isPublic || false,
        blockNumber,
        transactionHash,
        gasUsed
      })
      .returning()

    // Create or update user if not exists
    await db
      .insert(users)
      .values({
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoNothing()

    // Update user stats
    await updateUserStats(walletAddress)

    return NextResponse.json({
      success: true,
      data: newCapsule
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating capsule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create capsule' },
      { status: 500 }
    )
  }
}

// Helper function to update user stats
async function updateUserStats(walletAddress: string) {
  try {
    // Get user's capsule counts
    const userCapsules = await db
      .select()
      .from(capsules)
      .where(eq(capsules.walletAddress, walletAddress))

    const totalCapsules = userCapsules.length
    const publicCapsules = userCapsules.filter((c: any) => c.isPublic).length
    const privateCapsules = totalCapsules - publicCapsules

    const firstCapsule = userCapsules[0]
    const lastCapsule = userCapsules[userCapsules.length - 1]

    // Upsert user stats
    await db
      .insert(userStats)
      .values({
        walletAddress,
        totalCapsules,
        publicCapsules,
        privateCapsules,
        firstCapsuleAt: firstCapsule?.createdAt,
        lastCapsuleAt: lastCapsule?.createdAt,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: userStats.walletAddress,
        set: {
          totalCapsules,
          publicCapsules,
          privateCapsules,
          firstCapsuleAt: firstCapsule?.createdAt,
          lastCapsuleAt: lastCapsule?.createdAt,
          updatedAt: new Date()
        }
      })
  } catch (error) {
    console.error('Error updating user stats:', error)
  }
} 
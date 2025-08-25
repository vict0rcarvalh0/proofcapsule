import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, users, userStats } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

const READONLY = process.env.API_READONLY === 'true'

// GET /api/capsules - Get all capsules (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (READONLY) {
      return NextResponse.json({ success: true, data: [] })
    }

    let query = (db as any).select().from(capsules).orderBy(desc(capsules.createdAt)).limit(limit)

    if (wallet) {
      query = (db as any).select().from(capsules).where(eq(capsules.walletAddress, wallet)).orderBy(desc(capsules.createdAt)).limit(limit)
    }

    const rows = await query

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching capsules:', error)
    if (READONLY) {
      return NextResponse.json({ success: true, data: [] })
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch capsules' }, { status: 500 })
  }
}

// POST /api/capsules - Create a new capsule
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🚀 Starting capsule creation...')
  
  try {
    const body = await request.json()
    console.log('📝 Request body received:', { tokenId: body.tokenId, walletAddress: body.walletAddress })

    if (READONLY) {
      // In readonly mode, accept but do not persist
      return NextResponse.json({ success: true, data: { ...body, id: 0 } }, { status: 201 })
    }

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

    console.log('🔍 Checking for existing content hash...')
    // Check if content hash already exists
    const existingCapsule = await (db as any)
      .select()
      .from(capsules)
      .where(eq(capsules.contentHash, contentHash))
      .limit(1)

    if (existingCapsule.length > 0) {
      console.log('❌ Content hash already exists')
      return NextResponse.json(
        { success: false, error: 'Content hash already exists' },
        { status: 409 }
      )
    }

    console.log('💾 Creating capsule in database...')
    // Create the capsule (main operation)
    const [newCapsule] = await (db as any)
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

    console.log('✅ Capsule created successfully:', { id: newCapsule.id, tokenId: newCapsule.tokenId })
    console.log('⏱️ Main operation completed in:', Date.now() - startTime, 'ms')

    // Fire and forget secondary operations
    console.log('🔄 Starting secondary operations...')
    Promise.allSettled([
      // Create or update user if not exists
      (async () => {
        try {
          console.log('👤 Creating/updating user...')
          await (db as any)
            .insert(users)
            .values({
              walletAddress,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .onConflictDoNothing()
          console.log('✅ User operation completed')
        } catch (error) {
          console.error('❌ Error creating user:', error)
        }
      })(),
      
      // Update user stats
      (async () => {
        try {
          console.log('📊 Updating user stats...')
          await updateUserStatsOptimized(walletAddress)
          console.log('✅ User stats updated')
        } catch (error) {
          console.error('❌ Error updating user stats:', error)
        }
      })()
    ]).then((results) => {
      console.log('🏁 Secondary operations completed')
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Secondary operation ${index} failed:`, result.reason)
        }
      })
    })

    const totalTime = Date.now() - startTime
    console.log('🎉 Capsule creation completed in:', totalTime, 'ms')

    return NextResponse.json({ success: true, data: newCapsule }, { status: 201 })
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('❌ Error creating capsule after', totalTime, 'ms:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create capsule' },
      { status: 500 }
    )
  }
}

// Optimized helper function to update user stats
async function updateUserStatsOptimized(walletAddress: string) {
  try {
    console.log('📈 Calculating user stats for:', walletAddress)
    // Use a single query to get all necessary stats
    const statsQuery = await (db as any)
      .select({
        totalCapsules: sql`count(*)`,
        publicCapsules: sql`count(*) filter (where ${capsules.isPublic} = true)`,
        firstCapsuleAt: sql`min(${capsules.createdAt})`,
        lastCapsuleAt: sql`max(${capsules.createdAt})`
      })
      .from(capsules)
      .where(eq(capsules.walletAddress, walletAddress))

    const stats = statsQuery[0]
    const privateCapsules = Number(stats.totalCapsules) - Number(stats.publicCapsules)

    const statsData = {
      walletAddress,
      totalCapsules: Number(stats.totalCapsules),
      publicCapsules: Number(stats.publicCapsules),
      privateCapsules,
      firstCapsuleAt: stats.firstCapsuleAt,
      lastCapsuleAt: stats.lastCapsuleAt,
      updatedAt: new Date()
    }

    console.log('📊 Stats calculated:', statsData)

    // Use upsert to handle both insert and update
    await (db as any)
      .insert(userStats)
      .values(statsData)
      .onConflictDoUpdate({
        target: userStats.walletAddress,
        set: {
          totalCapsules: statsData.totalCapsules,
          publicCapsules: statsData.publicCapsules,
          privateCapsules: statsData.privateCapsules,
          firstCapsuleAt: statsData.firstCapsuleAt,
          lastCapsuleAt: statsData.lastCapsuleAt,
          updatedAt: statsData.updatedAt
        }
      })

    console.log('✅ User stats updated successfully')
  } catch (error) {
    console.error('❌ Error updating user stats:', error)
    throw error
  }
} 
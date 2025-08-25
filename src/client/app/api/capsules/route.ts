import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, users, userStats } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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
  
  try {
    console.log('Starting capsule creation...')
    const body = await request.json()

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

    console.log('Checking for existing capsule...')
    // Check if content hash already exists
    const existingCapsule = await (db as any)
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

    console.log('Creating new capsule...')
    // Create the capsule
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

    console.log('Creating/updating user...')
    // Create or update user if not exists
    await (db as any)
      .insert(users)
      .values({
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoNothing()

    console.log('Updating user stats...')
    // Update user stats
    await updateUserStats(walletAddress)

    const endTime = Date.now()
    console.log(`Capsule creation completed in ${endTime - startTime}ms`)

    return NextResponse.json({ success: true, data: newCapsule }, { status: 201 })
  } catch (error) {
    const endTime = Date.now()
    console.error(`Error creating capsule after ${endTime - startTime}ms:`, error)
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    return NextResponse.json(
      { success: false, error: `Failed to create capsule: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// Helper function to update user stats
async function updateUserStats(walletAddress: string) {
  try {
    console.log('Fetching user capsules for stats...')
    const userCapsules = await (db as any)
      .select()
      .from(capsules)
      .where(eq(capsules.walletAddress, walletAddress))

    const totalCapsules = userCapsules.length
    const publicCapsules = userCapsules.filter((c: any) => c.isPublic).length
    const privateCapsules = totalCapsules - publicCapsules

    // Sort by creation date to get first and last
    const sortedCapsules = userCapsules.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    const firstCapsule = sortedCapsules[0]
    const lastCapsule = sortedCapsules[sortedCapsules.length - 1]

    console.log('Checking existing user stats...')
    // Check if user stats already exist
    const existingStats = await (db as any)
      .select()
      .from(userStats)
      .where(eq(userStats.walletAddress, walletAddress))
      .limit(1)

    const statsData = {
      walletAddress,
      totalCapsules,
      publicCapsules,
      privateCapsules,
      firstCapsuleAt: firstCapsule?.createdAt || null,
      lastCapsuleAt: lastCapsule?.createdAt || null,
      updatedAt: new Date()
    }

    if (existingStats.length > 0) {
      console.log('Updating existing user stats...')
      // Update existing stats
      await (db as any)
        .update(userStats)
        .set(statsData)
        .where(eq(userStats.walletAddress, walletAddress))
    } else {
      console.log('Creating new user stats...')
      // Insert new stats
      await (db as any)
        .insert(userStats)
        .values(statsData)
    }
    
    console.log('User stats updated successfully')
  } catch (error) {
    console.error('Error updating user stats:', error)
    // Don't throw here - stats update failure shouldn't break capsule creation
  }
} 
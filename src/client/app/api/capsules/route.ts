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
    console.log('Starting capsule creation...', {
      readonly: READONLY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      environment: process.env.NODE_ENV
    })
    
    const body = await request.json()

    if (READONLY) {
      console.log('API in readonly mode - accepting but not persisting')
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

    console.log('Validating input data...', {
      tokenId,
      walletAddress: walletAddress?.slice(0, 10) + '...',
      contentHash: contentHash?.slice(0, 10) + '...',
      hasDescription: !!description,
      hasLocation: !!location,
      hasIpfsHash: !!ipfsHash
    })

    // Validate required fields
    if (!tokenId || !walletAddress || !contentHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tokenId, walletAddress, contentHash' },
        { status: 400 }
      )
    }

    console.log('Checking for existing capsule...')
    // Check if content hash already exists
    const existingCapsule = await (db as any)
      .select()
      .from(capsules)
      .where(eq(capsules.contentHash, contentHash))
      .limit(1)

    if (existingCapsule.length > 0) {
      console.log('Content hash already exists:', contentHash.slice(0, 10) + '...')
      return NextResponse.json(
        { success: false, error: 'Content hash already exists' },
        { status: 409 }
      )
    }

    console.log('Creating new capsule...')
    // Create the capsule with timeout handling
    const capsuleData = {
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
    }

    console.log('Inserting capsule data...')
    const [newCapsule] = await (db as any)
      .insert(capsules)
      .values(capsuleData)
      .returning()

    console.log('Capsule created successfully, ID:', newCapsule.id)

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
    // Update user stats (don't let this fail the main operation)
    try {
      await updateUserStats(walletAddress)
    } catch (statsError) {
      console.warn('User stats update failed, but continuing:', statsError)
    }

    const endTime = Date.now()
    console.log(`Capsule creation completed successfully in ${endTime - startTime}ms`)

    return NextResponse.json({ success: true, data: newCapsule }, { status: 201 })
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.error(`Error creating capsule after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      readonly: READONLY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      environment: process.env.NODE_ENV
    })
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    
    // Check for common database errors
    if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { success: false, error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      )
    }
    
    if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      return NextResponse.json(
        { success: false, error: 'Capsule already exists with this content hash' },
        { status: 409 }
      )
    }
    
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
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, users, userStats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Test frontend simulation starting...')
    
    // Parse the request body exactly like the frontend would send it
    const body = await request.json()
    console.log('Received request body:', {
      tokenId: body.tokenId,
      walletAddress: body.walletAddress?.slice(0, 10) + '...',
      contentHash: body.contentHash?.slice(0, 10) + '...',
      hasDescription: !!body.description,
      hasLocation: !!body.location,
      hasIpfsHash: !!body.ipfsHash,
      isPublic: body.isPublic,
      blockNumber: body.blockNumber,
      transactionHash: body.transactionHash?.slice(0, 10) + '...',
      gasUsed: body.gasUsed
    })

    // Validate required fields (same as the real API)
    if (!body.tokenId || !body.walletAddress || !body.contentHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tokenId, walletAddress, contentHash' },
        { status: 400 }
      )
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

    console.log('Step 1: Checking for existing capsule...')
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

    console.log('Step 2: Creating new capsule...')
    // Create the capsule with the exact same data structure
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

    console.log('Step 3: Inserting capsule data...')
    const [newCapsule] = await (db as any)
      .insert(capsules)
      .values(capsuleData)
      .returning()

    console.log('Capsule created successfully, ID:', newCapsule.id)

    console.log('Step 4: Creating/updating user...')
    // Create or update user if not exists
    await (db as any)
      .insert(users)
      .values({
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoNothing()

    console.log('Step 5: Updating user stats...')
    // Update user stats (don't let this fail the main operation)
    try {
      const userCapsules = await (db as any)
        .select()
        .from(capsules)
        .where(eq(capsules.walletAddress, walletAddress))

      const totalCapsules = userCapsules.length
      const publicCapsules = userCapsules.filter((c: any) => c.isPublic).length
      const privateCapsules = totalCapsules - publicCapsules

      const statsData = {
        walletAddress,
        totalCapsules,
        publicCapsules,
        privateCapsules,
        firstCapsuleAt: userCapsules[0]?.createdAt || null,
        lastCapsuleAt: userCapsules[userCapsules.length - 1]?.createdAt || null,
        updatedAt: new Date()
      }

      await (db as any)
        .insert(userStats)
        .values(statsData)
        .onConflictDoUpdate({
          target: userStats.walletAddress,
          set: statsData
        })

      console.log('User stats updated successfully')
    } catch (statsError) {
      console.warn('User stats update failed, but continuing:', statsError)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`Frontend simulation completed successfully in ${duration}ms`)

    return NextResponse.json({ success: true, data: newCapsule }, { status: 201 })

  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.error(`Frontend simulation failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
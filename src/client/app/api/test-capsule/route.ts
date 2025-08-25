import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, users, userStats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Test capsule creation starting...')
    
    // Simulate the exact data that would be sent from the frontend
    const testData = {
      tokenId: Date.now(), // Use timestamp to ensure uniqueness
      walletAddress: '0x1234567890123456789012345678901234567890',
      contentHash: `0x${Date.now().toString(16).padStart(64, '0')}`, // Generate unique hash
      description: 'Test capsule from debug endpoint',
      location: 'Test location',
      ipfsHash: 'test-ipfs-hash',
      isPublic: true,
      blockNumber: 12345,
      transactionHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
      gasUsed: 100000
    }

    console.log('Test data prepared:', {
      tokenId: testData.tokenId,
      walletAddress: testData.walletAddress.slice(0, 10) + '...',
      contentHash: testData.contentHash.slice(0, 10) + '...'
    })

    // Step 1: Check for existing capsule
    console.log('Step 1: Checking for existing capsule...')
    const existingCapsule = await (db as any)
      .select()
      .from(capsules)
      .where(eq(capsules.contentHash, testData.contentHash))
      .limit(1)

    if (existingCapsule.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Test capsule already exists',
        step: 'existing_check'
      }, { status: 409 })
    }

    // Step 2: Insert capsule
    console.log('Step 2: Inserting capsule...')
    const [newCapsule] = await (db as any)
      .insert(capsules)
      .values(testData)
      .returning()

    console.log('Capsule inserted successfully, ID:', newCapsule.id)

    // Step 3: Create/update user
    console.log('Step 3: Creating/updating user...')
    await (db as any)
      .insert(users)
      .values({
        walletAddress: testData.walletAddress,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoNothing()

    // Step 4: Update user stats
    console.log('Step 4: Updating user stats...')
    try {
      const userCapsules = await (db as any)
        .select()
        .from(capsules)
        .where(eq(capsules.walletAddress, testData.walletAddress))

      const totalCapsules = userCapsules.length
      const publicCapsules = userCapsules.filter((c: any) => c.isPublic).length
      const privateCapsules = totalCapsules - publicCapsules

      const statsData = {
        walletAddress: testData.walletAddress,
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
      console.warn('User stats update failed:', statsError)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`Test capsule creation completed successfully in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: {
        capsule: newCapsule,
        duration: `${duration}ms`,
        steps: ['existing_check', 'insert_capsule', 'create_user', 'update_stats']
      }
    }, { status: 201 })

  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.error(`Test capsule creation failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    }, { status: 500 })
  }
} 
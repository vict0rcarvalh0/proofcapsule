import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, users, userStats } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envInfo = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      API_READONLY: process.env.API_READONLY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }

    // Test database connection and schema
    let dbTest = 'Not tested'
    let tableTest = 'Not tested'
    let insertTest = 'Not tested'
    
    try {
      // Test 1: Basic connection using proper Drizzle syntax
      const result = await (db as any).select().from(capsules).limit(1)
      dbTest = 'Connected successfully'
      
      // Test 2: Check if tables exist
      try {
        const capsuleCount = await (db as any).select().from(capsules).limit(1)
        tableTest = 'Tables exist and accessible'
      } catch (tableError) {
        tableTest = `Table error: ${tableError instanceof Error ? tableError.message : 'Unknown error'}`
      }
      
      // Test 3: Try a simple insert (will be rolled back)
      try {
        const testData = {
          tokenId: 999999, // Use a high number to avoid conflicts
          walletAddress: '0x0000000000000000000000000000000000000000',
          contentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          description: 'Test capsule for debugging',
          location: 'Test location',
          ipfsHash: 'test-ipfs-hash',
          isPublic: false,
          blockNumber: 0,
          transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          gasUsed: 0
        }
        
        const [inserted] = await (db as any)
          .insert(capsules)
          .values(testData)
          .returning()
        
        // Clean up the test data
        await (db as any)
          .delete(capsules)
          .where((db as any).eq(capsules.id, inserted.id))
        
        insertTest = 'Insert/delete operations work'
      } catch (insertError) {
        insertTest = `Insert error: ${insertError instanceof Error ? insertError.message : 'Unknown error'}`
      }
      
    } catch (dbError) {
      dbTest = `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    }

    return NextResponse.json({
      success: true,
      data: {
        environment: envInfo,
        database: dbTest,
        tables: tableTest,
        insertTest: insertTest,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
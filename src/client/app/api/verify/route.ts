import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, verifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// POST /api/verify - Verify content hash
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentHash, verifierAddress, verificationMethod = 'hash_match', notes } = body

    if (!contentHash || !verifierAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the capsule by content hash
    const [capsule] = await db
      .select()
      .from(capsules)
      .where(eq(capsules.contentHash, contentHash))
      .limit(1)

    if (!capsule) {
      return NextResponse.json(
        { success: false, error: 'Content hash not found' },
        { status: 404 }
      )
    }

    // Create verification record
    const [verification] = await db
      .insert(verifications)
      .values({
        capsuleId: capsule.id,
        verifierAddress,
        verificationMethod,
        notes
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: {
        verification,
        capsule: {
          id: capsule.id,
          tokenId: capsule.tokenId,
          description: capsule.description,
          createdAt: capsule.createdAt
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating verification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create verification' },
      { status: 500 }
    )
  }
}

// GET /api/verify - Get verification history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const capsuleId = searchParams.get('capsuleId')
    const verifierAddress = searchParams.get('verifier')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = db
      .select({
        verification: verifications,
        capsule: {
          id: capsules.id,
          tokenId: capsules.tokenId,
          description: capsules.description,
          contentHash: capsules.contentHash
        }
      })
      .from(verifications)
      .innerJoin(capsules, eq(verifications.capsuleId, capsules.id))

    // Apply filters
    if (capsuleId) {
      query = query.where(eq(verifications.capsuleId, parseInt(capsuleId)))
    }

    if (verifierAddress) {
      query = query.where(eq(verifications.verifierAddress, verifierAddress))
    }

    const results = await query
      .orderBy(verifications.verifiedAt)
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
    console.error('Error fetching verifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}

// Utility function to hash content (can be used by frontend)
export function hashContent(content: string | Buffer): string {
  return '0x' + crypto.createHash('sha256').update(content).digest('hex')
} 
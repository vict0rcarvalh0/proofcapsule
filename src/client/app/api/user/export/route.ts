import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, verifications, users, userStats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get all user data
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1)

    const userCapsules = await db
      .select()
      .from(capsules)
      .where(eq(capsules.walletAddress, walletAddress))

    const userVerifications = await db
      .select()
      .from(verifications)
      .where(eq(verifications.verifierAddress, walletAddress))

    const userAnalytics = await db
      .select()
      .from(userStats)
      .where(eq(userStats.walletAddress, walletAddress))
      .limit(1)

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      walletAddress,
      user: userData[0] || null,
      capsules: userCapsules,
      verifications: userVerifications,
      analytics: userAnalytics[0] || null,
      summary: {
        totalCapsules: userCapsules.length,
        totalVerifications: userVerifications.length,
        firstCapsule: userCapsules.length > 0 ? userCapsules[userCapsules.length - 1]?.createdAt : null,
        lastCapsule: userCapsules.length > 0 ? userCapsules[0]?.createdAt : null
      }
    }

    return NextResponse.json({
      success: true,
      data: exportData
    })

  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export user data' },
      { status: 500 }
    )
  }
} 
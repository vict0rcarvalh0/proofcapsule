import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { analytics, userStats, capsules, users } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

// GET /api/analytics - Get platform analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    const walletAddress = searchParams.get('wallet')

    if (type === 'user' && !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required for user analytics' },
        { status: 400 }
      )
    }

    if (type === 'user') {
      // Get user-specific analytics
      const [userStat] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.walletAddress, walletAddress!))
        .limit(1)

      if (!userStat) {
        return NextResponse.json({
          success: true,
          data: {
            totalCapsules: 0,
            publicCapsules: 0,
            privateCapsules: 0,
            totalVerifications: 0,
            firstCapsuleAt: null,
            lastCapsuleAt: null
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: userStat
      })
    }

    // Get global analytics
    const [
      totalCapsules,
      totalUsers,
      totalVerifications,
      todayCapsules,
      todayUsers
    ] = await Promise.all([
      // Total capsules
      db.select({ count: sql<number>`count(*)` }).from(capsules),
      // Total users
      db.select({ count: sql<number>`count(*)` }).from(users),
      // Total verifications
      db.select({ count: sql<number>`count(*)` }).from(analytics),
      // Today's capsules
      db.select({ count: sql<number>`count(*)` })
        .from(capsules)
        .where(sql`date(created_at) = date('now')`),
      // Today's users
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`date(created_at) = date('now')`)
    ])

    const globalStats = {
      totalCapsules: totalCapsules[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalVerifications: totalVerifications[0]?.count || 0,
      todayCapsules: todayCapsules[0]?.count || 0,
      todayUsers: todayUsers[0]?.count || 0
    }

    return NextResponse.json({
      success: true,
      data: globalStats
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// POST /api/analytics - Update daily analytics (called by cron job)
export async function POST(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Get today's stats
    const [
      totalCapsules,
      totalUsers,
      newCapsules,
      newUsers,
      totalVerifications
    ] = await Promise.all([
      // Total capsules
      db.select({ count: sql<number>`count(*)` }).from(capsules),
      // Total users
      db.select({ count: sql<number>`count(*)` }).from(users),
      // New capsules today
      db.select({ count: sql<number>`count(*)` })
        .from(capsules)
        .where(sql`date(created_at) = date('now')`),
      // New users today
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`date(created_at) = date('now')`),
      // Total verifications
      db.select({ count: sql<number>`count(*)` }).from(analytics)
    ])

    // Upsert today's analytics
    await db
      .insert(analytics)
      .values({
        date: today,
        totalCapsules: totalCapsules[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        newCapsules: newCapsules[0]?.count || 0,
        newUsers: newUsers[0]?.count || 0,
        totalVerifications: totalVerifications[0]?.count || 0
      })
      .onConflictDoUpdate({
        target: analytics.date,
        set: {
          totalCapsules: totalCapsules[0]?.count || 0,
          totalUsers: totalUsers[0]?.count || 0,
          newCapsules: newCapsules[0]?.count || 0,
          newUsers: newUsers[0]?.count || 0,
          totalVerifications: totalVerifications[0]?.count || 0,
          createdAt: new Date()
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully'
    })
  } catch (error) {
    console.error('Error updating analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update analytics' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { analytics, userStats, capsules, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

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
      const [userStat] = await (db as any)
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
      (db as any).select({ count: sql<number>`count(*)` }).from(capsules),
      // Total users
      (db as any).select({ count: sql<number>`count(*)` }).from(users),
      // Total verifications
      (db as any).select({ count: sql<number>`count(*)` }).from(analytics),
      // Today's capsules
      (db as any).select({ count: sql<number>`count(*)` })
        .from(capsules)
        .where(sql`date(created_at) = date('now')`),
      // Today's users
      (db as any).select({ count: sql<number>`count(*)` })
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
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Get today's stats
    const [
      totalCapsules,
      totalUsers,
      totalVerifications
    ] = await Promise.all([
      (db as any).select({ count: sql<number>`count(*)` }).from(capsules),
      (db as any).select({ count: sql<number>`count(*)` }).from(users),
      (db as any).select({ count: sql<number>`count(*)` }).from(analytics)
    ])

    // Get new stats for today
    const [
      newCapsules,
      newUsers
    ] = await Promise.all([
      (db as any).select({ count: sql<number>`count(*)` })
        .from(capsules)
        .where(sql`date(created_at) = date('now')`),
      (db as any).select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`date(created_at) = date('now')`)
    ])

    // Insert or update today's analytics
    await (db as any)
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
          totalVerifications: totalVerifications[0]?.count || 0
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
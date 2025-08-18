import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules, verifications, users, userStats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Delete all capsules for this wallet address
    await db.delete(capsules).where(eq(capsules.walletAddress, walletAddress))

    // Delete all verifications by this wallet address
    await db.delete(verifications).where(eq(verifications.verifierAddress, walletAddress))

    // Delete user stats
    await db.delete(userStats).where(eq(userStats.walletAddress, walletAddress))

    // Delete user record
    await db.delete(users).where(eq(users.walletAddress, walletAddress))

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }
} 
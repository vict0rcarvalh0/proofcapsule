import { db } from './server'
import { capsules, users, userStats, verifications } from './schema'
import { eq, and, desc } from 'drizzle-orm'
import crypto from 'crypto'

// Content hashing utilities
export function hashContent(content: string | Buffer): string {
  return '0x' + crypto.createHash('sha256').update(content).digest('hex')
}

export function hashFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const hash = '0x' + crypto.createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex')
        resolve(hash)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Database utility functions
export async function getUserByWallet(walletAddress: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, walletAddress))
    .limit(1)
  
  return user
}

export async function getCapsuleByHash(contentHash: string) {
  const [capsule] = await db
    .select()
    .from(capsules)
    .where(eq(capsules.contentHash, contentHash))
    .limit(1)
  
  return capsule
}

export async function getUserCapsules(walletAddress: string, limit = 20, offset = 0) {
  return await db
    .select()
    .from(capsules)
    .where(eq(capsules.walletAddress, walletAddress))
    .orderBy(desc(capsules.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getPublicCapsules(limit = 20, offset = 0) {
  return await db
    .select()
    .from(capsules)
    .where(eq(capsules.isPublic, true))
    .orderBy(desc(capsules.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getCapsuleVerifications(capsuleId: number) {
  return await db
    .select()
    .from(verifications)
    .where(eq(verifications.capsuleId, capsuleId))
    .orderBy(desc(verifications.verifiedAt))
}

export async function getUserStats(walletAddress: string) {
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.walletAddress, walletAddress))
    .limit(1)
  
  return stats
}

// Search utilities
export async function searchCapsules(query: string, limit = 20, offset = 0) {
  return await db
    .select()
    .from(capsules)
    .where(
      and(
        eq(capsules.isPublic, true),
        // Note: SQLite doesn't have built-in full-text search
        // This is a simple LIKE search - consider using FTS5 for better search
        // sql`description LIKE ${`%${query}%`} OR location LIKE ${`%${query}%`}`
      )
    )
    .orderBy(desc(capsules.createdAt))
    .limit(limit)
    .offset(offset)
}

// Analytics utilities
export async function getGlobalStats() {
  const [totalCapsules] = await db.select({ count: db.fn.count() }).from(capsules)
  const [totalUsers] = await db.select({ count: db.fn.count() }).from(users)
  const [totalVerifications] = await db.select({ count: db.fn.count() }).from(verifications)
  
  return {
    totalCapsules: totalCapsules?.count || 0,
    totalUsers: totalUsers?.count || 0,
    totalVerifications: totalVerifications?.count || 0
  }
}

// Validation utilities
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidContentHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

// Error handling utilities
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export function handleDatabaseError(error: any): never {
  console.error('Database error:', error)
  
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    throw new DatabaseError('Record already exists', 'DUPLICATE')
  }
  
  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    throw new DatabaseError('Referenced record not found', 'FOREIGN_KEY')
  }
  
  throw new DatabaseError('Database operation failed', 'UNKNOWN')
} 
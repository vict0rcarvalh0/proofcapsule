import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

// Users table - stores wallet addresses and user profiles
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').notNull().unique(),
  username: text('username'),
  email: text('email'),
  avatar: text('avatar'), // IPFS hash or URL
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Capsules table - stores ProofCapsule data
export const capsules = sqliteTable('capsules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tokenId: integer('token_id').notNull().unique(), // NFT token ID from blockchain
  walletAddress: text('wallet_address').notNull(), // Creator's wallet
  contentHash: text('content_hash').notNull().unique(), // SHA256 hash of content
  description: text('description'),
  location: text('location'),
  ipfsHash: text('ipfs_hash'), // IPFS hash if content was uploaded
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  // Blockchain data
  blockNumber: integer('block_number'),
  transactionHash: text('transaction_hash'),
  gasUsed: integer('gas_used'),
})

// Verifications table - stores content verification records
export const verifications = sqliteTable('verifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  capsuleId: integer('capsule_id').notNull().references(() => capsules.id),
  verifierAddress: text('verifier_address').notNull(), // Wallet that verified
  verifiedAt: integer('verified_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  verificationMethod: text('verification_method').notNull(), // 'hash_match', 'manual', etc.
  notes: text('notes'),
})

// Analytics table - stores usage statistics
export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // YYYY-MM-DD format
  totalCapsules: integer('total_capsules').notNull().default(0),
  totalUsers: integer('total_users').notNull().default(0),
  newCapsules: integer('new_capsules').notNull().default(0),
  newUsers: integer('new_users').notNull().default(0),
  totalVerifications: integer('total_verifications').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// User stats table - stores per-user statistics
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').notNull().unique(),
  totalCapsules: integer('total_capsules').notNull().default(0),
  publicCapsules: integer('public_capsules').notNull().default(0),
  privateCapsules: integer('private_capsules').notNull().default(0),
  totalVerifications: integer('total_verifications').notNull().default(0),
  firstCapsuleAt: integer('first_capsule_at', { mode: 'timestamp' }),
  lastCapsuleAt: integer('last_capsule_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Content metadata table - stores additional content information
export const contentMetadata = sqliteTable('content_metadata', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  capsuleId: integer('capsule_id').notNull().unique().references(() => capsules.id),
  contentType: text('content_type'), // 'image', 'video', 'document', etc.
  fileSize: integer('file_size'), // in bytes
  dimensions: text('dimensions'), // "1920x1080" for images/videos
  duration: integer('duration'), // in seconds for videos
  tags: text('tags'), // JSON array of tags
  customFields: text('custom_fields'), // JSON object for additional metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Export types for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Capsule = typeof capsules.$inferSelect
export type NewCapsule = typeof capsules.$inferInsert
export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
export type Analytics = typeof analytics.$inferSelect
export type NewAnalytics = typeof analytics.$inferInsert
export type UserStats = typeof userStats.$inferSelect
export type NewUserStats = typeof userStats.$inferInsert
export type ContentMetadata = typeof contentMetadata.$inferSelect
export type NewContentMetadata = typeof contentMetadata.$inferInsert 
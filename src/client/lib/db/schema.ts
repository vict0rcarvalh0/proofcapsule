import { pgTable, text, integer, boolean, timestamp, serial, bigint } from 'drizzle-orm/pg-core'

// Users table - stores wallet addresses and user profiles
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  walletAddress: text('wallet_address').notNull().unique(),
  username: text('username'),
  email: text('email'),
  avatar: text('avatar'), // IPFS hash or URL
  bio: text('bio'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Capsules table - stores ProofCapsule data
export const capsules = pgTable('capsules', {
  id: serial('id').primaryKey(),
  tokenId: bigint('token_id', { mode: 'number' }).notNull().unique(), // NFT token ID from blockchain
  walletAddress: text('wallet_address').notNull(), // Creator's wallet
  contentHash: text('content_hash').notNull().unique(), // SHA256 hash of content
  description: text('description'),
  location: text('location'),
  ipfsHash: text('ipfs_hash'), // IPFS hash if content was uploaded
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // Blockchain data
  blockNumber: integer('block_number'),
  transactionHash: text('transaction_hash'),
  gasUsed: integer('gas_used'),
})

// Verifications table - stores content verification records
export const verifications = pgTable('verifications', {
  id: serial('id').primaryKey(),
  capsuleId: integer('capsule_id').notNull().references(() => capsules.id),
  verifierAddress: text('verifier_address').notNull(), // Wallet that verified
  verifiedAt: timestamp('verified_at').notNull().defaultNow(),
  verificationMethod: text('verification_method').notNull(), // 'hash_match', 'manual', etc.
  notes: text('notes'),
})

// Analytics table - stores usage statistics
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD format
  totalCapsules: integer('total_capsules').notNull().default(0),
  totalUsers: integer('total_users').notNull().default(0),
  newCapsules: integer('new_capsules').notNull().default(0),
  newUsers: integer('new_users').notNull().default(0),
  totalVerifications: integer('total_verifications').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// User stats table - stores per-user statistics
export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  walletAddress: text('wallet_address').notNull().unique(),
  totalCapsules: integer('total_capsules').notNull().default(0),
  publicCapsules: integer('public_capsules').notNull().default(0),
  privateCapsules: integer('private_capsules').notNull().default(0),
  totalVerifications: integer('total_verifications').notNull().default(0),
  firstCapsuleAt: timestamp('first_capsule_at'),
  lastCapsuleAt: timestamp('last_capsule_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Content metadata table - stores additional content information
export const contentMetadata = pgTable('content_metadata', {
  id: serial('id').primaryKey(),
  capsuleId: integer('capsule_id').notNull().unique().references(() => capsules.id),
  contentType: text('content_type'), // 'image', 'video', 'document', etc.
  fileSize: integer('file_size'), // in bytes
  dimensions: text('dimensions'), // "1920x1080" for images/videos
  duration: integer('duration'), // in seconds for videos
  tags: text('tags'), // JSON array of tags
  customFields: text('custom_fields'), // JSON object for additional metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
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
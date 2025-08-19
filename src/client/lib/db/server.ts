// Server-only database configuration
// This file should only be imported in API routes and server components

import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { sql } from 'drizzle-orm'
import Database from 'better-sqlite3'
import { neon } from '@neondatabase/serverless'

import * as schema from './schema'

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production'

let db: any

if (isProduction) {
  // Use Neon Postgres in production
  const sql = neon(process.env.DATABASE_URL!)
  db = drizzleNeon(sql, { schema })
} else {
  // Use SQLite in development
  const sqlite = new Database('proofcapsule.db')
  db = drizzle(sqlite, { schema })
}

export { db }
export * from './schema' 
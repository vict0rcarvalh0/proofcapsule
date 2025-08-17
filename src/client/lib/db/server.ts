// Server-only database configuration
// This file should only be imported in API routes and server components

import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/vercel-postgres'
import { sql } from 'drizzle-orm'
import Database from 'better-sqlite3'
import { sql as postgresSql } from '@vercel/postgres'

import * as schema from './schema'

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production'

let db: any

if (isProduction) {
  // Use Vercel Postgres in production
  db = drizzlePostgres(postgresSql, { schema })
} else {
  // Use SQLite in development
  const sqlite = new Database('proofcapsule.db')
  db = drizzle(sqlite, { schema })
}

export { db }
export * from './schema' 
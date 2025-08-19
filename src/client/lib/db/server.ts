// Server-only database configuration
// This file should only be imported in API routes and server components

import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import { neon } from '@neondatabase/serverless'
import postgres from 'postgres'

import * as schema from './schema'

const url = process.env.DATABASE_URL
let db: ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>

if (url) {
  if (/neon\.tech/.test(url)) {
    // Neon database
    const sql = neon(url)
    db = drizzleNeon(sql, { schema })
  } else {
    // Local Postgres via postgres-js
    const client = postgres(url, { ssl: false })
    db = drizzlePg(client, { schema })
  }
} else {
  // Fallback to SQLite
  const sqlite = new Database('proofcapsule.db')
  db = drizzleSqlite(sqlite, { schema })
}

export { db }
export * from './schema' 
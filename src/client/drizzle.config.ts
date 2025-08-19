import type { Config } from 'drizzle-kit'

const url = process.env.DATABASE_URL

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: url ? 'postgresql' : 'sqlite',
  dbCredentials: url ? {
    url: url,
  } : {
    url: 'proofcapsule.db',
  },
} satisfies Config 
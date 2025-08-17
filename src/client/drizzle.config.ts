import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'proofcapsule.db',
  },
} satisfies Config 
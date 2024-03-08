import type { Config } from "drizzle-kit";
export default {
  schema: "./drizzle/schema.server.ts",
  out: "./drizzle",
driver: 'pg',
  dbCredentials: {
    connectionString:  "postgres://postgres.pfkacnklwmceuuqfcoog:gtkWDwfsbm77C1Ng@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  }
} satisfies Config;



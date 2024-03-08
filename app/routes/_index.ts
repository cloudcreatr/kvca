import { json, type MetaFunction } from "@remix-run/cloudflare";

import { articles } from "drizzle/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const connectionString = "postgres://postgres.pfkacnklwmceuuqfcoog:gtkWDwfsbm77C1Ng@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
const client = postgres(
  connectionString,
  {
    prepare: false,
  }
  
);
export const db = drizzle(client);
export async function loader() {
 
    const data = await db.select().from(articles);
     return json({ om: data[0] } );
 
}

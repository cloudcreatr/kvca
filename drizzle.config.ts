import type { Config } from "drizzle-kit";
import { getPlatformProxy } from "wrangler";
import type { Env } from "worker-configuration";

async function dbCredentials() {
  const { env } = await getPlatformProxy<Env>();
  const db = env.DB;
  console.log("poatgress url", db);
  return db;
}

async function getConfig(): Promise<Config> {
  return {
    schema: "./drizzle/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
      connectionString: await dbCredentials(),
    },
  };
}

export default getConfig();

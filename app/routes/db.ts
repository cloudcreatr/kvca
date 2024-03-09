import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { articles } from "drizzle/schema";


import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export async function loader({ context }: LoaderFunctionArgs) {
    const connectionString = context.cloudflare.env.DB_URL;
    

    const client = postgres(
      connectionString,
      {
          prepare: false
      }
    );
    const db = drizzle(client);
    const data = await db.select().from(articles);
 return json(data);
}

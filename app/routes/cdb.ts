import { ActionFunctionArgs, AppLoadContext, LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { articles } from "drizzle/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
function getDB(context: AppLoadContext) {
  const connectionString = context.cloudflare.env.DB_URL;
  const client = postgres(connectionString, {
    prepare: false,
  });
  return drizzle(client);   
}

interface InsertPayload {
  type: "INSERT"  | "UPDATE" | "DELETE";
  table: "article";
  schema: string;
  record: typeof articles
  old_record: null;
}



export async function loader({ context }: LoaderFunctionArgs) {
  const kv = context.cloudflare.env.kvcache;
   const start = performance.now();
  const data = await kv.get("articles", { type: "json", cacheTtl: 500 });
  const end = performance.now();
  const time = end - start;
    if (data) {
      return json(data, {
        headers: {
          "X-KV-Cache": "HIT",
          "X-KV-Cache-Time": `${time}ms`,
        },
        });
    }
  const db = getDB(context);
  const start2 = performance.now();
  const data2 = await db.select().from(articles);
  const end2 = performance.now();
  const time2 = end2 - start2;
  return json(data2, {
    headers: {
      "X-KV-Cache": "MISS",
      "X-KV-Cache-Time": `${time2}ms`,
    },
    });
}

export async function action({ request, context }: ActionFunctionArgs)
{
    const record = await request.json<InsertPayload>()
    const kv = context.cloudflare.env.kvcache;
    if (record.type === "INSERT" || record.type === "UPDATE")
    {
        const db = getDB(context);
        const data = await db.select().from(articles);
        kv.put("articles", JSON.stringify(data));
    }
    else if (record.type === "DELETE")
    {
        kv.delete("articles");
    }

}

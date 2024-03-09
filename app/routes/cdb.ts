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
    const data = await kv.get("articles", { type: "json", cacheTtl: 500 });
    if (data) {
        return json(data);
    }
    const db = getDB(context);
    const data2 = await db.select().from(articles);
    return json(data2);
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

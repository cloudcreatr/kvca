import {
  ActionFunctionArgs,
  AppLoadContext,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
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
  type: "INSERT" | "UPDATE" | "DELETE";
  table: "article";
  schema: string;
  record: typeof articles;
  old_record: null;
}

export async function loader({ context }: LoaderFunctionArgs) {
  const kv = context.cloudflare.env.kvcache;
  const { ctx } = context.cloudflare;
  const start = performance.now();
  const data = await kv.get("om2", { type: "stream" });
  const end = performance.now();
  const time = end - start;

  if (data) {
    return new Response(data, {
      headers: {
        "X-KV-Cache": "HIT",
        "X-KV-Cache-Time": `${time}ms`,
        "content-type": "application/json",
      },
    });
  }
  const db = getDB(context);
  const start2 = performance.now();
  const data2 = await db.select().from(articles);
  const end2 = performance.now();
  const time2 = end2 - start2;
  console.log("db", {
    data2,
    time2,
  });

  await kv.put("articles", JSON.stringify(data2));

  return json(data2, {
    headers: {
      "X-KV-Cache": "MISS",
      "X-KV-Cache-Time": `${time2}ms`,
    },
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const record = await request.json<InsertPayload>();
  console.log({
    record,
  });
  const kv = context.cloudflare.env.kvcache;
  const db = getDB(context);
  if (record.type === "INSERT" || record.type === "UPDATE") {
    console.log("insert or update");
    const data = await db.select().from(articles);
    kv.put("om2", JSON.stringify(data));
  } else if (record.type === "DELETE") {
    console.log("delete");
    kv.delete("om2");
    const data = await db.select().from(articles);
    kv.put("articles", JSON.stringify(data));
  }
  console.log("webhook success");
  return new Response("OK");
}

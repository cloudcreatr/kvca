import {
  json,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";


export async function loader({ request, context }: LoaderFunctionArgs) {
  const kv = context.cloudflare.env.kvcache;
  

  return await kv.get("om", { type: "json" })
}

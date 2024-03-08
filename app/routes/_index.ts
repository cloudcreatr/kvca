import {
  json,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";


export async function loader({ request, context }: LoaderFunctionArgs) {
  const kv = context.cloudflare.env.kvcache;
  const cf = context.cloudflare.cf;
  const start = performance.now();
  const data = await kv.get("om", { type: "json" });
  const end = performance.now();
  const timing = end - start; 
 
  const returndata = {
    data: data,

    time: timing,
    colo: cf.colo,
    country: cf.country,
  };
  console.log(returndata);
  return returndata ;

  }


import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";


export async function action({ request, context }: ActionFunctionArgs) { 
    const formdata = await request.formData();
    
    const data = {
        name: formdata.get("name"),
        text: formdata.get("text")
    }
    const kv = context.cloudflare.env.kvcache;
    await kv.put("om", JSON.stringify(data));
    
   return json("REVAILDATED BRO!!");
}

export default function Rev() {
    const fetcher = useFetcher();
    const issub = fetcher.state === "submitting"
    const rev_state = fetcher.data;
  return (
    <div>
     
          <fetcher.Form method="post">
              <input type="text" name="name" />
              <input type="text" name="text" />
              <button type="submit">{
              issub ? "Submitting..." : "Submit"
              }</button>

          </fetcher.Form>
          <div> { rev_state ? `${rev_state}` : "still cached" } </div>
    </div>
  );
}

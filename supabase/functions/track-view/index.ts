import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TRANSPARENT_PNG = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB" +
  "Nl7BcQAAAABJRU5ErkJggg=="
), c => c.charCodeAt(0));

const PNG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = req.headers.get("user-agent");

  // Capture all headers as JSON for maximum data retention
  const allHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fire-and-forget: don't await the insert
  hashIP(ip).then(visitor_hash => {
    supabase.from("profile_views").insert({
      visitor_hash,
      user_agent: userAgent,
      raw_ip: ip,
      headers: allHeaders,
    }).then(({ error }) => {
      if (error) console.error("insert error:", error);
    });
  });

  return new Response(TRANSPARENT_PNG, { headers: PNG_HEADERS });
});

import { getStore } from "@netlify/blobs";

// Cross-device settings sync. A random sync code (only known to its owner) is the key.
// GET  /api/sync?code=XXXX            -> { data, updatedAt } or 404
// PUT  /api/sync  { code, data, updatedAt }

const CODE = /^[A-Z2-9]{12}$/;
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req: Request) => {
  const store = getStore({ name: "dailyhq-sync", consistency: "strong" });

  if (req.method === "GET") {
    const code = (new URL(req.url).searchParams.get("code") || "").toUpperCase();
    if (!CODE.test(code)) return json({ error: "Invalid code" }, 400);
    const entry = await store.get(code, { type: "json" });
    if (!entry) return json({ error: "No settings found for that code" }, 404);
    return json(entry);
  }

  if (req.method === "PUT" || req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Bad body" }, 400);
    }
    const code = String(body?.code || "").toUpperCase();
    if (!CODE.test(code)) return json({ error: "Invalid code" }, 400);
    const payload = JSON.stringify(body.data ?? null);
    if (payload.length > 400_000) return json({ error: "Settings too large" }, 413);
    const updatedAt = Number(body.updatedAt) || Date.now();
    await store.setJSON(code, { data: body.data, updatedAt });
    return json({ ok: true, updatedAt });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/sync", method: ["GET", "PUT", "POST"] };

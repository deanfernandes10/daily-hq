import { getStore } from "@netlify/blobs";

// My Comics storage. Anyone can read; only requests carrying the owner's edit key can write.
// GET /api/comics                       -> { state, collection, history }
// PUT /api/comics  header x-comics-key  -> body { kind: "state", data } | { kind: "collection", csv, snapshot }

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req: Request) => {
  const store = getStore({ name: "my-comics", consistency: "strong" });

  if (req.method === "GET") {
    const [state, collection, history] = await Promise.all([
      store.get("state", { type: "json" }),
      store.get("collection", { type: "json" }),
      store.get("history", { type: "json" }),
    ]);
    return json({ state: state ?? null, collection: collection ?? null, history: history ?? [] });
  }

  if (req.method === "PUT" || req.method === "POST") {
    const key = process.env.COMICS_EDIT_KEY;
    if (!key) return json({ error: "Editing isn't set up" }, 503);
    if (req.headers.get("x-comics-key") !== key) return json({ error: "Wrong edit key" }, 401);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Bad body" }, 400);
    }
    const now = Date.now();

    if (body?.kind === "check") return json({ ok: true });

    if (body?.kind === "state") {
      const payload = JSON.stringify(body.data ?? null);
      if (payload.length > 2_000_000) return json({ error: "Too large" }, 413);
      await store.setJSON("state", { data: body.data, updatedAt: now });
      return json({ ok: true, updatedAt: now });
    }

    if (body?.kind === "collection") {
      const csv = String(body.csv || "");
      if (!csv || csv.length > 5_000_000) return json({ error: "Missing or too large" }, 413);
      await store.setJSON("collection", { csv, name: String(body.name || "CLZ export").slice(0, 200), importedAt: now });
      if (body.snapshot && typeof body.snapshot === "object") {
        const history = ((await store.get("history", { type: "json" })) as any[]) || [];
        const s = body.snapshot;
        history.push({ at: now, total: Number(s.total) || 0, covr: Number(s.covr) || 0, count: Number(s.count) || 0, top100: Number(s.top100) || 0 });
        await store.setJSON("history", history.slice(-200));
      }
      return json({ ok: true, importedAt: now });
    }

    if (body?.kind === "reset-collection") {
      await store.delete("collection");
      return json({ ok: true });
    }

    return json({ error: "Unknown kind" }, 400);
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/comics", method: ["GET", "PUT", "POST"] };

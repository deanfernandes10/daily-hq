import { getStore } from "@netlify/blobs";

// Daily HQ private beta: invite codes with an end date, per-device tracking and tester feedback.
// POST /api/beta { action: "check", code, device, ua }            -> { ok, status, name, expires }
// POST /api/beta { action: "feedback", code, device, text, ... }  -> { ok }
// Owner-only (header x-beta-admin = BETA_ADMIN_KEY):
//   { action: "list" } | { action: "create", name, note, days, maxDevices, owner } | { action: "update", code, patch } | { action: "delete-feedback", id }

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const CODE = /^HQ-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newCode = () => {
  const r = crypto.getRandomValues(new Uint8Array(8));
  const s = [...r].map((n) => ALPHA[n % ALPHA.length]).join("");
  return `HQ-${s.slice(0, 4)}-${s.slice(4)}`;
};
const clean = (s: unknown, n: number) => String(s ?? "").slice(0, n);

type Invite = { code: string; name: string; note?: string; created: number; expires: number | null; revoked?: boolean; maxDevices: number; owner?: boolean };
type Use = { devices: Record<string, { first: number; last: number; opens: number; ua: string }> };

function statusOf(inv: Invite | null) {
  if (!inv) return "unknown";
  if (inv.revoked) return "revoked";
  if (inv.expires && inv.expires < Date.now()) return "expired";
  return "ok";
}

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const store = getStore({ name: "dailyhq-beta", consistency: "strong" });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad body" }, 400);
  }
  const action = body?.action;

  if (action === "check" || action === "feedback") {
    const code = clean(body.code, 20).toUpperCase().trim();
    const device = clean(body.device, 40).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!CODE.test(code) || !device) return json({ ok: false, status: "unknown" });
    const ownerCode = (process.env.BETA_OWNER_CODE || "").toUpperCase();
    const inv = ownerCode && code === ownerCode
      ? ({ code, name: "Dean", created: 0, expires: null, maxDevices: 99, owner: true } as Invite)
      : ((await store.get(`invite/${code}`, { type: "json" })) as Invite | null);
    const status = statusOf(inv);
    // Feedback is accepted from any real invite, even one that has ended, so testers can send final notes.
    if (status !== "ok" && !(action === "feedback" && inv)) return json({ ok: false, status, name: inv?.name || "", expires: inv?.expires ?? null });

    const use = ((await store.get(`use/${code}`, { type: "json" })) as Use | null) || { devices: {} };
    const now = Date.now();
    if (!use.devices[device] && action === "check") {
      if (!inv!.owner && Object.keys(use.devices).length >= (inv!.maxDevices || 3)) return json({ ok: false, status: "full", name: inv!.name });
      use.devices[device] = { first: now, last: now, opens: 0, ua: clean(body.ua, 160) };
    }

    if (action === "feedback") {
      const text = clean(body.text, 4000).trim();
      if (!text) return json({ error: "Empty feedback" }, 400);
      const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
      await store.setJSON(`fb/${id}`, { id, at: now, code, name: inv!.name, device, text, kind: clean(body.kind, 30), version: clean(body.version, 40), page: clean(body.page, 60), ua: clean(body.ua, 160) });
      return json({ ok: true });
    }

    const d = use.devices[device];
    d.last = now;
    d.opens = (d.opens || 0) + 1;
    d.ua = clean(body.ua, 160) || d.ua;
    await store.setJSON(`use/${code}`, use);
    return json({ ok: true, status, name: inv!.name, expires: inv!.expires, owner: !!inv!.owner });
  }

  // ---------- owner only
  const key = process.env.BETA_ADMIN_KEY;
  if (!key) return json({ error: "Beta admin isn't set up" }, 503);
  if (req.headers.get("x-beta-admin") !== key) return json({ error: "Wrong admin key" }, 401);

  if (action === "list") {
    const [inv, fb] = await Promise.all([store.list({ prefix: "invite/" }), store.list({ prefix: "fb/" })]);
    const invites = await Promise.all(
      inv.blobs.map(async (b) => {
        const i = (await store.get(b.key, { type: "json" })) as Invite;
        const u = ((await store.get(`use/${i.code}`, { type: "json" })) as Use | null) || { devices: {} };
        return { ...i, status: statusOf(i), devices: Object.entries(u.devices).map(([id, d]) => ({ id, ...d })) };
      })
    );
    const feedback = (await Promise.all(fb.blobs.slice(-300).map((b) => store.get(b.key, { type: "json" })))).filter(Boolean).sort((a: any, b: any) => b.at - a.at);
    return json({ invites: invites.sort((a, b) => b.created - a.created), feedback });
  }

  if (action === "create") {
    let code = newCode();
    for (let i = 0; i < 5 && (await store.get(`invite/${code}`)); i++) code = newCode();
    const days = Number(body.days);
    const inv: Invite = {
      code,
      name: clean(body.name, 80).trim() || "Tester",
      note: clean(body.note, 300).trim(),
      created: Date.now(),
      expires: body.owner || !days ? null : Date.now() + Math.min(days, 730) * 86400e3,
      maxDevices: Math.max(1, Math.min(10, Number(body.maxDevices) || 3)),
      owner: !!body.owner,
    };
    await store.setJSON(`invite/${code}`, inv);
    return json({ ok: true, invite: inv });
  }

  if (action === "update") {
    const code = clean(body.code, 20).toUpperCase();
    const inv = (await store.get(`invite/${code}`, { type: "json" })) as Invite | null;
    if (!inv) return json({ error: "No such invite" }, 404);
    const p = body.patch || {};
    if ("name" in p) inv.name = clean(p.name, 80).trim() || inv.name;
    if ("note" in p) inv.note = clean(p.note, 300).trim();
    if ("expires" in p) inv.expires = p.expires === null ? null : Number(p.expires) || inv.expires;
    if ("revoked" in p) inv.revoked = !!p.revoked;
    if ("maxDevices" in p) inv.maxDevices = Math.max(1, Math.min(10, Number(p.maxDevices) || inv.maxDevices));
    if (p.resetDevices) await store.delete(`use/${code}`);
    await store.setJSON(`invite/${code}`, inv);
    return json({ ok: true, invite: inv });
  }

  if (action === "delete") {
    const code = clean(body.code, 20).toUpperCase();
    await Promise.all([store.delete(`invite/${code}`), store.delete(`use/${code}`)]);
    return json({ ok: true });
  }

  if (action === "delete-feedback") {
    await store.delete(`fb/${clean(body.id, 40)}`);
    return json({ ok: true });
  }

  return json({ error: "Unknown action" }, 400);
};

export const config = { path: "/api/beta", method: ["POST"] };

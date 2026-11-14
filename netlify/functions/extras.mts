import { UA, json } from "../lib/shared.mts";

// Small helpers for the brief and settings, cached at the edge.
// GET /api/extras?kind=onthisday&m=11&d=14
// GET /api/extras?kind=holidays&cc=US
// GET /api/extras?kind=events&lat=..&lon=..&radius=25      (needs TICKETMASTER_KEY)
// GET /api/extras?kind=geocode&q=123 Main St, Manalapan NJ
// GET /api/extras?kind=route&from=lat,lon&to=lat,lon        (typical drive time, no live traffic)

const num = (s: string | null, lo: number, hi: number) => { const n = Number(s); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const get = async (url: string, headers: Record<string, string> = {}) => {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json", ...headers }, signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};

export default async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const kind = q.get("kind");
  try {
    if (kind === "onthisday") {
      const m = num(q.get("m"), 1, 12), d = num(q.get("d"), 1, 31);
      if (!m || !d) return json({ error: "Bad date" }, 400);
      const w: any = await get(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`, { "api-user-agent": "DailyHQ/1.0 (personal dashboard)" });
      const items = (w.selected || []).slice(0, 12).map((x: any) => ({
        year: x.year, text: String(x.text || "").slice(0, 300),
        link: x.pages?.[0]?.content_urls?.mobile?.page || x.pages?.[0]?.content_urls?.desktop?.page || "",
        thumb: x.pages?.[0]?.thumbnail?.source || "",
      }));
      return json({ items }, 200, 6 * 3600);
    }

    if (kind === "holidays") {
      const cc = (q.get("cc") || "US").toUpperCase();
      if (!/^[A-Z]{2}$/.test(cc)) return json({ error: "Bad country" }, 400);
      const h: any = await get(`https://date.nager.at/api/v3/NextPublicHolidays/${cc}`);
      const items = (Array.isArray(h) ? h : []).filter((x: any) => x.global !== false || (x.counties || []).length < 4).slice(0, 6).map((x: any) => ({ date: x.date, name: x.name, local: x.localName }));
      return json({ items }, 200, 12 * 3600);
    }

    if (kind === "events") {
      const key = process.env.TICKETMASTER_KEY;
      if (!key) return json({ needsKey: true, items: [] }, 200, 3600);
      const lat = num(q.get("lat"), -90, 90), lon = num(q.get("lon"), -180, 180);
      if (lat == null || lon == null) return json({ error: "Bad location" }, 400);
      const radius = num(q.get("radius"), 5, 100) || 25;
      const start = new Date().toISOString().replace(/\.\d+Z$/, "Z");
      const end = new Date(Date.now() + 8 * 86400e3).toISOString().replace(/\.\d+Z$/, "Z");
      const t: any = await get(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${key}&latlong=${lat.toFixed(3)},${lon.toFixed(3)}&radius=${radius}&unit=miles&sort=date,asc&size=60&startDateTime=${start}&endDateTime=${end}`);
      const seen = new Set<string>();
      const items = (t._embedded?.events || []).map((e: any) => {
        const v = e._embedded?.venues?.[0];
        const img = (e.images || []).filter((i: any) => i.ratio === "16_9" && i.width < 800).sort((a: any, b: any) => b.width - a.width)[0] || e.images?.[0];
        return {
          name: e.name, url: e.url, date: e.dates?.start?.localDate, time: e.dates?.start?.localTime || "", tba: !!e.dates?.start?.timeTBA,
          venue: v?.name || "", city: v?.city?.name || "", segment: e.classifications?.[0]?.segment?.name || "", genre: e.classifications?.[0]?.genre?.name || "",
          img: img?.url || "", price: e.priceRanges?.[0]?.min ?? null,
        };
      }).filter((e: any) => { const k = `${e.name}|${e.date}|${e.venue}`; if (seen.has(k)) return false; seen.add(k); return true; });
      return json({ items }, 200, 3 * 3600);
    }

    if (kind === "geocode") {
      const text = (q.get("q") || "").trim().slice(0, 200);
      if (text.length < 3) return json({ items: [] });
      const g: any = await get(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(text)}`, { "user-agent": "DailyHQ/1.0 (personal dashboard; dean-daily-hq.netlify.app)" });
      const items = (g || []).map((x: any) => ({ label: x.display_name, lat: +x.lat, lon: +x.lon, cc: (x.address?.country_code || "").toUpperCase() }));
      return json({ items }, 200, 86400);
    }

    if (kind === "route") {
      const p = (s: string | null) => { const [a, b] = (s || "").split(",").map(Number); return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 ? [a, b] : null; };
      const from = p(q.get("from")), to = p(q.get("to"));
      if (!from || !to) return json({ error: "Bad points" }, 400);
      const r: any = await get(`https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`);
      const route = r.routes?.[0];
      if (!route) return json({ error: "No route" }, 404);
      return json({ minutes: Math.round(route.duration / 60), km: Math.round(route.distance / 100) / 10 }, 200, 86400);
    }
  } catch (e) {
    console.log("extras failed", kind, String(e));
    return json({ error: "Source unavailable" }, 502);
  }
  return json({ error: "Unknown kind" }, 400);
};

export const config = { path: "/api/extras" };

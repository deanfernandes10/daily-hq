import { json } from "../lib/shared.mts";

// Places near a point, from OpenStreetMap (free, no key), via the Overpass API.
// GET /api/nearby?lat=40.28&lon=-74.34&cat=food&r=8000
// cat: food | coffee | bars | todo | parks | family
// Returns { items: [{ id, name, kind, cuisine, lat, lon, dist, addr, phone, website, hours, diet, takeaway, delivery, outdoor }] }

const CATS: Record<string, string[]> = {
  food: ['nwr["amenity"~"^(restaurant|fast_food|food_court)$"]["name"]'],
  coffee: ['nwr["amenity"="cafe"]["name"]', 'nwr["shop"~"^(bakery|pastry|coffee)$"]["name"]', 'nwr["amenity"="ice_cream"]["name"]'],
  bars: ['nwr["amenity"~"^(bar|pub|biergarten|nightclub)$"]["name"]', 'nwr["craft"~"^(brewery|winery|distillery)$"]["name"]'],
  todo: [
    'nwr["tourism"~"^(attraction|museum|gallery|zoo|theme_park|aquarium|viewpoint)$"]["name"]',
    'nwr["amenity"~"^(cinema|theatre|arts_centre|casino)$"]["name"]',
    'nwr["leisure"~"^(bowling_alley|escape_game|miniature_golf|ice_rink|amusement_arcade|golf_course|water_park|trampoline_park)$"]["name"]',
  ],
  parks: ['nwr["leisure"~"^(park|nature_reserve|garden|beach_resort)$"]["name"]', 'nwr["natural"="beach"]["name"]', 'nwr["route"="hiking"]["name"]'],
  family: [
    'nwr["leisure"~"^(playground|water_park|trampoline_park|miniature_golf|amusement_arcade)$"]["name"]',
    'nwr["tourism"~"^(zoo|aquarium|theme_park)$"]["name"]',
    'nwr["amenity"="library"]["name"]',
  ],
};
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

const toRad = (d: number) => (d * Math.PI) / 180;
const distM = (a: number, b: number, c: number, d: number) => {
  const R = 6371000, x = toRad(c - a), y = toRad(d - b);
  const h = Math.sin(x / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export default async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const lat = Number(q.get("lat")), lon = Number(q.get("lon"));
  const cat = q.get("cat") || "food";
  const r = Math.min(Math.max(Number(q.get("r")) || 5000, 500), 25000);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return json({ error: "Bad location" }, 400);
  if (!CATS[cat]) return json({ error: "Bad category" }, 400);
  // round the point so nearby requests share the cache
  const la = Math.round(lat * 200) / 200, lo = Math.round(lon * 200) / 200;
  const body = `[out:json][timeout:20];(${CATS[cat].map((s) => `${s}(around:${r},${la},${lo});`).join("")});out center tags 400;`;
  let data: any = null, lastErr = "";
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, { method: "POST", body: "data=" + encodeURIComponent(body), headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "DailyHQ/1.0 (personal dashboard)" }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) { lastErr = `${res.status}`; continue; }
      data = await res.json();
      break;
    } catch (e: any) { lastErr = e?.message || "timeout"; }
  }
  if (!data) { console.log("nearby failed", cat, lastErr); return json({ error: "Places are unavailable right now" }, 502); }
  const seen = new Set<string>();
  const items = (data.elements || [])
    .map((e: any) => {
      const t = e.tags || {};
      const plat = e.lat ?? e.center?.lat, plon = e.lon ?? e.center?.lon;
      if (plat == null || !t.name) return null;
      const key = `${t.name.toLowerCase()}|${Math.round(plat * 1000)}|${Math.round(plon * 1000)}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
      const addr = [street, t["addr:city"]].filter(Boolean).join(", ");
      const kind = t.amenity || t.tourism || t.leisure || t.shop || t.craft || t.natural || t.route || "";
      const diet = Object.keys(t).filter((k) => k.startsWith("diet:") && /yes|only/.test(t[k])).map((k) => k.slice(5));
      return {
        id: `${e.type}/${e.id}`, name: t.name, kind, cuisine: (t.cuisine || "").replace(/_/g, " ").split(";").slice(0, 3).join(", "),
        lat: plat, lon: plon, dist: Math.round(distM(lat, lon, plat, plon)),
        addr, phone: t.phone || t["contact:phone"] || "", website: t.website || t["contact:website"] || "",
        hours: t.opening_hours || "", diet, takeaway: t.takeaway === "yes", delivery: t.delivery === "yes",
        outdoor: t.outdoor_seating === "yes", brand: t.brand || "",
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.dist - b.dist)
    .slice(0, 150);
  return json({ items }, 200, 3600);
};

export const config = { path: "/api/nearby" };

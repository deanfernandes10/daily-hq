import { getStore } from "@netlify/blobs";
import { json } from "../lib/shared.mts";

// Places near a point, from OpenStreetMap (free, no key), via the Overpass API.
// GET /api/nearby?lat=40.28&lon=-74.34&cat=food&r=8000
// cat: food | coffee | bars | todo | parks | family
// Returns { items: [{ id, name, kind, cuisine, lat, lon, dist, addr, phone, website, hours, diet, takeaway, delivery, outdoor }] }

const CATS: Record<string, string[]> = {
  food: ['nw[amenity=restaurant][name]', 'nw[amenity=fast_food][name]'],
  coffee: ['nw[amenity=cafe][name]', 'nw[shop=bakery][name]', 'nw[amenity=ice_cream][name]'],
  bars: ['nw[amenity=bar][name]', 'nw[amenity=pub][name]', 'nw[craft=brewery][name]', 'nw[craft=winery][name]'],
  todo: ['nw[tourism=attraction][name]', 'nw[tourism=museum][name]', 'nw[amenity=cinema][name]', 'nw[amenity=theatre][name]', 'nw[leisure=bowling_alley][name]', 'nw[leisure=miniature_golf][name]', 'nw[leisure=amusement_arcade][name]', 'nw[leisure=escape_game][name]'],
  parks: ['nw[leisure=park][name]', 'nw[leisure=nature_reserve][name]', 'nw[natural=beach][name]'],
  family: ['nw[leisure=playground][name]', 'nw[amenity=library][name]', 'nw[tourism=zoo][name]', 'nw[tourism=aquarium][name]', 'nw[leisure=trampoline_park][name]'],
};
const ENDPOINTS = ["https://overpass.private.coffee/api/interpreter", "https://overpass-api.de/api/interpreter"];

const toRad = (d: number) => (d * Math.PI) / 180;
const distM = (a: number, b: number, c: number, d: number) => {
  const R = 6371000, x = toRad(c - a), y = toRad(d - b);
  const h = Math.sin(x / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// ---------- Google Places (New), used when GOOGLE_PLACES_KEY is set: ratings, photos, prices, open now
const G_TYPES: Record<string, string[]> = {
  food: ["restaurant"],
  coffee: ["cafe", "coffee_shop", "bakery", "ice_cream_shop"],
  bars: ["bar", "pub", "wine_bar", "night_club"],
  todo: ["tourist_attraction", "museum", "art_gallery", "movie_theater", "bowling_alley", "amusement_park", "performing_arts_theater", "aquarium", "zoo", "casino"],
  parks: ["park", "national_park", "hiking_area", "beach", "state_park"],
  family: ["amusement_center", "amusement_park", "playground", "zoo", "aquarium", "library"],
};
const G_FIELDS = ["id", "displayName", "shortFormattedAddress", "location", "rating", "userRatingCount", "priceLevel", "currentOpeningHours.openNow", "regularOpeningHours.weekdayDescriptions", "primaryTypeDisplayName", "googleMapsUri", "websiteUri", "nationalPhoneNumber", "photos", "takeout", "delivery", "outdoorSeating", "servesVegetarianFood"].map((f) => `places.${f}`).join(",");
const PRICE: Record<string, string> = { PRICE_LEVEL_FREE: "Free", PRICE_LEVEL_INEXPENSIVE: "$", PRICE_LEVEL_MODERATE: "$$", PRICE_LEVEL_EXPENSIVE: "$$$", PRICE_LEVEL_VERY_EXPENSIVE: "$$$$" };
async function googleNearby(key: string, lat: number, lon: number, cat: string, r: number) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": G_FIELDS },
    body: JSON.stringify({ includedTypes: G_TYPES[cat], maxResultCount: 20, rankPreference: "POPULARITY", locationRestriction: { circle: { center: { latitude: lat, longitude: lon }, radius: Math.min(r, 50000) } } }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`google ${res.status} ${(await res.text()).slice(0, 200)}`);
  const d: any = await res.json();
  return (d.places || []).map((p: any) => ({
    id: p.id, name: p.displayName?.text || "", kind: "", cuisine: p.primaryTypeDisplayName?.text || "",
    lat: p.location?.latitude, lon: p.location?.longitude, dist: Math.round(distM(lat, lon, p.location?.latitude, p.location?.longitude)),
    addr: p.shortFormattedAddress || "", phone: p.nationalPhoneNumber || "", website: p.websiteUri || "",
    hours: "", open: p.currentOpeningHours?.openNow ?? null, week: p.regularOpeningHours?.weekdayDescriptions || [],
    rating: p.rating ?? null, reviews: p.userRatingCount ?? 0, price: PRICE[p.priceLevel] || "",
    photo: p.photos?.[0]?.name || "", maps: p.googleMapsUri || "",
    takeaway: !!p.takeout, delivery: !!p.delivery, outdoor: !!p.outdoorSeating, diet: p.servesVegetarianFood ? ["vegetarian"] : [],
  })).filter((x: any) => x.name && x.lat != null);
}

// ---------- Geoapify (managed OpenStreetMap data), used when GEOAPIFY_KEY is set: fast and reliable, caching allowed
const GEO_CATS: Record<string, string> = {
  food: "catering.restaurant,catering.fast_food",
  coffee: "catering.cafe,catering.ice_cream,commercial.food_and_drink.bakery",
  bars: "catering.bar,catering.pub,catering.biergarten,production.brewery,production.winery",
  todo: "tourism.attraction,entertainment.museum,entertainment.cinema,entertainment.culture.theatre,entertainment.bowling_alley,entertainment.miniature_golf,entertainment.escape_game,entertainment.amusement_arcade,entertainment.theme_park",
  parks: "leisure.park,national_park,natural.protected_area,beach",
  family: "leisure.playground,education.library,entertainment.zoo,entertainment.aquarium,entertainment.activity_park.trampoline,entertainment.theme_park",
};
async function geoNearby(key: string, lat: number, lon: number, cat: string, r: number) {
  const u = `https://api.geoapify.com/v2/places?categories=${GEO_CATS[cat]}&filter=circle:${lon},${lat},${Math.round(r)}&bias=proximity:${lon},${lat}&limit=100&apiKey=${key}`;
  const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`geoapify ${res.status} ${(await res.text()).slice(0, 200)}`);
  const d: any = await res.json();
  const seen = new Set<string>();
  return (d.features || []).map((f: any) => {
    const p = f.properties || {}, t = p.datasource?.raw || {};
    const name = p.name || t.name;
    if (!name || p.lat == null) return null;
    const k = `${name.toLowerCase()}|${Math.round(p.lat * 1000)}|${Math.round(p.lon * 1000)}`;
    if (seen.has(k)) return null;
    seen.add(k);
    const street = [p.housenumber, p.street].filter(Boolean).join(" ");
    const leaf = (p.categories || []).filter((c: string) => c.split(".").length === 2).map((c: string) => c.split(".")[1])[0] || "";
    return {
      id: p.place_id || `${f.geometry?.coordinates}`, name, kind: t.amenity || t.tourism || t.leisure || t.shop || t.craft || t.natural || leaf,
      cuisine: (t.cuisine || p.catering?.cuisine || "").replace(/_/g, " ").split(";").slice(0, 3).join(", "),
      lat: p.lat, lon: p.lon, dist: Math.round(p.distance ?? distM(lat, lon, p.lat, p.lon)),
      addr: [street, p.city].filter(Boolean).join(", ") || p.address_line2 || "",
      phone: p.contact?.phone || t.phone || t["contact:phone"] || "", website: p.website || t.website || t["contact:website"] || "",
      hours: p.opening_hours || t.opening_hours || "",
      diet: Object.keys(t).filter((x) => x.startsWith("diet:") && /yes|only/.test(t[x])).map((x) => x.slice(5)),
      takeaway: t.takeaway === "yes", delivery: t.delivery === "yes", outdoor: t.outdoor_seating === "yes", brand: t.brand || "",
    };
  }).filter(Boolean).sort((a: any, b: any) => a.dist - b.dist).slice(0, 150);
}

export default async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const gkey = Netlify.env.get("GOOGLE_PLACES_KEY") || "";
  // A place photo: ask Google for the image address (keeps the key on the server) and send the phone there
  const geokey = Netlify.env.get("GEOAPIFY_KEY") || "";
  if (q.get("probe")) return json({ google: !!gkey, geo: !!geokey }, 200, 300);
  const photo = q.get("photo");
  if (photo) {
    if (!gkey || !/^places\/[\w-]+\/photos\/[\w-]+$/.test(photo)) return json({ error: "Bad photo" }, 400);
    try {
      const r2 = await fetch(`https://places.googleapis.com/v1/${photo}/media?maxWidthPx=400&skipHttpRedirect=true&key=${gkey}`, { signal: AbortSignal.timeout(6000) });
      const j: any = await r2.json();
      if (!j.photoUri) return json({ error: "No photo" }, 404);
      return new Response(null, { status: 302, headers: { location: j.photoUri, "cache-control": "public, max-age=3600" } });
    } catch { return json({ error: "No photo" }, 502); }
  }
  const lat = Number(q.get("lat")), lon = Number(q.get("lon"));
  const cat = q.get("cat") || "food";
  const r = Math.min(Math.max(Number(q.get("r")) || 5000, 500), 25000);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return json({ error: "Bad location" }, 400);
  if (!CATS[cat]) return json({ error: "Bad category" }, 400);
  if (gkey) {
    try { return json({ items: await googleNearby(gkey, lat, lon, cat, r), provider: "google" }, 200, 300); }
    catch (e: any) { console.log("google places failed, using OpenStreetMap", e?.message); }
  }
  // round the point so nearby requests share the cache
  const la = Math.round(lat * 200) / 200, lo = Math.round(lon * 200) / 200;
  const body = `[out:json][timeout:10];(${CATS[cat].map((s) => `${s}(around:${r},${la},${lo});`).join("")});out center tags qt 300;`;
  const store = getStore({ name: "nearby-cache", consistency: "eventual" });
  const ck = `${cat}/${la}/${lo}/${r}`;
  if (geokey) {
    // a fresh saved answer for this spot (under 6 hours) saves a call
    try {
      const c: any = await store.get(`geo/${ck}`, { type: "json" });
      if (c?.items && Date.now() - c.at < 6 * 3600e3) return json({ items: c.items, provider: "geoapify" }, 200, 3600);
    } catch {}
    try {
      const items = await geoNearby(geokey, la, lo, cat, r);
      try { await store.setJSON(`geo/${ck}`, { at: Date.now(), items }); await store.setJSON(ck, { at: Date.now(), items }); } catch {}
      return json({ items, provider: "geoapify" }, 200, 3600);
    } catch (e: any) { console.log("geoapify failed, using Overpass", e?.message); }
  }
  // Ask every public Overpass server at once and take the first good answer
  const ask = (ep: string, signal: AbortSignal) =>
    fetch(ep, { method: "POST", body: "data=" + encodeURIComponent(body), headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "DailyHQ/1.0 (personal dashboard)" }, signal })
      .then(async (res) => { if (!res.ok) throw new Error(String(res.status)); const j = await res.json(); if (!Array.isArray(j.elements)) throw new Error("bad"); return j; });
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 14000);
  let data: any = null;
  try { data = await Promise.any(ENDPOINTS.map((ep) => ask(ep, ctl.signal))); } catch {}
  clearTimeout(timer);
  ctl.abort();
  if (!data) {
    // fall back to the last answer we saved for this spot (up to a week old)
    try {
      const cached: any = await store.get(ck, { type: "json" });
      if (cached?.items && Date.now() - cached.at < 7 * 86400e3) return json({ items: cached.items, cached: true }, 200, 600);
    } catch {}
    console.log("nearby failed", cat, "all endpoints");
    return json({ error: "Places are busy right now — try again in a minute" }, 502);
  }
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
  try { await store.setJSON(ck, { at: Date.now(), items }); } catch {}
  return json({ items }, 200, 6 * 3600);
};

export const config = { path: "/api/nearby" };

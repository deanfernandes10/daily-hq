import { UA, json } from "../lib/shared.mts";

// Real observed "right now" conditions from the nearest official weather station.
// US: National Weather Service station observations. Canada: Environment Canada city page.
// GET /api/obs?lat=40.3&lon=-74.3
const get = (url: string, ms = 6000) =>
  fetch(url, { headers: { "user-agent": `${UA} dailyhq (weather)`, accept: "application/geo+json, application/json" }, signal: AbortSignal.timeout(ms) });


async function nws(lat: number, lon: number) {
  const pt = await (await get(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`)).json();
  const stUrl = pt?.properties?.observationStations;
  if (!stUrl) return null;
  const st = await (await get(stUrl)).json();
  const stations = (st?.features || []).slice(0, 4);
  for (const f of stations) {
    const id = f.properties?.stationIdentifier;
    if (!id) continue;
    try {
      const o = (await (await get(`https://api.weather.gov/stations/${id}/observations/latest`, 5000)).json())?.properties;
      if (!o?.timestamp) continue;
      const age = (Date.now() - new Date(o.timestamp).getTime()) / 60000;
      if (age > 120 || !o.textDescription) continue;
      return {
        source: "National Weather Service",
        station: f.properties?.name || id,
        text: o.textDescription,
        tempC: o.temperature?.value ?? null,
        precipMm: o.precipitationLastHour?.value ?? null,
        present: (o.presentWeather || []).map((p: any) => [p.intensity, p.weather].filter(Boolean).join(" ")).filter(Boolean),
        time: o.timestamp,
      };
    } catch {}
  }
  return null;
}

async function eccc(lat: number, lon: number) {
  const d = 0.5;
  const r = await get(`https://api.weather.gc.ca/collections/citypageweather-realtime/items?f=json&lang=en&limit=6&bbox=${lon - d},${lat - d},${lon + d},${lat + d}`, 7000);
  const j = await r.json();
  const feats = (j?.features || [])
    .map((f: any) => ({ f, dist: Math.hypot((f.geometry?.coordinates?.[0] ?? 999) - lon, (f.geometry?.coordinates?.[1] ?? 999) - lat) }))
    .sort((a: any, b: any) => a.dist - b.dist);
  for (const { f } of feats) {
    const p = f.properties || {};
    const cc = p.currentConditions || {};
    const en = (v: any) => (v && typeof v === "object" ? v.en ?? v.value?.en ?? v.value : v);
    const text = en(cc.condition);
    if (!text) continue;
    const t = cc.temperature?.value;
    return {
      source: "Environment Canada",
      station: en(cc.station?.value) || en(p.name) || "",
      text,
      tempC: typeof t === "object" ? Number(t?.en ?? t?.value) : t != null ? Number(t) : null,
      precipMm: null,
      present: [],
      time: en(cc.timestamp) || p.lastUpdated || null,
    };
  }
  return null;
}

export default async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const lat = Number(q.get("lat")), lon = Number(q.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return json({ error: "lat/lon required" }, 400);
  try {
    // NWS covers the US; anywhere it doesn't (e.g. Canada) try Environment Canada
    let obs = await nws(lat, lon).catch((e) => (console.log("obs nws", e?.message), null));
    if (!obs && lat > 41.6) obs = await eccc(lat, lon).catch((e) => (console.log("obs eccc", e?.message), null));
    return json({ obs }, 200, 300);
  } catch (e: any) {
    console.log("obs failed", e?.message);
    return json({ obs: null }, 200, 120);
  }
};

export const config = { path: "/api/obs" };

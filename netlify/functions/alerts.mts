import { json } from "../lib/shared.mts";

// Official weather alerts for a point.
// US: National Weather Service. Canada: Environment and Climate Change Canada (GeoMet API).
// GET /api/alerts?lat=40.28&lon=-74.34

const UA = "DailyHQ personal dashboard (netlify.app)";

export default async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const lat = Number(p.get("lat"));
  const lon = Number(p.get("lon"));
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180)
    return json({ error: "Bad coordinates" }, 400);

  const alerts: any[] = [];

  const us = fetch(`https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`, {
    headers: { "user-agent": UA, accept: "application/geo+json" },
    signal: AbortSignal.timeout(7000),
  })
    .then(async (r) => {
      if (!r.ok) return;
      const d = await r.json();
      for (const f of d.features || []) {
        const a = f.properties || {};
        alerts.push({
          source: "National Weather Service",
          event: a.event,
          severity: (a.severity || "").toLowerCase(), // extreme | severe | moderate | minor
          headline: a.headline || a.event,
          ends: a.ends || a.expires,
          url: `https://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${lon}`,
        });
      }
    })
    .catch(() => {});

  // Rough Canada bounding box, so US-only cities skip the call
  const inCanada = lat > 41.6 && lat < 84 && lon > -141.1 && lon < -52.5;
  const ca = inCanada
    ? fetch(
        `https://api.weather.gc.ca/collections/weather-alerts/items?f=json&lang=en&bbox=${(lon - 0.05).toFixed(3)},${(lat - 0.05).toFixed(3)},${(lon + 0.05).toFixed(3)},${(lat + 0.05).toFixed(3)}`,
        { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(7000) }
      )
        .then(async (r) => {
          if (!r.ok) return;
          const d = await r.json();
          for (const f of d.features || []) {
            const a = f.properties || {};
            const type = (a.alert_type || "").toLowerCase(); // warning | watch | advisory | statement
            alerts.push({
              source: "Environment Canada",
              event: a.alert_name_en || a.alert_short_name_en || "Weather alert",
              severity: type === "warning" ? "severe" : type === "watch" ? "moderate" : "minor",
              headline: a.alert_name_en,
              ends: a.expiration_datetime,
              url: "https://weather.gc.ca/warnings/index_e.html",
            });
          }
        })
        .catch(() => {})
    : Promise.resolve();

  await Promise.all([us, ca]);

  const seen = new Set<string>();
  const unique = alerts.filter((a) => a.event && !seen.has(a.event) && seen.add(a.event));
  const rank: Record<string, number> = { extreme: 0, severe: 1, moderate: 2, minor: 3 };
  unique.sort((a, b) => (rank[a.severity] ?? 4) - (rank[b.severity] ?? 4));
  return json({ alerts: unique }, 200, 300);
};

export const config = { path: "/api/alerts" };

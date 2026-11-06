import { UA, json } from "../lib/shared.mts";

// Proxies ESPN's public scoreboard / teams API and trims it to what the dashboard needs.
// GET /api/sports?path=hockey/nhl&dates=20261101-20261113
// GET /api/sports?path=hockey/nhl&kind=teams

const score = (s: any) => (s && typeof s === "object" ? s.displayValue ?? s.value : s);

export default async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const path = p.get("path") || "";
  if (!/^[a-z]+\/[a-z0-9.\-]+$/.test(path)) return json({ error: "Unknown league" }, 400);
  const kind = p.get("kind") || "scoreboard";
  const base = `https://site.api.espn.com/apis/site/v2/sports/${path}`;

  let url: string;
  if (kind === "teams") {
    url = `${base}/teams?limit=500`;
  } else {
    const dates = p.get("dates") || "";
    if (dates && !/^\d{8}(-\d{8})?$/.test(dates)) return json({ error: "Bad dates" }, 400);
    url = `${base}/scoreboard?limit=400${dates ? `&dates=${dates}` : ""}`;
  }

  let d: any = null;
  let lastErr = "";
  for (const host of ["site.api.espn.com", "site.web.api.espn.com"]) {
    try {
      const r = await fetch(url.replace("site.api.espn.com", host), {
        headers: { "user-agent": UA, accept: "application/json", referer: "https://www.espn.com/" },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) { lastErr = `${host} ${r.status}`; continue; }
      d = await r.json();
      break;
    } catch (e: any) {
      lastErr = `${host} ${e?.message || e}`;
    }
  }
  if (!d) {
    console.log("ESPN fetch failed:", lastErr);
    return json({ error: `ESPN unavailable (${lastErr})` }, 502);
  }

  if (kind === "teams") {
    const raw = d?.sports?.[0]?.leagues?.[0]?.teams || [];
    const teams = raw
      .map((x: any) => x.team)
      .filter(Boolean)
      .map((t: any) => ({
        id: t.id,
        abbr: t.abbreviation,
        name: t.displayName,
        short: t.shortDisplayName,
        logo: t.logos?.[0]?.href,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    return json({ teams }, 200, 86400);
  }

  const events = (d?.events || []).map((e: any) => {
    const c = e.competitions?.[0] || {};
    const st = e.status || c.status || {};
    const nets = new Set<string>();
    for (const b of c.broadcasts || []) for (const n of b.names || []) nets.add(n);
    for (const g of c.geoBroadcasts || []) if (g?.media?.shortName) nets.add(g.media.shortName);
    return {
      id: e.id,
      date: e.date,
      name: e.shortName || e.name,
      state: st.type?.state, // pre | in | post
      detail: st.type?.shortDetail || st.type?.detail || "",
      completed: !!st.type?.completed,
      venue: c.venue?.fullName,
      note: c.notes?.[0]?.headline,
      broadcasts: [...nets],
      link: e.links?.find((l: any) => (l.rel || []).includes("summary"))?.href || e.links?.[0]?.href,
      teams: (c.competitors || []).map((t: any) => ({
        abbr: t.team?.abbreviation,
        name: t.team?.shortDisplayName || t.team?.displayName,
        logo: t.team?.logo,
        score: score(t.score),
        homeAway: t.homeAway,
        winner: !!t.winner,
        record: t.records?.[0]?.summary,
      })),
    };
  });
  const live = events.some((e: any) => e.state === "in");
  return json({ events }, 200, live ? 20 : 120);
};

export const config = { path: "/api/sports" };

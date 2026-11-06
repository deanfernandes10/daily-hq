import { UA, json } from "../lib/shared.mts";

// Proxies ESPN's public scoreboard / teams API and trims it to what the dashboard needs.
// GET /api/sports?path=hockey/nhl&dates=20261101-20261113
// GET /api/sports?path=hockey/nhl&kind=teams
// ESPN is picky about query formats, so several are tried (most complete first) and failures are logged.

const score = (s: any) => (s && typeof s === "object" ? s.displayValue ?? s.value : s);

export default async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const path = p.get("path") || "";
  if (!/^[a-z]+\/[a-z0-9.\-]+$/.test(path)) return json({ error: "Unknown league" }, 400);
  const kind = p.get("kind") || "scoreboard";
  const dates = p.get("dates") || "";
  if (dates && !/^\d{8}(-\d{8})?$/.test(dates)) return json({ error: "Bad dates" }, 400);
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const variants =
    kind === "teams"
      ? ["teams", "teams?limit=100"]
      : [
          ...(dates ? [`scoreboard?dates=${dates}`, `scoreboard?dates=${dates}&limit=100`] : []),
          "scoreboard",
          `scoreboard?dates=${today}`,
        ];

  let d: any = null;
  let used = "";
  const errs: string[] = [];
  outer: for (const v of variants) {
    for (const host of ["site.api.espn.com", "site.web.api.espn.com"]) {
      try {
        const r = await fetch(`https://${host}/apis/site/v2/sports/${path}/${v}`, {
          headers: { "user-agent": UA, accept: "application/json" },
          signal: AbortSignal.timeout(7000),
        });
        if (!r.ok) {
          errs.push(`${host}/${v} -> ${r.status} ${(await r.text()).slice(0, 120).replace(/\s+/g, " ")}`);
          continue;
        }
        d = await r.json();
        used = `${host}/${v}`;
        break outer;
      } catch (e: any) {
        errs.push(`${host}/${v} -> ${e?.message || e}`);
      }
    }
  }
  if (errs.length) console.log(`ESPN ${path} ${used ? "OK via " + used + " after" : "FAILED"}:`, errs.join(" | "));
  if (!d) return json({ error: "ESPN unavailable" }, 502);

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
    return json({ teams, via: used }, 200, 86400);
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
  return json({ events, via: used }, 200, live ? 20 : 120);
};

export const config = { path: "/api/sports" };

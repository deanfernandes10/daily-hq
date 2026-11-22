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

  const event = p.get("event") || "";
  if (kind === "summary" && !/^\d{1,12}$/.test(event)) return json({ error: "Bad event" }, 400);
  if (kind === "raw" && !/^(golf\/(pga|lpga|eur|liv)|cricket\/scorepanel)$/.test(path)) return json({ error: "Unknown feed" }, 400);
  if (kind === "leaders") return leaders(path);
  if (kind === "news") return news(path, p.get("team") || "");
  const team = p.get("team") || "";
  const teamKinds = ["schedule", "team", "roster"];
  if (teamKinds.includes(kind) && !/^[a-z0-9]{1,12}$/i.test(team)) return json({ error: "Bad team" }, 400);
  if (kind === "summary" || kind === "standings" || kind === "raw" || teamKinds.includes(kind)) {
    const url =
      teamKinds.includes(kind)
        ? `https://site.api.espn.com/apis/site/v2/sports/${path}/teams/${team}${kind === "team" ? "" : `/${kind}`}`
        : kind === "raw"
        ? `https://site.api.espn.com/apis/site/v2/sports/${path}${path.startsWith("golf/") ? "/scoreboard" : ""}`
        : kind === "summary"
        ? `https://site.api.espn.com/apis/site/v2/sports/${path}/summary?event=${event}`
        : `https://site.api.espn.com/apis/v2/sports/${path}/standings${/^[123]$/.test(p.get("level") || "") ? `?level=${p.get("level")}` : ""}`;
    try {
      const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) { console.log(`ESPN ${kind} ${path} -> ${r.status}`); return json({ error: `ESPN ${r.status}` }, 502); }
      return json(await r.json(), 200, kind === "summary" || kind === "raw" ? 30 : kind === "schedule" || kind === "team" ? 600 : kind === "roster" ? 21600 : 900);
    } catch (e: any) {
      return json({ error: "ESPN unavailable" }, 502);
    }
  }

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
      odds: c.odds?.[0]?.details ? { details: c.odds[0].details, ou: c.odds[0].overUnder ?? null } : null,
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
  const leagueLogos = (d?.leagues?.[0]?.logos || []).map((l: any) => ({ href: l.href, rel: l.rel }));
  return json({ events, leagueLogos, via: used }, 200, live ? 20 : 120);
};

export const config = { path: "/api/sports" };


// Player stat leaders, normalised to { categories: [{ name, label, leaders: [{ name, team, headshot, value }] }] }.
// ESPN has two feeds; the site v3 one is tried first, then the core API (whose athletes come as links, resolved here).
const fetchJ = async (url: string, ms = 7000) => {
  const r = await fetch(url.replace(/^http:/, "https:"), { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};
const memo = new Map<string, any>();
async function ref(url: string) {
  if (!url) return null;
  if (memo.has(url)) return memo.get(url);
  try { const d = await fetchJ(url, 5000); memo.set(url, d); return d; } catch { return null; }
}
async function leaders(path: string) {
  const [sport, league] = path.split("/");
  const errs: string[] = [];
  try {
    const d = await fetchJ(`https://site.api.espn.com/apis/site/v3/sports/${path}/leaders`);
    const cats = d?.leaders?.categories || d?.categories || (Array.isArray(d?.leaders) ? d.leaders : []);
    const out = (cats || []).map((c: any) => ({
      name: c.name || c.abbreviation, label: c.displayName || c.shortDisplayName || c.name,
      leaders: (c.leaders || []).slice(0, 10).map((l: any) => ({
        name: l.athlete?.displayName || l.athlete?.shortName || l.displayName,
        team: l.athlete?.team?.abbreviation || l.team?.abbreviation || l.athlete?.teamShortName || "",
        headshot: l.athlete?.headshot?.href || l.athlete?.headshot || "",
        value: l.displayValue ?? l.value,
      })).filter((l: any) => l.name),
    })).filter((c: any) => c.leaders.length);
    if (out.length) return json({ categories: out, via: "site" }, 200, 3600);
    errs.push("site: empty");
  } catch (e: any) { errs.push(`site: ${e?.message || e}`); }
  try {
    const d = await fetchJ(`https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/leaders`);
    const cats = (d?.categories || []).slice(0, 8);
    const out = await Promise.all(cats.map(async (c: any) => ({
      name: c.name, label: c.displayName || c.shortDisplayName || c.name,
      leaders: (await Promise.all((c.leaders || []).slice(0, 5).map(async (l: any) => {
        const [a, t] = await Promise.all([ref(l.athlete?.$ref), ref(l.team?.$ref)]);
        return { name: a?.displayName || a?.fullName, team: t?.abbreviation || "", headshot: a?.headshot?.href || "", value: l.displayValue ?? l.value };
      }))).filter((l: any) => l.name),
    })));
    const ok = out.filter((c: any) => c.leaders.length);
    if (ok.length) return json({ categories: ok, via: "core" }, 200, 3600);
    errs.push("core: empty");
  } catch (e: any) { errs.push(`core: ${e?.message || e}`); }
  console.log(`ESPN leaders ${path} failed:`, errs.join(" | "));
  return json({ error: "Leaders unavailable" }, 502);
}


// ESPN league / team news, trimmed. GET /api/sports?path=hockey/nhl&kind=news[&team=11]
export function trimNews(d: any) {
  return (d?.articles || []).map((a: any) => ({
    id: a.id || a.dataSourceIdentifier || a.headline,
    title: a.headline || a.title,
    desc: a.description || "",
    date: a.published || a.lastModified,
    img: a.images?.find((i: any) => i.url && (i.type === "header" || i.type === "Media" || !i.type))?.url || a.images?.[0]?.url || "",
    link: a.links?.web?.href || a.links?.mobile?.href || "",
    plus: !!a.premium,
    video: a.type === "Media" || a.type === "video",
    teams: (a.categories || []).filter((c: any) => c.type === "team" && c.teamId).map((c: any) => String(c.teamId)),
  })).filter((a: any) => a.title && a.link);
}
async function news(path: string, team: string) {
  if (team && !/^\d{1,8}$/.test(team)) return json({ error: "Bad team" }, 400);
  const url = `https://site.api.espn.com/apis/site/v2/sports/${path}/news?limit=25${team ? `&team=${team}` : ""}`;
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(7000) });
    if (!r.ok) { console.log(`ESPN news ${path} ${team} -> ${r.status}`); return json({ error: `ESPN ${r.status}` }, 502); }
    return json({ articles: trimNews(await r.json()) }, 200, 600);
  } catch { return json({ error: "ESPN unavailable" }, 502); }
}

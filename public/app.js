/* Daily HQ — one-screen daily dashboard. Vanilla JS, no build step. */

// ============================================================ catalogs
const LEAGUES = {
  nfl: { name: "NFL", path: "football/nfl", icon: "🏈" },
  ncaaf: { name: "College Football", path: "football/college-football", icon: "🏈" },
  nba: { name: "NBA", path: "basketball/nba", icon: "🏀" },
  wnba: { name: "WNBA", path: "basketball/wnba", icon: "🏀" },
  ncaam: { name: "Men's College Basketball", path: "basketball/mens-college-basketball", icon: "🏀" },
  nhl: { name: "NHL", path: "hockey/nhl", icon: "🏒" },
  mlb: { name: "MLB", path: "baseball/mlb", icon: "⚾" },
  mls: { name: "MLS", path: "soccer/usa.1", icon: "⚽" },
  epl: { name: "Premier League", path: "soccer/eng.1", icon: "⚽" },
  ucl: { name: "Champions League", path: "soccer/uefa.champions", icon: "⚽" },
  laliga: { name: "La Liga", path: "soccer/esp.1", icon: "⚽" },
  seriea: { name: "Serie A", path: "soccer/ita.1", icon: "⚽" },
  bundesliga: { name: "Bundesliga", path: "soccer/ger.1", icon: "⚽" },
  ligue1: { name: "Ligue 1", path: "soccer/fra.1", icon: "⚽" },
};

const gnews = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
const SUGGESTED_FEEDS = {
  general: [
    ["NPR", "https://feeds.npr.org/1001/rss.xml"],
    ["BBC News", "https://feeds.bbci.co.uk/news/rss.xml"],
    ["Google News – US", "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"],
    ["CBC Top Stories", "https://www.cbc.ca/webfeed/rss/rss-topstories"],
    ["The Guardian – World", "https://www.theguardian.com/world/rss"],
    ["CBS News", "https://www.cbsnews.com/latest/rss/main"],
  ],
  sports: [
    ["CBS Sports", "https://www.cbssports.com/rss/headlines/"],
    ["Yahoo Sports", "https://sports.yahoo.com/rss/"],
    ["Google News – Sports", "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en"],
    ["NHL news", gnews("NHL")],
    ["NFL news", gnews("NFL")],
    ["NBA news", gnews("NBA")],
    ["Devils", gnews("New Jersey Devils")],
    ["Maple Leafs", gnews("Toronto Maple Leafs")],
  ],
  ai: [
    ["The Verge – AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"],
    ["TechCrunch – AI", "https://techcrunch.com/category/artificial-intelligence/feed/"],
    ["MIT Technology Review", "https://www.technologyreview.com/feed/"],
    ["Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"],
    ["Hacker News – Front page", "https://hnrss.org/frontpage"],
    ["VentureBeat – AI", "https://venturebeat.com/category/ai/feed/"],
  ],
  markets: [
    ["CNBC Top News", "https://www.cnbc.com/id/100003114/device/rss/rss.html"],
    ["MarketWatch", "https://feeds.content.dowjones.io/public/rss/mw_topstories"],
    ["Google News – Business", "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en"],
    ["CNBC Markets", "https://www.cnbc.com/id/15839069/device/rss/rss.html"],
  ],
  entertainment: [
    ["Variety", "https://variety.com/feed/"],
    ["Deadline", "https://deadline.com/feed/"],
    ["The Hollywood Reporter", "https://www.hollywoodreporter.com/feed/"],
    ["Rolling Stone", "https://www.rollingstone.com/feed/"],
  ],
  politics: [
    ["NPR Politics", "https://feeds.npr.org/1014/rss.xml"],
    ["Fox News Politics", "https://moxie.foxnews.com/google-publisher/politics.xml"],
    ["Politico", "https://rss.politico.com/politics-news.xml"],
    ["CBC Politics", "https://www.cbc.ca/webfeed/rss/rss-politics"],
    ["The Hill", "https://thehill.com/news/feed/"],
  ],
  realestate: [
    ["CNBC Real Estate", "https://www.cnbc.com/id/10000115/device/rss/rss.html"],
    ["US housing market", gnews("US housing market")],
    ["Canada housing market", gnews("Canada housing market")],
    ["Ontario & GTA real estate", gnews("GTA real estate market")],
    ["Mississauga real estate", gnews("Mississauga real estate")],
    ["New Jersey real estate", gnews("New Jersey housing market")],
    ["Mortgage rates", gnews("mortgage rates")],
  ],
  leadership: [
    ["CIO Dive", "https://www.ciodive.com/feeds/news/"],
    ["CIO.com", "https://www.cio.com/feed/"],
    ["Google News – Technology", "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en"],
    ["Google News – Managed services", "https://news.google.com/rss/search?q=%22managed%20services%22&hl=en-US&gl=US&ceid=US:en"],
  ],
};

const feedsFrom = (cat, n) => SUGGESTED_FEEDS[cat].slice(0, n).map(([name, url]) => ({ name, url, on: true }));

const DEFAULTS = {
  version: 4,
  name: "Dean",
  theme: "dark",
  units: "F",
  textSize: "standard",
  showApps: false,
  apps: [
    { name: "Executive Search", url: "https://dean-executive-search.netlify.app", icon: "💼" },
    { name: "United Airlines", url: "https://www.united.com", icon: "✈️" },
  ],
  sections: [
    { id: "sports", on: true, w: 8 },
    { id: "weather", on: true, w: 4 },
    { id: "news", on: true, w: 12 },
    { id: "markets", on: true, w: 12 },
  ],
  sports: {
    mode: "mine",
    leagues: [
      { key: "nhl", teams: ["NJ", "TOR", "NYR"], showAll: false },
      { key: "nfl", teams: ["NYG", "NYJ"], showAll: false },
      { key: "nba", teams: ["NY", "TOR"], showAll: false },
      { key: "mlb", teams: ["NYY", "TOR"], showAll: false },
    ],
  },
  news: {
    perCategory: 24,
    categories: [
      { id: "general", name: "Top News", on: true, feeds: feedsFrom("general", 3) },
      { id: "sports", name: "Sports", on: true, feeds: feedsFrom("sports", 3) },
      { id: "ai", name: "AI & Tech", on: true, feeds: feedsFrom("ai", 4) },
      { id: "markets", name: "Market Watch", on: true, feeds: feedsFrom("markets", 3) },
      { id: "entertainment", name: "Entertainment", on: true, feeds: feedsFrom("entertainment", 3) },
      { id: "politics", name: "Politics", on: true, feeds: feedsFrom("politics", 4) },
      { id: "realestate", name: "Real Estate", on: true, feeds: feedsFrom("realestate", 5) },
      { id: "leadership", name: "Tech Leadership", on: true, feeds: feedsFrom("leadership", 3) },
    ],
  },
  weather: {
    cities: [
      { name: "Manalapan, NJ", lat: 40.2806, lon: -74.3446 },
      { name: "New York, NY", lat: 40.7128, lon: -74.006 },
      { name: "Mississauga, ON", lat: 43.589, lon: -79.6441 },
    ],
  },
  ticker: {
    on: false,
    symbols: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^GSPTSE", "^TNX", "BTC-USD", "GC=F", "CL=F", "CAD=X", "NVDA", "MSFT", "AAPL"],
  },
  markets: {
    view: "tiles",
    groups: [
      { name: "Indices", symbols: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^GSPTSE"] },
      { name: "Watchlist", symbols: ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "AVGO", "TSLA", "CSCO", "ORCL"] },
      { name: "Rates, FX, Crypto & Commodities", symbols: ["^TNX", "CAD=X", "BTC-USD", "ETH-USD", "GC=F", "CL=F"] },
    ],
  },
};

const SECTION_META = {
  sports: { title: "Sports", icon: "🏟️" },
  news: { title: "News", icon: "📰" },
  weather: { title: "Weather", icon: "🌤️" },
  markets: { title: "Markets", icon: "📈" },
};

const FRIENDLY = {
  "^GSPC": "S&P 500", "^DJI": "Dow", "^IXIC": "Nasdaq", "^RUT": "Russell 2000", "^VIX": "VIX",
  "^GSPTSE": "TSX", "^TNX": "10Y Yield", "BTC-USD": "Bitcoin", "ETH-USD": "Ether", "GC=F": "Gold",
  "CL=F": "Crude Oil", "CAD=X": "USD/CAD", "SI=F": "Silver", "NG=F": "Nat Gas", "EURUSD=X": "EUR/USD",
  "^FTSE": "FTSE 100", "^N225": "Nikkei", "^STOXX50E": "Euro Stoxx 50",
};

// ============================================================ state
const KEY = "dailyhq.config.v1";
const VISIT_KEY = "dailyhq.lastVisit";
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const clone = (o) => JSON.parse(JSON.stringify(o));

function migrate(c) {
  const d = clone(DEFAULTS);
  for (const k of Object.keys(d)) if (c[k] === undefined) c[k] = d[k];
  c.sports.mode ??= "mine";
  c.markets.view ??= "tiles";
  if ((c.version || 1) < 2) {
    // v2 added Politics and Real Estate tabs
    const at = Math.max(0, c.news.categories.findIndex((x) => x.id === "leadership"));
    for (const id of ["realestate", "politics"])
      if (!c.news.categories.some((x) => x.id === id)) c.news.categories.splice(at, 0, d.news.categories.find((x) => x.id === id));
    c.version = 2;
  }
  if (c.version < 3) {
    // v3: apps live under More; replace feeds that block cloud servers
    c.showApps = false;
    const swap = {
      "https://www.espn.com/espn/rss/news": ["Google News – Sports", "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en"],
      "https://finance.yahoo.com/news/rssindex": ["Google News – Business", "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en"],
      "https://feeds.hbr.org/harvardbusiness": ["Google News – Technology", "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en"],
    };
    for (const cat of c.news.categories) for (const f of cat.feeds) if (swap[f.url]) [f.name, f.url] = swap[f.url];
    c.version = 3;
  }
  if (c.version < 4) {
    c.ticker.on = false; // v4: no scrolling ticker by default (can be turned back on in Customize)
    c.version = 4;
  }
  return c;
}
function loadCfg() {
  try {
    const s = JSON.parse(store.get(KEY));
    if (s && s.version >= 1) return migrate(s);
  } catch {}
  return clone(DEFAULTS);
}
let cfg = loadCfg();
const save = () => store.set(KEY, JSON.stringify(cfg));

const prevVisit = Number(store.get(VISIT_KEY)) || Date.now() - 6 * 3600e3;
const markVisit = () => store.set(VISIT_KEY, String(Date.now()));
addEventListener("pagehide", markVisit);
document.addEventListener("visibilitychange", () => document.hidden && markVisit());

const data = { sports: [], news: {}, weather: [], quotes: {}, updated: {} };
let newsSource = {};
const CACHE_KEY = "dailyhq.snapshot.v1";
function saveSnapshot() {
  clearTimeout(saveSnapshot.t);
  saveSnapshot.t = setTimeout(() => {
    const news = {};
    for (const [k, v] of Object.entries(data.news))
      news[k] = { items: v.items.slice(0, 40).map((i) => ({ ...i, desc: (i.desc || "").slice(0, 160) })), errors: [], empty: v.empty };
    store.set(CACHE_KEY, JSON.stringify({ t: Date.now(), units: cfg.units, sports: data.sports, weather: data.weather, quotes: data.quotes, news }));
  }, 1500);
}
function loadSnapshot() {
  try {
    const c = JSON.parse(store.get(CACHE_KEY));
    if (!c) return false;
    data.sports = c.sports || [];
    data.weather = c.units === cfg.units ? c.weather || [] : [];
    data.quotes = c.quotes || {};
    data.news = c.news || {};
    data.snapshotAt = c.t;
    return true;
  } catch { return false; }
}
let activeNews = null;
let newsLimit = {};
let newsFilter = "";
let anyLive = false;

// ============================================================ utils
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const hashStr = (str) => { let h = 7; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

async function api(url, asText = false) {
  const r = await fetch(url);
  if (!r.ok) {
    let msg = `${r.status}`;
    try { msg = asText ? await r.text() : (await r.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return asText ? r.text() : r.json();
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 2200);
}

const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const sameDay = (a, b) => a.toDateString() === b.toDateString();

function when(iso) {
  const d = new Date(iso);
  const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay(d, new Date())) return `Today ${t}`;
  if (sameDay(d, addDays(1))) return `Tomorrow ${t}`;
  if (sameDay(d, addDays(-1))) return `Yesterday`;
  return `${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} ${t}`;
}

function dayLabel(iso) {
  const d = new Date(iso);
  if (sameDay(d, new Date())) return "Today";
  if (sameDay(d, addDays(-1))) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function ago(ts) {
  if (!ts) return "";
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const fmtNum = (n, d = 2) =>
  n == null || isNaN(n) ? "—" : Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const priceDigits = (p) => (p == null ? 2 : Math.abs(p) >= 1000 ? 2 : Math.abs(p) < 10 ? 3 : 2);
const label = (sym) => FRIENDLY[sym] || sym;
const cls = (n) => (n == null ? "" : n >= 0 ? "up" : "down");
const sign = (n) => (n > 0 ? "+" : "");

function nyNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return { day: parts.weekday, mins: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
}
function marketOpen() {
  const { day, mins } = nyNow();
  return !["Sat", "Sun"].includes(day) && mins >= 570 && mins < 960;
}

// ============================================================ shell
function applyTheme() {
  const t = cfg.theme === "auto" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : cfg.theme;
  document.documentElement.dataset.theme = t;
  $('meta[name="theme-color"]').content = t === "light" ? "#e9edf4" : "#070a11";
  document.documentElement.dataset.text = cfg.textSize || "standard";
}

function tickClock() {
  const now = new Date();
  const h = now.getHours();
  const part = h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  $("#greet").textContent = cfg.name ? `${part}, ${cfg.name}` : part;
  $("#date").textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) +
    " · " + now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function buildShell() {
  const grid = $("#grid");
  const on = cfg.sections.filter((s) => s.on);
  grid.innerHTML = on
    .map((s) => {
      const m = SECTION_META[s.id];
      return `<section class="card w-${s.w || 12}" id="sec-${s.id}" data-sec="${s.id}">
        <div class="card-head">
          <h2><span class="ico">${m.icon}</span>${m.title}</h2><span class="sub" id="${s.id}-sub"></span>
          <span class="spacer"></span>
          <span id="${s.id}-extra"></span>
          <button class="mini-btn" data-config="${s.id}" title="Customize ${m.title}">Edit</button>
          <button class="mini-btn" data-reload="${s.id}" title="Refresh">⟳</button>
        </div>
        <div class="card-body" id="${s.id}-body">${skeleton(4)}</div>
      </section>`;
    })
    .join("") || `<div class="card w-12"><div class="empty">All sections are hidden. <br><button class="btn" data-config="general">Customize</button></div></div>`;

  $("#jump").innerHTML = on.map((s) => `<a href="#sec-${s.id}" data-sec="${s.id}">${SECTION_META[s.id].icon} ${SECTION_META[s.id].title}</a>`).join("");
  $("#ticker").hidden = !cfg.ticker.on;
}

const skeleton = (n) => Array.from({ length: n }, (_, i) => `<div class="skeleton" style="width:${90 - i * 12}%"></div>`).join("");
const emptyState = (msg, tab) => `<div class="empty">${msg}<br><button class="btn sm" data-config="${tab}">Set it up</button></div>`;
const sectionOn = (id) => cfg.sections.some((s) => s.id === id && s.on);
const hm = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
function stamp(id, stale = false) {
  data.updated[id] = Date.now();
  const el = $(`#${id}-sub`);
  if (el) el.innerHTML = stale ? `<span class="stale" title="Some sources didn't respond — showing the last data received">Partly delayed · ${hm(Date.now())}</span>` : `Updated ${hm(Date.now())}`;
  saveSnapshot();
}
function stampSnapshot() {
  if (!data.snapshotAt) return;
  for (const id of ["sports", "weather", "news", "markets"]) {
    const el = $(`#${id}-sub`);
    if (el && !data.updated[id]) el.textContent = `Last saved ${hm(data.snapshotAt)} · refreshing…`;
  }
}

// ============================================================ sports
// Scores come straight from ESPN in the browser (ESPN blocks many cloud servers); the server proxy is the backup.
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/";
const espnScore = (s) => (s && typeof s === "object" ? s.displayValue ?? s.value : s);
function trimEvents(d) {
  return (d?.events || []).map((e) => {
    const c = e.competitions?.[0] || {};
    const st = e.status || c.status || {};
    const nets = new Set();
    for (const b of c.broadcasts || []) for (const n of b.names || []) nets.add(n);
    for (const g of c.geoBroadcasts || []) if (g?.media?.shortName) nets.add(g.media.shortName);
    return {
      id: e.id, date: e.date, name: e.shortName || e.name,
      state: st.type?.state, detail: st.type?.shortDetail || st.type?.detail || "", completed: !!st.type?.completed,
      venue: c.venue?.fullName, note: c.notes?.[0]?.headline, broadcasts: [...nets],
      link: e.links?.find((l) => (l.rel || []).includes("summary"))?.href || e.links?.[0]?.href,
      teams: (c.competitors || []).map((t) => ({
        abbr: t.team?.abbreviation, name: t.team?.shortDisplayName || t.team?.displayName, logo: t.team?.logo,
        score: espnScore(t.score), homeAway: t.homeAway, winner: !!t.winner, record: t.records?.[0]?.summary,
      })),
    };
  });
}
async function espnJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
let espnMode = null; // remembers which request format ESPN accepted: "range" | "days" | "proxy"
async function fetchScoreboard(path, dates) {
  const tries = {
    range: async () => trimEvents(await espnJSON(`${ESPN}${path}/scoreboard?dates=${dates}`)),
    days: async () => {
      // one request per day (yesterday-3 … +6), merged
      const days = [...Array(10)].map((_, i) => ymd(addDays(i - 3)));
      const res = await Promise.allSettled(days.map((d) => espnJSON(`${ESPN}${path}/scoreboard?dates=${d}`)));
      const ok = res.filter((r) => r.status === "fulfilled");
      if (!ok.length) throw new Error("no days");
      const seen = new Set();
      return ok.flatMap((r) => trimEvents(r.value)).filter((e) => !seen.has(e.id) && seen.add(e.id));
    },
    proxy: async () => (await api(`/api/sports?path=${path}&dates=${dates}`)).events,
  };
  const order = espnMode ? [espnMode, ...Object.keys(tries).filter((k) => k !== espnMode)] : Object.keys(tries);
  let lastErr;
  for (const k of order) {
    try {
      const ev = await tries[k]();
      espnMode = k;
      return ev;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Scores unavailable");
}
async function fetchTeams(path) {
  try {
    const d = await espnJSON(`${ESPN}${path}/teams`);
    return (d?.sports?.[0]?.leagues?.[0]?.teams || []).map((x) => x.team).filter(Boolean)
      .map((t) => ({ id: t.id, abbr: t.abbreviation, name: t.displayName, short: t.shortDisplayName, logo: t.logos?.[0]?.href }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return (await api(`/api/sports?path=${path}&kind=teams`)).teams;
  }
}
async function loadSports() {
  const body = $("#sports-body");
  if (!body) return;
  const leagues = cfg.sports.leagues.filter((L) => LEAGUES[L.key]);
  if (!leagues.length) { body.innerHTML = emptyState("No leagues selected yet.", "sports"); return; }
  const range = `${ymd(addDays(-7))}-${ymd(addDays(7))}`;
  const prev = Object.fromEntries((data.sports || []).map((r) => [r.L.key, r]));
  data.sports = await Promise.all(
    leagues.map(async (L) => {
      try {
        return { L, events: await fetchScoreboard(LEAGUES[L.key].path, range) };
      } catch (e) {
        const p = prev[L.key];
        return p?.events ? { L, events: p.events, stale: true } : { L, error: e.message };
      }
    })
  );
  anyLive = data.sports.some((r) => r.events?.some((e) => e.state === "in"));
  renderSports();
  stamp("sports", data.sports.some((r) => r.stale || r.error));
  updateGlance();
}

function pickGames(L, events) {
  const evs = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const watched = L.teams || [];
  let out = [];
  for (const ab of watched) {
    const mine = evs.filter((e) => e.teams.some((t) => t.abbr === ab));
    const live = mine.filter((e) => e.state === "in");
    const last = mine.filter((e) => e.state === "post").at(-1);
    const next = mine.find((e) => e.state === "pre");
    out.push(...live);
    if (!live.length && last) out.push(last);
    if (next && !L.compact) out.push(next);
  }
  if (L.showAll || !watched.length) {
    out.push(...evs.filter((e) => e.state === "in" || sameDay(new Date(e.date), new Date())));
  }
  const seen = new Set();
  out = out.filter((e) => e && !seen.has(e.id) && seen.add(e.id));
  const rank = { in: 0, post: 1, pre: 2 };
  return out.sort((a, b) => rank[a.state] - rank[b.state] || new Date(a.date) - new Date(b.date));
}

function gameHTML(e, watched) {
  const teams = [...e.teams].sort((a, b) => (a.homeAway === "away" ? 0 : 1) - (b.homeAway === "away" ? 0 : 1));
  const pill =
    e.state === "in" ? `<span class="pill live">LIVE</span> ${esc(e.detail)}`
    : e.state === "post" ? `<span class="pill final">${esc(e.detail || "Final")}</span> ${esc(dayLabel(e.date))}`
    : `<span class="pill">${esc(when(e.date))}</span>`;
  const showScore = e.state !== "pre";
  const rows = teams
    .map((t) => {
      const lose = e.state === "post" && teams.some((o) => o.winner) && !t.winner;
      return `<div class="g-team ${lose ? "lose" : ""} ${watched.includes(t.abbr) ? "mine" : ""}">
        ${t.logo ? `<img src="${esc(t.logo)}" alt="" loading="lazy">` : "<span></span>"}
        <span class="nm">${esc(t.name)}${t.record ? `<small>${esc(t.record)}</small>` : ""}</span>
        <span class="sc">${showScore ? esc(t.score ?? "") : ""}</span>
      </div>`;
    })
    .join("");
  const meta = [];
  if (e.broadcasts?.length) meta.push(`<span class="tv">${esc(e.broadcasts.slice(0, 4).join(", "))}</span>`);
  if (e.state === "pre" && e.venue) meta.push(esc(e.venue));
  if (e.note) meta.push(esc(e.note));
  if (e.link) meta.push(`<a href="${esc(e.link)}" target="_blank" rel="noopener">Game ↗</a>`);
  return `<div class="game ${e.state === "in" ? "is-live" : e.state === "post" ? "is-final" : ""}"><div class="g-status">${pill}</div>${rows}${meta.length ? `<div class="g-meta">${meta.join("<span>·</span>")}</div>` : ""}</div>`;
}

const SP_MODES = [["mine", "My teams"], ["-1", "Yesterday"], ["0", "Today"], ["1", "Tomorrow"]];
const isMine = (L, e) => (L.teams || []).some((ab) => e.teams.some((t) => t.abbr === ab));
const matchup = (e) => {
  const away = e.teams.find((t) => t.homeAway === "away"), home = e.teams.find((t) => t.homeAway === "home");
  return away && home ? `${away.name} @ ${home.name}` : e.name;
};

function renderSports() {
  const body = $("#sports-body");
  if (!body) return;
  if (!data.sports.length) return;
  const mode = cfg.sports.mode || "mine";
  const seg = `<div class="sp-bar"><div class="seg" role="tablist">${SP_MODES.map(([v, l]) => `<button data-spmode="${v}" class="${mode === v ? "on" : ""}">${l}</button>`).join("")}</div></div>`;

  let upnext = "";
  if (mode === "mine") {
    const seenUp = new Set();
    const ups = data.sports
      .flatMap(({ L, events }) =>
        (L.teams || []).map((ab) => {
          const e = (events || []).filter((x) => x.state === "pre" && x.teams.some((t) => t.abbr === ab)).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
          return e && { e, L };
        })
      )
      .filter((x) => x && !seenUp.has(x.e.id) && seenUp.add(x.e.id))
      .sort((a, b) => new Date(a.e.date) - new Date(b.e.date));
    if (ups.length)
      upnext = `<div class="upnext"><div class="upnext-h">📅 Coming up for your teams</div>${ups
        .map(({ e, L }) => `<div class="up-row ${sameDay(new Date(e.date), new Date()) ? "today" : ""}"><span class="up-when">${esc(when(e.date))}</span><span class="up-ico">${LEAGUES[L.key].icon}</span><span class="up-name">${esc(matchup(e))}</span><span class="up-tv">${esc((e.broadcasts || []).slice(0, 2).join(", "))}</span></div>`)
        .join("")}</div>`;
  }

  const tiles = data.sports
    .map(({ L, events, error, stale }) => {
      const meta = LEAGUES[L.key];
      if (!meta) return "";
      let inner;
      if (error) inner = `<div class="err">Couldn't load ${meta.name} right now — will retry.</div>`;
      else {
        let games, none;
        if (mode === "mine") {
          games = pickGames({ ...L, compact: true }, events);
          none = events.length ? "No recent results — next games are listed above." : "No games this week — likely off-season.";
        } else {
          const day = addDays(+mode);
          const rank = { in: 0, pre: 1, post: 2 };
          games = events.filter((e) => sameDay(new Date(e.date), day)).sort((a, b) => rank[a.state] - rank[b.state] || new Date(a.date) - new Date(b.date));
          none = `No ${meta.name} games ${mode === "0" ? "today" : mode === "1" ? "tomorrow" : "yesterday"}.`;
        }
        inner = games.length ? games.map((g) => gameHTML(g, L.teams || [])).join("") : `<div class="empty">${none}</div>`;
      }
      const tl = mode === "mine" ? `${(L.teams || []).join(" · ") || "All games"} · Live & latest` : SP_MODES.find((m) => m[0] === mode)[1];
      const collapsed = !!cfg.sports.collapsed?.[L.key];
      const liveN = (events || []).filter((e) => e.state === "in" && (mode !== "mine" || isMine(L, e))).length;
      return `<div class="league ${collapsed ? "collapsed" : ""}">
        <button class="league-h" data-league-toggle="${L.key}" aria-expanded="${!collapsed}">
          <span class="chev" aria-hidden="true">▾</span><span class="lg-name">${meta.icon} ${meta.name}</span>
          ${liveN ? `<span class="pill live">${liveN} LIVE</span>` : ""}
          <small>${stale ? `<span class="stale">delayed</span> ` : ""}${esc(tl)}</small>
        </button>
        <div class="league-body">${inner}</div></div>`;
    })
    .join("");
  body.innerHTML = seg + upnext + `<div class="leagues">${tiles}</div>`;
  updateBadges();
}

// ============================================================ news
function parseFeed(xml, feed) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("Unreadable feed");
  const nodes = [...doc.getElementsByTagName("item"), ...doc.getElementsByTagName("entry")];
  return nodes.slice(0, 40).map((n) => {
    const get = (tag) => n.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
    const strip = (s) => {
      const d = new DOMParser().parseFromString(s, "text/html");
      return (d.body.textContent || "").replace(/\s+/g, " ").trim();
    };
    let link = get("link");
    if (!/^https?:/.test(link)) {
      const l = [...n.getElementsByTagName("link")].find((x) => !x.getAttribute("rel") || x.getAttribute("rel") === "alternate");
      link = l?.getAttribute("href") || "";
    }
    const src = get("source");
    let title = strip(get("title"));
    if (src && title.endsWith(` - ${src}`)) title = title.slice(0, -(src.length + 3));
    const descRaw = get("description") || get("summary") || get("content");
    let img =
      n.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url") ||
      [...n.getElementsByTagName("media:content")].find((m) => (m.getAttribute("medium") || m.getAttribute("type") || "image").startsWith("image"))?.getAttribute("url") ||
      [...n.getElementsByTagName("enclosure")].find((m) => (m.getAttribute("type") || "").startsWith("image"))?.getAttribute("url") ||
      (descRaw.match(/<img[^>]+src=["']([^"']+)/i) || [])[1] ||
      "";
    if (img && !/^https:/.test(img)) img = "";
    const ds = get("pubDate") || get("published") || get("updated") || get("dc:date");
    const ts = ds ? Date.parse(ds) : NaN;
    return {
      title,
      link,
      source: src || feed.name,
      feed: feed.name,
      ts: isNaN(ts) ? 0 : ts,
      img,
      desc: strip(descRaw).slice(0, 260),
    };
  });
}

async function loadNews() {
  const body = $("#news-body");
  if (!body) return;
  const cats = cfg.news.categories.filter((c) => c.on);
  if (!cats.length) { body.innerHTML = emptyState("No news categories turned on.", "news"); return; }
  if (!activeNews || !cats.some((c) => c.id === activeNews)) activeNews = cats[0].id;
  // load active first so the visible tab fills quickly
  const order = [cats.find((c) => c.id === activeNews), ...cats.filter((c) => c.id !== activeNews)];
  const first = loadCategory(order[0]).then(renderNews);
  await first;
  await Promise.all(order.slice(1).map(loadCategory));
  renderNews();
  stamp("news", Object.values(data.news).some((d) => d.stale));
  updateGlance();
}

async function loadCategory(cat) {
  const feeds = cat.feeds.filter((f) => f.on);
  const results = await Promise.all(
    feeds.map(async (f) => {
      try {
        const xml = await api(`/api/feed?url=${encodeURIComponent(f.url)}`, true);
        return { items: parseFeed(xml, f) };
      } catch (e) {
        return { error: `${f.name}: ${e.message}`, items: [] };
      }
    })
  );
  const seen = new Set();
  const items = results
    .flatMap((r) => r.items)
    .filter((i) => i.title && i.link)
    .filter((i) => {
      const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .filter((i) => !i.ts || i.ts > Date.now() - 4 * 86400e3)
    .sort((a, b) => b.ts - a.ts);
  const errors = results.filter((r) => r.error).map((r) => r.error);
  const prev = data.news[cat.id];
  if (!items.length && errors.length && prev?.items?.length) {
    data.news[cat.id] = { ...prev, errors, stale: true };
    return;
  }
  data.news[cat.id] = { items, errors, empty: !feeds.length };
}

function renderNews() {
  const body = $("#news-body");
  if (!body) return;
  const cats = cfg.news.categories.filter((c) => c.on);
  const tabs = cats
    .map((c) => {
      const d = data.news[c.id];
      const fresh = d ? d.items.filter((i) => i.ts > prevVisit).length : 0;
      return `<button data-news="${c.id}" class="${c.id === activeNews ? "on" : ""}">${esc(c.name)}${fresh ? `<span class="dot" title="New since your last visit">${fresh}</span>` : ""}</button>`;
    })
    .join("");
  const d = data.news[activeNews];
  let list;
  if (!d) list = skeleton(6);
  else if (d.empty) list = emptyState("No feeds in this category.", "news");
  else {
    const q = newsFilter.toLowerCase();
    const src = newsSource[activeNews] || "";
    let items = src ? d.items.filter((i) => i.feed === src) : d.items;
    if (q) items = items.filter((i) => (i.title + " " + i.source + " " + i.desc).toLowerCase().includes(q));
    const limit = newsLimit[activeNews] || cfg.news.perCategory;
    const shown = items.slice(0, limit);
    const heroIdx = q ? -1 : shown.findIndex((i, idx) => idx < 4 && i.img);
    const hero = heroIdx >= 0 ? shown.splice(heroIdx, 1)[0] : null;
    const newDot = (i) => (i.ts > prevVisit ? `<span class="new" title="New since last visit"></span>` : "");
    list =
      `<div class="news-wrap">` +
      (hero
        ? `<a class="hero" href="${esc(hero.link)}" target="_blank" rel="noopener"><img src="${esc(hero.img)}" alt="" loading="lazy" onerror="this.remove()">
            <div><div class="meta">${newDot(hero)}${esc(hero.source)} · ${ago(hero.ts)}</div><h3>${esc(hero.title)}</h3><p>${esc(hero.desc)}</p></div></a>`
        : "") +
      shown
        .map(
          (i) => `<div class="item ${i.img ? "" : "noimg"}"><div>
            <a class="t" href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a>
            <div class="meta">${newDot(i)}${esc(i.source)}${i.ts ? ` · ${ago(i.ts)}` : ""}</div></div>
            ${i.img ? `<img src="${esc(i.img)}" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()">` : ""}</div>`
        )
        .join("") +
      `</div>` +
      (items.length > limit ? `<div class="more"><button class="btn sm" data-more="1">Show more (${items.length - limit})</button></div>` : "") +
      (!items.length ? `<div class="empty">${q ? "No headlines match your filter." : "No headlines right now."}</div>` : "") +
      (d.errors.length ? `<div class="err">Some feeds didn't load: ${esc(d.errors.join(" · "))}</div>` : "");
  }
  const hadFocus = document.activeElement?.id === "newsFilter";
  const catCfg = cats.find((c) => c.id === activeNews);
  const feedsOn = (catCfg?.feeds || []).filter((f) => f.on);
  const srcSel = newsSource[activeNews] || "";
  const srcChips = feedsOn.length > 1
    ? `<div class="src-chips"><button data-src="" class="${!srcSel ? "on" : ""}">All sources</button>${feedsOn.map((f) => `<button data-src="${esc(f.name)}" class="${srcSel === f.name ? "on" : ""}">${esc(f.name.replace(/^Topic: /, ""))}</button>`).join("")}</div>`
    : "";
  body.innerHTML = `<div class="tabs">${tabs}</div>
    ${srcChips}
    <div class="news-tools"><input id="newsFilter" type="search" placeholder="Filter headlines…  ( / )" value="${esc(newsFilter)}"></div>
    ${list}`;
  updateBadges();
  if (hadFocus) { const f = $("#newsFilter"); f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
}

// ============================================================ weather
const WMO = {
  0: ["☀️", "Clear"], 1: ["🌤️", "Mostly clear"], 2: ["⛅", "Partly cloudy"], 3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"], 48: ["🌫️", "Icy fog"], 51: ["🌦️", "Light drizzle"], 53: ["🌦️", "Drizzle"], 55: ["🌧️", "Heavy drizzle"],
  56: ["🌧️", "Freezing drizzle"], 57: ["🌧️", "Freezing drizzle"], 61: ["🌦️", "Light rain"], 63: ["🌧️", "Rain"], 65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain"], 67: ["🌧️", "Freezing rain"], 71: ["🌨️", "Light snow"], 73: ["🌨️", "Snow"], 75: ["❄️", "Heavy snow"],
  77: ["🌨️", "Snow grains"], 80: ["🌦️", "Showers"], 81: ["🌧️", "Showers"], 82: ["⛈️", "Violent showers"], 85: ["🌨️", "Snow showers"],
  86: ["❄️", "Snow showers"], 95: ["⛈️", "Thunderstorm"], 96: ["⛈️", "Storm & hail"], 99: ["⛈️", "Storm & hail"],
};
const wmo = (c, day = 1) => {
  const w = WMO[c] || ["🌡️", "—"];
  if (!day && (c === 0 || c === 1)) return ["🌙", w[1]];
  return w;
};

async function loadWeather() {
  const body = $("#weather-body");
  if (!body) return;
  const cities = cfg.weather.cities;
  if (!cities.length) { body.innerHTML = emptyState("No cities yet.", "weather"); return; }
  const F = cfg.units === "F";
  const prevW = Object.fromEntries((data.weather || []).map((w) => [w.c.name, w]));
  data.weather = await Promise.all(
    cities.map(async (c) => {
      const alertsP = api(`/api/alerts?lat=${c.lat}&lon=${c.lon}`).then((d) => d.alerts).catch(() => prevW[c.name]?.alerts || []);
      const u = new URL("https://api.open-meteo.com/v1/forecast");
      Object.entries({
        latitude: c.lat, longitude: c.lon, timezone: "auto", forecast_days: 7,
        current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day",
        hourly: "temperature_2m,precipitation_probability,weather_code,is_day",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
        temperature_unit: F ? "fahrenheit" : "celsius", wind_speed_unit: F ? "mph" : "kmh",
      }).forEach(([k, v]) => u.searchParams.set(k, v));
      try { return { c, d: await api(u), alerts: await alertsP }; }
      catch (e) { const p = prevW[c.name]; return p?.d ? { ...p, c, stale: true, alerts: await alertsP } : { c, error: e.message }; }
    })
  );
  renderWeather();
  stamp("weather", data.weather.some((w) => w.stale || w.error));
  updateGlance();
}

function renderWeather() {
  const body = $("#weather-body");
  if (!body) return;
  if (!data.weather.length) return;
  const F = cfg.units === "F";
  const wind = F ? "mph" : "km/h";
  body.innerHTML = `<div class="wx-list">${data.weather
    .map(({ c, d, error, alerts }, idx) => {
      if (error) return `<div class="wx"><div class="wx-city">${esc(c.name)}</div><div class="err">Weather unavailable</div></div>`;
      const cur = d.current, dl = d.daily, hr = d.hourly;
      const [ico, desc] = wmo(cur.weather_code, cur.is_day);
      // hourly from the current hour (times are local to the city)
      const nowIdx = Math.max(0, hr.time.findIndex((t) => t >= cur.time.slice(0, 13)));
      const hours = hr.time.slice(nowIdx, nowIdx + 12).map((t, i) => {
        const j = nowIdx + i;
        const hh = Number(t.slice(11, 13));
        const lbl = i === 0 ? "Now" : `${hh % 12 || 12}${hh < 12 ? "a" : "p"}`;
        return `<div class="wx-h">${lbl}<span style="display:block;font-size:16px">${wmo(hr.weather_code[j], hr.is_day[j])[0]}</span><b>${Math.round(i === 0 ? cur.temperature_2m : hr.temperature_2m[j])}°</b>${hr.precipitation_probability[j] >= 20 ? `<span class="rp">${hr.precipitation_probability[j]}%</span>` : "&nbsp;"}</div>`;
      });
      const lo = Math.min(...dl.temperature_2m_min), hi = Math.max(...dl.temperature_2m_max);
      const days = dl.time.map((t, i) => {
        const name = i === 0 ? "Today" : new Date(t + "T12:00").toLocaleDateString([], { weekday: "short" });
        const a = ((dl.temperature_2m_min[i] - lo) / (hi - lo || 1)) * 100, b = ((dl.temperature_2m_max[i] - lo) / (hi - lo || 1)) * 100;
        return `<div class="wx-d"><span>${name}</span><span>${wmo(dl.weather_code[i])[0]}</span><span class="lo">${Math.round(dl.temperature_2m_min[i])}°</span>
          <div class="bar"><i style="left:${a}%;right:${100 - b}%"></i></div><span>${Math.round(dl.temperature_2m_max[i])}°</span></div>`;
      });
      const sun = (s) => { const hh = +s.slice(11, 13); return `${hh % 12 || 12}:${s.slice(14, 16)} ${hh < 12 ? "AM" : "PM"}`; };
      const sev = (a) => (["extreme", "severe"].includes(a.severity) ? "sev-high" : a.severity === "moderate" ? "sev-mid" : "sev-low");
      const alertHTML = (alerts || [])
        .slice(0, 2)
        .map((a) => `<a class="wx-alert ${sev(a)}" href="${esc(a.url)}" target="_blank" rel="noopener" title="${esc(a.headline || a.event)} — ${esc(a.source)}">⚠️ <b>${esc(a.event)}</b>${a.ends ? ` · until ${esc(when(a.ends))}` : ""}</a>`)
        .join("");
      return `<div class="wx ${alerts?.length ? "has-alert" : ""}" data-wx="${idx}">
        ${alertHTML}
        <div class="wx-top"><div class="wx-ico">${ico}</div>
          <div><div class="wx-city">${esc(c.name)}</div><div class="wx-temp">${Math.round(cur.temperature_2m)}°</div></div>
          <div class="wx-right"><div><b>${esc(desc)}</b></div>
            <div>H ${Math.round(dl.temperature_2m_max[0])}° · L ${Math.round(dl.temperature_2m_min[0])}° · Feels ${Math.round(cur.apparent_temperature)}°</div>
            <div>💨 ${Math.round(cur.wind_speed_10m)} ${wind} · 💧 ${cur.relative_humidity_2m}% · ☔ ${dl.precipitation_probability_max[0] ?? 0}%</div>
          </div></div>
        <div class="wx-hours">${hours.join("")}</div>
        <div class="wx-days">${days.join("")}<div class="meta">🌅 ${sun(dl.sunrise[0])} · 🌇 ${sun(dl.sunset[0])}</div></div>
      </div>`;
    })
    .join("")}</div><div class="meta" style="justify-content:center;margin-top:8px">Tap a city for the 7-day forecast · Alerts: NWS (US) & Environment Canada</div>`;
  updateBadges();
}

// ============================================================ markets
function allSymbols() {
  const s = new Set();
  if (cfg.ticker.on) cfg.ticker.symbols.forEach((x) => s.add(x));
  if (sectionOn("markets")) cfg.markets.groups.forEach((g) => g.symbols.forEach((x) => s.add(x)));
  return [...s];
}

async function loadMarkets() {
  const syms = allSymbols();
  if (!syms.length) { renderMarkets(); renderTicker(); return; }
  const chunks = [];
  for (let i = 0; i < syms.length; i += 50) chunks.push(syms.slice(i, i + 50));
  let failed = false;
  await Promise.all(
    chunks.map(async (c) => {
      try {
        const d = await api(`/api/quotes?s=${encodeURIComponent(c.join(","))}`);
        d.quotes.forEach((q) => (data.quotes[q.symbol] = q));
      } catch { failed = true; }
    })
  );
  data.marketsError = failed;
  renderMarkets();
  renderTicker();
  stamp("markets", failed);
  updateGlance();
}

function spark(arr, prev, up) {
  if (!arr || arr.length < 2) return "";
  const vals = prev != null ? [...arr, prev] : arr;
  const min = Math.min(...vals), max = Math.max(...vals), rng = max - min || 1;
  const W = 160, H = 34;
  const x = (i) => (i / (arr.length - 1)) * W;
  const y = (v) => H - 2 - ((v - min) / rng) * (H - 4);
  const pts = arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const col = up ? "var(--up)" : "var(--down)";
  const base = prev != null ? `<line x1="0" x2="${W}" y1="${y(prev)}" y2="${y(prev)}" stroke="var(--muted)" stroke-dasharray="2 3" stroke-width="1" opacity=".5"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${base}<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}

function renderMarkets() {
  const status = $("#markets-extra");
  if (status) {
    const open = marketOpen();
    status.innerHTML = `<span class="mk-status ${open ? "open" : ""}">● US market ${open ? "open" : "closed"}</span>`;
  }
  const body = $("#markets-body");
  if (!body) return;
  if (!cfg.markets.groups.length) { body.innerHTML = emptyState("No watchlists yet.", "markets"); return; }
  const viewSeg = `<div class="seg mk-view">${[["tiles", "▦ Tiles"], ["list", "☰ List"]].map(([v, l]) => `<button data-mkview="${v}" class="${cfg.markets.view === v ? "on" : ""}">${l}</button>`).join("")}</div>`;
  if (cfg.markets.view === "list") {
    body.innerHTML = viewSeg + cfg.markets.groups.map((g) => `<div class="mk-group"><h3>${esc(g.name)}</h3><div class="mk-list">${g.symbols.map((s) => {
      const q = data.quotes[s];
      if (!q || q.error) return `<div class="mk-row"><span class="sym">${esc(label(s))}</span><span class="nm">${q ? "No data" : "Loading…"}</span><span></span><span></span><span></span></div>`;
      return `<a class="mk-row" href="https://finance.yahoo.com/quote/${encodeURIComponent(s)}" target="_blank" rel="noopener">
        <span class="sym">${esc(label(s))}</span><span class="nm">${esc(q.name)}</span>
        <span class="mini">${spark(q.spark, q.prev, q.change >= 0)}</span>
        <span class="px">${fmtNum(q.price, priceDigits(q.price))}</span>
        <span class="pct ${cls(q.change)}">${sign(q.pct)}${fmtNum(q.pct, 2)}%</span></a>`;
    }).join("")}</div></div>`).join("") + (data.marketsError ? `<div class="err">Some quotes are delayed — showing the last prices received.</div>` : "");
    return;
  }
  body.innerHTML = viewSeg +
    cfg.markets.groups
      .map(
        (g) => `<div class="mk-group"><h3>${esc(g.name)}</h3><div class="mk-grid">${g.symbols
          .map((s) => {
            const q = data.quotes[s];
            if (!q) return `<div class="q"><div class="q-top"><span class="sym">${esc(label(s))}</span></div>${skeleton(2)}</div>`;
            if (q.error) return `<div class="q"><div class="q-top"><span class="sym">${esc(label(s))}</span></div><div class="px">—</div><div class="nm">No data for ${esc(s)}</div></div>`;
            const pctSuffix = s === "^TNX" ? "" : "";
            return `<a class="q ${q.change == null ? "" : q.change >= 0 ? "q-up" : "q-down"}" href="https://finance.yahoo.com/quote/${encodeURIComponent(s)}" target="_blank" rel="noopener" title="${esc(q.name)}">
              <div class="q-top"><span class="sym">${esc(label(s))}</span><span class="pct ${cls(q.change)}">${sign(q.pct)}${fmtNum(q.pct, 2)}%</span></div>
              <div class="px">${fmtNum(q.price, priceDigits(q.price))}</div>
              <div class="nm"><span class="${cls(q.change)}">${sign(q.change)}${fmtNum(q.change, priceDigits(q.price))}</span> · ${esc(q.name)}</div>
              ${spark(q.spark, q.prev, q.change >= 0)}
            </a>`;
          })
          .join("")}</div></div>`
      )
      .join("") + (data.marketsError ? `<div class="err">Some quotes are delayed — showing the last prices received.</div>` : "");
}

function renderTicker() {
  const track = $("#tickerTrack");
  if (!cfg.ticker.on || !cfg.ticker.symbols.length) { $("#ticker").hidden = true; return; }
  $("#ticker").hidden = false;
  const items = cfg.ticker.symbols
    .map((s) => {
      const q = data.quotes[s];
      if (!q || q.error) return `<span class="tk"><b>${esc(label(s))}</b><span class="px">—</span></span>`;
      return `<span class="tk"><b>${esc(label(s))}</b><span class="px">${fmtNum(q.price, priceDigits(q.price))}</span><span class="${cls(q.change)}">${q.change >= 0 ? "▲" : "▼"} ${fmtNum(Math.abs(q.pct), 2)}%</span></span>`;
    })
    .join("");
  track.innerHTML = items + items;
  track.style.animationDuration = `${Math.max(30, cfg.ticker.symbols.length * 5)}s`;
}

// ============================================================ at a glance
function updateGlance() {
  // Local weather line under the greeting (first city in Weather settings)
  const el = $("#localWx");
  const w = data.weather.find((x) => x.d);
  if (!w) { el.innerHTML = ""; return; }
  const cur = w.d.current, dl = w.d.daily;
  const [ico, desc] = wmo(cur.weather_code, cur.is_day);
  const alert = (w.alerts || [])[0];
  el.innerHTML = `<a href="#sec-weather" data-view-link="weather">${ico} <b>${Math.round(cur.temperature_2m)}°</b> ${esc(w.c.name.split(",")[0])} · ${esc(desc)} · H ${Math.round(dl.temperature_2m_max[0])}° L ${Math.round(dl.temperature_2m_min[0])}°</a>` +
    (alert ? ` <span class="warn-t">· ⚠️ ${esc(alert.event)}</span>` : "");
}

// ============================================================ apps, More page, mobile views
const appIcon = (a) => `<span class="app-ico" style="--h:${hashStr(a.name) % 360}">${esc(a.icon || a.name.slice(0, 1).toUpperCase())}</span>`;
function renderApps() {
  const bar = $("#appsBar");
  const apps = cfg.apps || [];
  bar.hidden = !cfg.showApps || !apps.length;
  bar.innerHTML = apps.map((a) => `<a class="app" href="${esc(a.url)}" target="_blank" rel="noopener">${appIcon(a)}<span>${esc(a.name)}</span></a>`).join("") +
    `<button class="app app-edit" data-config="apps" title="Edit apps"><span class="app-ico plus">+</span><span>Edit</span></button>`;
  renderMore();
  if (!$("#appsPop").hidden) renderAppsPop();
}

function renderMore() {
  const seg = (key, opts, cur) => `<span class="seg">${opts.map(([v, l]) => `<button data-quick="${key}" data-v="${v}" class="${cur === v ? "on" : ""}">${l}</button>`).join("")}</span>`;
  $("#more").innerHTML = `
    <h3>Your apps</h3>
    <div class="apps-grid">${(cfg.apps || []).map((a) => `<a class="app-tile" href="${esc(a.url)}" target="_blank" rel="noopener">${appIcon(a)}<span>${esc(a.name)}</span></a>`).join("")}
      <button class="app-tile" data-config="apps">${`<span class="app-ico plus">+</span>`}<span>Add / edit</span></button></div>
    <h3>Quick settings</h3>
    <div class="quick">
      <div class="row"><span class="grow">Theme</span>${seg("theme", [["dark", "Dark"], ["light", "Light"], ["auto", "Auto"]], cfg.theme)}</div>
      <div class="row"><span class="grow">Temperature</span>${seg("units", [["F", "°F"], ["C", "°C"]], cfg.units)}</div>
      <div class="row"><span class="grow">Text size</span>${seg("textSize", [["standard", "Standard"], ["large", "Larger"]], cfg.textSize)}</div>
      <div class="row"><span class="grow">Markets</span>${seg("mkview", [["tiles", "Tiles"], ["list", "List"]], cfg.markets.view)}</div>
    </div>
    <button class="btn primary wide" data-config="general">Customize layout, teams, feeds & cities</button>
    <button class="btn wide" data-quick="refresh">⟳ Refresh everything</button>
    <p class="more-foot">Scores: ESPN · Weather: Open-Meteo · Alerts: NWS & Environment Canada · Quotes: Yahoo Finance (may be delayed) · News: publisher RSS feeds.</p>`;
}

function renderAppsPop() {
  $("#appsPop").innerHTML = `<div class="apps-pop-h">Your apps</div><div class="apps-grid">${(cfg.apps || []).map((a) => `<a class="app-tile" href="${esc(a.url)}" target="_blank" rel="noopener">${appIcon(a)}<span>${esc(a.name)}</span></a>`).join("")}
    <button class="app-tile" data-config="apps"><span class="app-ico plus">+</span><span>Add / edit</span></button></div>`;
}
function toggleAppsPop(force) {
  const pop = $("#appsPop");
  const open = force ?? pop.hidden;
  if (open) renderAppsPop();
  pop.hidden = !open;
}

function setView(v) {
  document.body.dataset.view = v;
  $$("#tabbar button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
  scrollTo({ top: 0 });
}

function updateBadges() {
  const liveMine = data.sports.reduce((n, r) => n + (r.events || []).filter((e) => e.state === "in" && isMine(r.L, e)).length, 0);
  const b1 = $("#tb-sports"); b1.hidden = !liveMine; b1.textContent = liveMine || "";
  const alerts = data.weather.some((w) => w.alerts?.length);
  $("#tb-weather").hidden = !alerts;
  const fresh = Object.values(data.news).reduce((n, d) => n + d.items.filter((i) => i.ts > prevVisit).length, 0);
  const b3 = $("#tb-news"); b3.hidden = !fresh; b3.textContent = fresh > 99 ? "99+" : fresh || "";
}

// ============================================================ refresh orchestration
const loaders = { sports: loadSports, news: loadNews, weather: loadWeather, markets: loadMarkets };

async function refresh(ids) {
  const btn = $("#refreshAll");
  btn.classList.add("spin");
  const list = ids || ["sports", "news", "weather", "markets"];
  await Promise.all(
    list.map((id) => {
      if (id === "markets") return (sectionOn("markets") || cfg.ticker.on) ? loadMarkets() : null;
      return sectionOn(id) ? loaders[id]() : null;
    })
  );
  btn.classList.remove("spin");
}

function schedule() {
  const due = (id, ms) => Date.now() - (data.updated[id] || 0) > ms;
  setInterval(() => {
    if (document.hidden) return;
    const todo = [];
    if (due("sports", anyLive ? 30e3 : 5 * 60e3)) todo.push("sports");
    if (due("markets", marketOpen() ? 60e3 : 10 * 60e3)) todo.push("markets");
    if (due("news", 10 * 60e3)) todo.push("news");
    if (due("weather", 10 * 60e3)) todo.push("weather");
    if (todo.length) refresh(todo);
    tickClock();
  }, 15e3);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - Math.min(...Object.values(data.updated), Date.now()) > 5 * 60e3) refresh();
  });
}

// ============================================================ main page events
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.closest("#appsBtn")) { toggleAppsPop(); return; }
  if (!t.closest("#appsPop")) $("#appsPop").hidden = true;
  const vl = t.closest("[data-view-link]");
  if (vl && matchMedia("(max-width: 680px)").matches) { e.preventDefault(); setView(vl.dataset.viewLink); return; }
  const tabBtn = t.closest("#tabbar [data-view]");
  if (tabBtn) { setView(tabBtn.dataset.view); return; }
  const lt = t.closest("[data-league-toggle]");
  if (lt) {
    const k = lt.dataset.leagueToggle;
    cfg.sports.collapsed = { ...(cfg.sports.collapsed || {}), [k]: !cfg.sports.collapsed?.[k] };
    if (!cfg.sports.collapsed[k]) delete cfg.sports.collapsed[k];
    save();
    const box = lt.closest(".league");
    box.classList.toggle("collapsed", !!cfg.sports.collapsed[k]);
    lt.setAttribute("aria-expanded", String(!cfg.sports.collapsed[k]));
    return;
  }
  const sp = t.closest("[data-spmode]");
  if (sp) { cfg.sports.mode = sp.dataset.spmode; save(); renderSports(); return; }
  const src = t.closest("[data-src]");
  if (src) { newsSource[activeNews] = src.dataset.src; newsLimit[activeNews] = 0; renderNews(); return; }
  const mv = t.closest("[data-mkview]");
  if (mv) { cfg.markets.view = mv.dataset.mkview; save(); renderMarkets(); renderMore(); return; }
  const qk = t.closest("[data-quick]");
  if (qk) {
    const k = qk.dataset.quick, v = qk.dataset.v;
    if (k === "refresh") { refresh(); toast("Refreshing…"); return; }
    if (k === "mkview") { cfg.markets.view = v; save(); renderMarkets(); }
    else { cfg[k] = v; save(); applyTheme(); if (k === "units") { data.weather = []; refresh(["weather"]); } }
    renderMore();
    return;
  }
  if (t.closest("a")) return;
  const cfgBtn = t.closest("[data-config]");
  if (cfgBtn) { openSettings(cfgBtn.dataset.config === "general" ? "general" : cfgBtn.dataset.config); return; }
  const rl = t.closest("[data-reload]");
  if (rl) { refresh([rl.dataset.reload]); return; }
  const nt = t.closest("[data-news]");
  if (nt) { activeNews = nt.dataset.news; renderNews(); return; }
  if (t.closest("[data-more]")) { newsLimit[activeNews] = (newsLimit[activeNews] || cfg.news.perCategory) + 24; renderNews(); return; }
  const wx = t.closest("[data-wx]");
  if (wx) { wx.classList.toggle("open"); return; }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "newsFilter") { newsFilter = e.target.value; renderNews(); }
});
$("#refreshAll").onclick = () => refresh();
$("#openSettings").onclick = () => openSettings();
$("#footSettings").onclick = (e) => { e.preventDefault(); openSettings("general"); };

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) { if (e.key === "Escape") e.target.blur(); return; }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Escape") closeSettings();
  else if (e.key === "r") refresh();
  else if (e.key === "s" || e.key === ",") openSettings();
  else if (e.key === "/") { const f = $("#newsFilter"); if (f) { e.preventDefault(); f.scrollIntoView({ block: "center" }); f.focus(); } }
  else if (/^[1-4]$/.test(e.key)) { const s = cfg.sections.filter((x) => x.on)[+e.key - 1]; if (s) $(`#sec-${s.id}`)?.scrollIntoView({ behavior: "smooth" }); }
});

// ============================================================ settings drawer
let tab = "general";
const dirty = new Set();
let teamCache = {};
let openPicker = null;
let suggest = { target: null, results: [] };
let citySearch = [];

function openSettings(which) {
  $("#appsPop").hidden = true;
  if (which) tab = which;
  $$("#drawerTabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  renderSettings();
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#scrim").hidden = false;
}
function closeSettings() {
  if (!$("#drawer").classList.contains("open")) return;
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#scrim").hidden = true;
  renderApps();
  if (dirty.has("layout")) { buildShell(); dirty.clear(); refreshFromCache(); refresh(); return; }
  if (dirty.size) { const ids = [...dirty]; dirty.clear(); refresh(ids); }
}
function refreshFromCache() {
  renderSports(); renderWeather(); renderMarkets(); renderTicker(); renderNews();
}
$("#closeSettings").onclick = closeSettings;
$("#scrim").onclick = closeSettings;
$("#drawerTabs").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  tab = b.dataset.tab;
  $$("#drawerTabs button").forEach((x) => x.classList.toggle("on", x === b));
  renderSettings();
};

const sw = (act, on, extra = "") =>
  `<label class="switch"><input type="checkbox" data-act="${act}" ${extra} ${on ? "checked" : ""}><span></span></label>`;
const ord = (act, i, n) =>
  `<span class="ord"><button data-act="${act}" data-i="${i}" data-d="-1" ${i === 0 ? "disabled" : ""}>↑</button><button data-act="${act}" data-i="${i}" data-d="1" ${i === n - 1 ? "disabled" : ""}>↓</button></span>`;
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

function renderSettings() {
  const b = $("#drawerBody");
  const scroll = b.scrollTop;
  b.innerHTML = ({ general: setGeneral, sports: setSports, news: setNews, weather: setWeather, markets: setMarkets, apps: setApps })[tab]();
  b.scrollTop = scroll;
}

function setGeneral() {
  const n = cfg.sections.length;
  return `
  <div class="set"><h4>Your name</h4><p class="hint">Used in the greeting.</p><input data-bind="name" value="${esc(cfg.name)}"></div>
  <div class="set"><h4>Appearance</h4>
    <div class="row"><span class="grow">Theme</span><span class="seg">${["dark", "light", "auto"].map((t) => `<button data-act="theme" data-v="${t}" class="${cfg.theme === t ? "on" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</span></div>
    <div class="row"><span class="grow">Temperature</span><span class="seg">${["F", "C"].map((u) => `<button data-act="units" data-v="${u}" class="${cfg.units === u ? "on" : ""}">°${u}</button>`).join("")}</span></div>
    <div class="row"><span class="grow">Text size</span><span class="seg">${[["standard", "Standard"], ["large", "Larger"]].map(([v, l]) => `<button data-act="textSize" data-v="${v}" class="${cfg.textSize === v ? "on" : ""}">${l}</button>`).join("")}</span></div>
    <div class="row"><span class="grow">Markets view</span><span class="seg">${[["tiles", "Tiles"], ["list", "List"]].map(([v, l]) => `<button data-act="mkview" data-v="${v}" class="${cfg.markets.view === v ? "on" : ""}">${l}</button>`).join("")}</span></div>
    <div class="row"><span class="grow">Scrolling market ticker</span>${sw("ticker-on", cfg.ticker.on)}</div>
    <div class="row"><span class="grow">Also show apps bar on Home</span>${sw("apps-on", cfg.showApps)}</div>
  </div>
  <div class="set"><h4>Sections & layout</h4><p class="hint">Turn sections on/off, reorder them, and pick how wide each one is on a big screen.</p>
    ${cfg.sections
      .map(
        (s, i) => `<div class="row">${ord("sec-move", i, n)}<span class="grow">${SECTION_META[s.id].icon} ${SECTION_META[s.id].title}</span>
        <select data-act="sec-w" data-i="${i}" style="width:auto">${[[12, "Full"], [8, "Wide"], [6, "Half"], [4, "Narrow"]].map(([v, l]) => `<option value="${v}" ${s.w == v ? "selected" : ""}>${l}</option>`).join("")}</select>
        ${sw("sec-on", s.on, `data-i="${i}"`)}</div>`
      )
      .join("")}
  </div>
  <div class="set"><h4>Backup & move to another device</h4><p class="hint">Settings live in this browser. Copy them here, then paste on your phone or another computer.</p>
    <div class="inline"><button class="btn" data-act="export">Copy settings</button><button class="btn danger" data-act="reset">Reset to defaults</button></div>
    <textarea id="importBox" placeholder="Paste copied settings here…" style="margin-top:10px"></textarea>
    <div class="inline"><button class="btn primary" data-act="import">Import settings</button></div>
  </div>
  <div class="set"><h4>Keyboard shortcuts</h4><p class="hint"><b>R</b> refresh · <b>S</b> customize · <b>/</b> filter news · <b>1–4</b> jump to section · <b>Esc</b> close</p></div>`;
}

function setSports() {
  const used = new Set(cfg.sports.leagues.map((l) => l.key));
  const avail = Object.entries(LEAGUES).filter(([k]) => !used.has(k));
  return `
  <div class="set"><h4>Leagues & teams</h4><p class="hint">For each league, pick the teams you follow. You'll see their live game, last result and next game with TV/streaming info. Turn on "All of today's games" to see the whole slate.</p>
  ${cfg.sports.leagues
    .map((L, i) => {
      const m = LEAGUES[L.key];
      if (!m) return "";
      const teams = teamCache[L.key];
      const byAbbr = Object.fromEntries((teams || []).map((t) => [t.abbr, t]));
      const picker =
        openPicker === L.key
          ? `<input data-act="team-filter" data-i="${i}" placeholder="Filter teams…" style="margin-top:8px" value="">
             <div class="team-pick chips" id="pick-${L.key}">${teams ? teamChips(L, teams, "") : skeleton(3)}</div>`
          : "";
      return `<div class="box"><div class="box-h">${ord("league-move", i, cfg.sports.leagues.length)}<b class="grow" style="flex:1">${m.icon} ${m.name}</b>
          <button class="btn sm danger" data-act="league-del" data-i="${i}">Remove</button></div>
        <div class="row"><span class="grow">All of today's games</span>${sw("league-all", L.showAll, `data-i="${i}"`)}</div>
        <div class="chips">${(L.teams || [])
          .map((ab) => `<span class="chip">${byAbbr[ab]?.logo ? `<img src="${esc(byAbbr[ab].logo)}" alt="">` : ""}${esc(byAbbr[ab]?.short || ab)}<button data-act="team-del" data-i="${i}" data-v="${esc(ab)}" aria-label="Remove">✕</button></span>`)
          .join("")}<span class="chip add" data-act="team-pick" data-i="${i}">${openPicker === L.key ? "Done" : "+ Teams"}</span></div>
        ${picker}</div>`;
    })
    .join("")}
  </div>
  ${avail.length ? `<div class="set"><h4>Add a league</h4><div class="inline"><select id="leagueAdd">${avail.map(([k, m]) => `<option value="${k}">${m.icon} ${m.name}</option>`).join("")}</select><button class="btn primary" data-act="league-add">Add</button></div></div>` : ""}`;
}

function teamChips(L, teams, q) {
  q = q.toLowerCase();
  return teams
    .filter((t) => !q || t.name.toLowerCase().includes(q) || (t.abbr || "").toLowerCase().includes(q))
    .map((t) => `<span class="chip add ${L.teams.includes(t.abbr) ? "sel" : ""}" data-act="team-toggle" data-key="${L.key}" data-v="${esc(t.abbr)}">${t.logo ? `<img src="${esc(t.logo)}" alt="">` : ""}${esc(t.name)}</span>`)
    .join("");
}

function setNews() {
  const cats = cfg.news.categories;
  return `
  <div class="set"><h4>News categories</h4><p class="hint">Each category is a tab. Mix any RSS feeds into a tab — or add a <b>topic</b> (e.g. "NWN", "AI regulation") to track it via Google News.</p>
  ${cats
    .map((c, i) => {
      const sugg = (SUGGESTED_FEEDS[c.id] || []).filter(([, url]) => !c.feeds.some((f) => f.url === url));
      return `<div class="box">
        <div class="box-h">${ord("cat-move", i, cats.length)}<input data-act="cat-name" data-i="${i}" value="${esc(c.name)}">${sw("cat-on", c.on, `data-i="${i}"`)}</div>
        ${c.feeds
          .map(
            (f, j) => `<div class="row">${sw("feed-on", f.on, `data-i="${i}" data-j="${j}"`)}<span class="grow">${esc(f.name)} <span class="host">${esc(hostOf(f.url))}</span></span>
            <button class="btn sm" data-act="feed-del" data-i="${i}" data-j="${j}" aria-label="Remove">✕</button></div>`
          )
          .join("") || `<div class="hint" style="color:var(--muted);font-size:12.5px;padding:6px 0">No feeds yet.</div>`}
        ${sugg.length ? `<div class="chips">${sugg.map(([n, u]) => `<span class="chip add" data-act="feed-sugg" data-i="${i}" data-name="${esc(n)}" data-url="${esc(u)}">+ ${esc(n)}</span>`).join("")}</div>` : ""}
        <div class="inline"><input id="topic-${i}" placeholder="Track a topic, e.g. Devils trade"><button class="btn sm" data-act="topic-add" data-i="${i}">+ Topic</button></div>
        <div class="inline"><input id="fname-${i}" placeholder="Feed name" style="flex:.6"><input id="furl-${i}" placeholder="RSS URL https://…"><button class="btn sm" data-act="feed-add" data-i="${i}">+ Feed</button></div>
        <div style="text-align:right;margin-top:8px"><button class="btn sm danger" data-act="cat-del" data-i="${i}">Delete category</button></div>
      </div>`;
    })
    .join("")}
  </div>
  <div class="set"><h4>Add a category</h4><div class="inline"><input id="catName" placeholder="e.g. Hockey, Toronto, Real Estate"><button class="btn primary" data-act="cat-add">Add</button></div></div>
  <div class="set"><h4>Headlines per tab</h4><select data-act="per-cat" style="width:auto">${[12, 24, 36, 50].map((n) => `<option ${cfg.news.perCategory == n ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
}

function setApps() {
  const A = cfg.apps;
  return `
  <div class="set"><h4>Your apps</h4><p class="hint">Shortcuts to the sites you use every day. Open them from the ▦ button at the top (computer) or the More tab (phone).</p>
  ${A.map((a, i) => `<div class="row">${ord("app-move", i, A.length)}${appIcon(a)}<span class="grow">${esc(a.name)} <span class="host">${esc(hostOf(a.url))}</span></span><button class="btn sm" data-act="app-del" data-i="${i}" aria-label="Remove">✕</button></div>`).join("") || `<p class="hint">No apps yet.</p>`}
  </div>
  <div class="set"><h4>Add an app</h4>
    <div class="inline"><input id="appIcon" placeholder="🙂" maxlength="2" style="flex:0 0 56px;text-align:center"><input id="appName" placeholder="Name, e.g. LinkedIn"></div>
    <div class="inline"><input id="appUrl" placeholder="https://…"><button class="btn primary" data-act="app-add">Add</button></div>
    <div class="chips">${[["LinkedIn", "https://www.linkedin.com", "💼"], ["Gmail", "https://mail.google.com", "✉️"], ["Google Calendar", "https://calendar.google.com", "📅"], ["NJ Transit", "https://www.njtransit.com", "🚆"], ["Netlify", "https://app.netlify.com", "🌐"], ["GitHub", "https://github.com", "🐙"]]
      .filter(([n]) => !A.some((a) => a.name === n))
      .map(([n, u, ic]) => `<span class="chip add" data-act="app-sugg" data-name="${esc(n)}" data-url="${esc(u)}" data-icon="${ic}">+ ${ic} ${esc(n)}</span>`).join("")}</div>
  </div>`;
}

function setWeather() {
  const cs = cfg.weather.cities;
  return `
  <div class="set"><h4>Your cities</h4><p class="hint">The first city shows in the header "at a glance" bar.</p>
  ${cs.map((c, i) => `<div class="row">${ord("city-move", i, cs.length)}<span class="grow">${esc(c.name)}</span><button class="btn sm" data-act="city-del" data-i="${i}">✕</button></div>`).join("") || `<p class="hint">No cities yet.</p>`}
  </div>
  <div class="set"><h4>Add a city</h4>
    <div class="inline"><input id="cityQ" placeholder="Search a city… e.g. Tampa"><button class="btn primary" data-act="city-search">Search</button></div>
    <div class="inline"><button class="btn" data-act="city-here">📍 Use my current location</button></div>
    ${citySearch.length ? `<div class="sugg">${citySearch.map((r, k) => `<button data-act="city-add" data-k="${k}">${esc(r.name)}<small>${esc([r.admin1, r.country].filter(Boolean).join(", "))}</small></button>`).join("")}</div>` : ""}
  </div>`;
}

function symChips(list, act, gi = "") {
  return list
    .map((s, k) => `<span class="chip">${esc(label(s))}${label(s) !== s ? ` <span class="host">${esc(s)}</span>` : ""}<button data-act="${act}" data-g="${gi}" data-k="${k}" aria-label="Remove">✕</button></span>`)
    .join("");
}
function symAdder(target) {
  const open = suggest.target === target && suggest.results.length;
  return `<div class="inline"><input data-act="sym-q" data-target="${target}" id="symq-${target}" placeholder="Add symbol or company… e.g. Shopify, SHOP.TO, ^FTSE"><button class="btn sm" data-act="sym-add-raw" data-target="${target}">Add</button></div>
    ${open ? `<div class="sugg">${suggest.results.map((r, k) => `<button data-act="sym-add" data-target="${target}" data-k="${k}"><b>${esc(r.symbol)}</b> ${esc(r.name)}<small>${esc([r.exch, r.type].filter(Boolean).join(" · "))}</small></button>`).join("")}</div>` : ""}`;
}

function setMarkets() {
  return `
  <div class="set"><h4>Ticker tape</h4><p class="hint">Scrolls across the top of the page. Tip: indices use ^ (^GSPC = S&P 500), Canadian stocks end in .TO, crypto ends in -USD, futures end in =F.</p>
    <div class="row"><span class="grow">Show ticker</span>${sw("ticker-on", cfg.ticker.on)}</div>
    <div class="chips">${symChips(cfg.ticker.symbols, "tick-del")}</div>
    ${symAdder("ticker")}
  </div>
  <div class="set"><h4>Market boards</h4><p class="hint">Groups of quote cards with intraday charts.</p>
  ${cfg.markets.groups
    .map(
      (g, gi) => `<div class="box"><div class="box-h">${ord("grp-move", gi, cfg.markets.groups.length)}<input data-act="grp-name" data-i="${gi}" value="${esc(g.name)}"><button class="btn sm danger" data-act="grp-del" data-i="${gi}">Delete</button></div>
      <div class="chips">${symChips(g.symbols, "grp-sym-del", gi)}</div>${symAdder("g" + gi)}</div>`
    )
    .join("")}
  </div>
  <div class="set"><h4>Add a board</h4><div class="inline"><input id="grpName" placeholder="e.g. Tech peers, Canada, My portfolio"><button class="btn primary" data-act="grp-add">Add</button></div></div>`;
}

const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
function commit(...sections) { save(); sections.forEach((s) => dirty.add(s)); renderSettings(); }

async function ensureTeams(key) {
  if (teamCache[key]) return;
  try { teamCache[key] = await fetchTeams(LEAGUES[key].path); }
  catch { teamCache[key] = []; toast("Couldn't load team list"); }
}

function symTargetList(target) {
  return target === "ticker" ? cfg.ticker.symbols : cfg.markets.groups[+target.slice(1)].symbols;
}
function addSymbol(target, sym) {
  sym = sym.trim().toUpperCase();
  if (!sym) return;
  const list = symTargetList(target);
  if (!list.includes(sym)) list.push(sym);
  suggest = { target: null, results: [] };
  commit("markets");
  setTimeout(() => $(`#symq-${target}`)?.focus(), 0);
}

$("#drawerBody").addEventListener("click", async (e) => {
  const a = e.target.closest("[data-act]");
  if (!a || a.tagName === "INPUT" || a.tagName === "SELECT") return;
  const act = a.dataset.act, i = +a.dataset.i, d = +a.dataset.d;
  const L = cfg.sports.leagues, C = cfg.news.categories, G = cfg.markets.groups;
  switch (act) {
    case "theme": cfg.theme = a.dataset.v; applyTheme(); commit(); renderMore(); break;
    case "textSize": cfg.textSize = a.dataset.v; applyTheme(); commit(); renderMore(); break;
    case "mkview": cfg.markets.view = a.dataset.v; commit(); renderMarkets(); renderMore(); break;
    case "app-move": move(cfg.apps, i, d); commit(); renderApps(); break;
    case "app-del": cfg.apps.splice(i, 1); commit(); renderApps(); break;
    case "app-sugg": cfg.apps.push({ name: a.dataset.name, url: a.dataset.url, icon: a.dataset.icon }); commit(); renderApps(); break;
    case "app-add": {
      let url = $("#appUrl").value.trim(); const name = $("#appName").value.trim();
      if (!name || !url) { toast("Add a name and a link"); return; }
      if (!/^https?:\/\//.test(url)) url = "https://" + url;
      cfg.apps.push({ name, url, icon: $("#appIcon").value.trim() }); commit(); renderApps(); break;
    }
    case "city-here":
      if (!navigator.geolocation) { toast("Location isn't available in this browser"); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => { cfg.weather.cities.unshift({ name: "My location", lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4) }); commit("weather"); toast("Added your location"); },
        () => toast("Location permission was denied"),
        { timeout: 10000 }
      );
      break;
    case "units": cfg.units = a.dataset.v; data.weather = []; commit("weather"); renderMore(); break;
    case "sec-move": move(cfg.sections, i, d); commit("layout"); break;
    case "export":
      try { await navigator.clipboard.writeText(JSON.stringify(cfg)); toast("Settings copied"); }
      catch { $("#importBox").value = JSON.stringify(cfg); $("#importBox").select(); toast("Copy the text in the box"); }
      break;
    case "import":
      try {
        const n = JSON.parse($("#importBox").value);
        if (!(n.version >= 1)) throw 0;
        cfg = migrate({ ...clone(DEFAULTS), ...n }); save(); applyTheme(); dirty.add("layout"); toast("Settings imported"); renderSettings();
      } catch { toast("That doesn't look like Daily HQ settings"); }
      break;
    case "reset":
      if (a.dataset.confirm) { cfg = clone(DEFAULTS); save(); applyTheme(); dirty.add("layout"); toast("Reset to defaults"); renderSettings(); }
      else { a.dataset.confirm = 1; a.textContent = "Tap again to confirm"; }
      break;
    // sports
    case "league-move": move(L, i, d); commit("sports"); break;
    case "league-del": L.splice(i, 1); commit("sports"); break;
    case "league-add": { const k = $("#leagueAdd").value; L.push({ key: k, teams: [], showAll: false }); openPicker = k; commit("sports"); await ensureTeams(k); renderSettings(); break; }
    case "team-del": L[i].teams = L[i].teams.filter((t) => t !== a.dataset.v); commit("sports"); break;
    case "team-pick": {
      const k = L[i].key;
      openPicker = openPicker === k ? null : k;
      renderSettings();
      if (openPicker) { await ensureTeams(k); renderSettings(); }
      break;
    }
    case "team-toggle": {
      const lg = L.find((x) => x.key === a.dataset.key);
      const v = a.dataset.v;
      lg.teams = lg.teams.includes(v) ? lg.teams.filter((t) => t !== v) : [...lg.teams, v];
      save(); dirty.add("sports");
      a.classList.toggle("sel");
      // update selected chips row without losing the picker filter
      const filter = $('[data-act="team-filter"]')?.value || "";
      renderSettings();
      const f = $('[data-act="team-filter"]');
      if (f && filter) { f.value = filter; $(`#pick-${lg.key}`).innerHTML = teamChips(lg, teamCache[lg.key] || [], filter); }
      break;
    }
    // news
    case "cat-move": move(C, i, d); commit("news"); break;
    case "cat-del":
      if (a.dataset.confirm) { delete data.news[C[i].id]; C.splice(i, 1); commit("news"); }
      else { a.dataset.confirm = 1; a.textContent = "Tap again to delete"; }
      break;
    case "cat-add": { const n = $("#catName").value.trim(); if (!n) return; C.push({ id: uid(), name: n, on: true, feeds: [] }); commit("news"); break; }
    case "feed-del": C[i].feeds.splice(+a.dataset.j, 1); commit("news"); break;
    case "feed-sugg": C[i].feeds.push({ name: a.dataset.name, url: a.dataset.url, on: true }); commit("news"); break;
    case "feed-add": {
      const url = $(`#furl-${i}`).value.trim();
      if (!/^https?:\/\//.test(url)) { toast("Enter a full feed URL starting with https://"); return; }
      C[i].feeds.push({ name: $(`#fname-${i}`).value.trim() || hostOf(url), url, on: true });
      commit("news"); break;
    }
    case "topic-add": {
      const q = $(`#topic-${i}`).value.trim();
      if (!q) return;
      C[i].feeds.push({ name: `Topic: ${q}`, url: `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`, on: true });
      commit("news"); break;
    }
    // weather
    case "city-move": move(cfg.weather.cities, i, d); commit("weather"); break;
    case "city-del": cfg.weather.cities.splice(i, 1); commit("weather"); break;
    case "city-search": await searchCity(); break;
    case "city-add": {
      const r = citySearch[+a.dataset.k];
      const region = r.country_code === "US" || r.country_code === "CA" ? abbrevRegion(r.admin1) : r.country;
      cfg.weather.cities.push({ name: [r.name, region].filter(Boolean).join(", "), lat: r.latitude, lon: r.longitude });
      citySearch = []; commit("weather"); break;
    }
    // markets
    case "tick-del": cfg.ticker.symbols.splice(+a.dataset.k, 1); commit("markets"); break;
    case "grp-sym-del": G[+a.dataset.g].symbols.splice(+a.dataset.k, 1); commit("markets"); break;
    case "grp-move": move(G, i, d); commit("markets"); break;
    case "grp-del":
      if (a.dataset.confirm) { G.splice(i, 1); commit("markets"); }
      else { a.dataset.confirm = 1; a.textContent = "Tap again"; }
      break;
    case "grp-add": { const n = $("#grpName").value.trim(); if (!n) return; G.push({ name: n, symbols: [] }); commit("markets"); break; }
    case "sym-add": addSymbol(a.dataset.target, suggest.results[+a.dataset.k].symbol); break;
    case "sym-add-raw": addSymbol(a.dataset.target, $(`#symq-${a.dataset.target}`).value); break;
  }
});

$("#drawerBody").addEventListener("change", (e) => {
  const a = e.target, act = a.dataset.act, i = +a.dataset.i;
  switch (act) {
    case "ticker-on": cfg.ticker.on = a.checked; commit("markets", "layout"); break;
    case "apps-on": cfg.showApps = a.checked; commit(); renderApps(); break;
    case "sec-on": cfg.sections[i].on = a.checked; commit("layout"); break;
    case "sec-w": cfg.sections[i].w = +a.value; commit("layout"); break;
    case "league-all": cfg.sports.leagues[i].showAll = a.checked; commit("sports"); break;
    case "cat-on": cfg.news.categories[i].on = a.checked; commit("news"); break;
    case "feed-on": cfg.news.categories[i].feeds[+a.dataset.j].on = a.checked; commit("news"); break;
    case "cat-name": cfg.news.categories[i].name = a.value.trim() || "Untitled"; commit("news"); break;
    case "grp-name": cfg.markets.groups[i].name = a.value.trim() || "Untitled"; commit("markets"); break;
    case "per-cat": cfg.news.perCategory = +a.value; newsLimit = {}; commit("news"); break;
  }
});

let symTimer;
$("#drawerBody").addEventListener("input", (e) => {
  const a = e.target;
  if (a.dataset.bind === "name") { cfg.name = a.value; save(); tickClock(); }
  if (a.dataset.act === "team-filter") {
    const lg = cfg.sports.leagues[+a.dataset.i];
    $(`#pick-${lg.key}`).innerHTML = teamChips(lg, teamCache[lg.key] || [], a.value);
  }
  if (a.dataset.act === "sym-q") {
    clearTimeout(symTimer);
    const q = a.value.trim(), target = a.dataset.target;
    if (q.length < 2) return;
    symTimer = setTimeout(async () => {
      try {
        const d = await api(`/api/quotes?search=${encodeURIComponent(q)}`);
        suggest = { target, results: d.results };
        const keep = a.value;
        renderSettings();
        const inp = $(`#symq-${target}`);
        if (inp) { inp.value = keep; inp.focus(); }
      } catch {}
    }, 300);
  }
});

$("#drawerBody").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const a = e.target;
  if (a.id === "cityQ") searchCity();
  else if (a.dataset.act === "sym-q") addSymbol(a.dataset.target, a.value);
  else if (a.id === "catName") $('[data-act="cat-add"]').click();
  else if (a.id === "grpName") $('[data-act="grp-add"]').click();
  else if (a.id === "appUrl" || a.id === "appName") $('[data-act="app-add"]').click();
  else if (a.id?.startsWith("topic-")) $(`[data-act="topic-add"][data-i="${a.id.slice(6)}"]`).click();
  else if (a.id?.startsWith("furl-")) $(`[data-act="feed-add"][data-i="${a.id.slice(5)}"]`).click();
});

async function searchCity() {
  const q = $("#cityQ").value.trim();
  if (!q) return;
  try {
    const d = await api(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en`);
    citySearch = d.results || [];
    if (!citySearch.length) toast("No matching cities");
  } catch { toast("City search failed"); }
  renderSettings();
  const inp = $("#cityQ"); if (inp) inp.value = q;
}

const REGION = {
  "New Jersey": "NJ", "New York": "NY", Pennsylvania: "PA", Connecticut: "CT", Massachusetts: "MA", Florida: "FL", Georgia: "GA",
  "North Carolina": "NC", "South Carolina": "SC", Virginia: "VA", Maryland: "MD", Delaware: "DE", Texas: "TX", California: "CA",
  Illinois: "IL", Ohio: "OH", Michigan: "MI", Tennessee: "TN", Colorado: "CO", Arizona: "AZ", Nevada: "NV", Washington: "WA",
  Ontario: "ON", Quebec: "QC", "British Columbia": "BC", Alberta: "AB", "Nova Scotia": "NS", Manitoba: "MB",
};
const abbrevRegion = (s) => REGION[s] || s;

// ============================================================ boot
applyTheme();
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", applyTheme);
tickClock();
buildShell();
renderApps();
setView("home");
if (loadSnapshot()) { refreshFromCache(); updateGlance(); stampSnapshot(); }
renderTicker();
refresh();
schedule();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

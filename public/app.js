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
  pga: { name: "PGA Tour", path: "golf/pga", icon: "⛳", kind: "golf" },
  lpga: { name: "LPGA Tour", path: "golf/lpga", icon: "⛳", kind: "golf" },
  cricket: { name: "Cricket", path: "cricket/scorepanel", icon: "🏏", kind: "cricket" },
};
// Cricket: ESPN lists every match worldwide; keep internationals, major leagues and anything with a team you follow.
const CRICKET_MAJOR = /world cup|champions trophy|indian premier league|caribbean premier|bangladesh premier|lanka premier|big bash|pakistan super league|the hundred|sa20|major league cricket|ilt20|test championship|asia cup/i;
const CRICKET_TEAMS = [["IND", "India"], ["AUS", "Australia"], ["ENG", "England"], ["PAK", "Pakistan"], ["NZ", "New Zealand"], ["SA", "South Africa"], ["SL", "Sri Lanka"], ["BAN", "Bangladesh"], ["AFG", "Afghanistan"], ["WI", "West Indies"], ["IRE", "Ireland"], ["ZIM", "Zimbabwe"], ["CAN", "Canada"], ["USA", "United States"], ["NED", "Netherlands"]];

const gnews = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
const SUGGESTED_FEEDS = {
  general: [
    ["NPR", "https://feeds.npr.org/1001/rss.xml"],
    ["BBC News", "https://feeds.bbci.co.uk/news/rss.xml"],
    ["Google News – US", "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"],
    ["CBC Top Stories", "https://www.cbc.ca/webfeed/rss/rss-topstories"],
    ["The Guardian – World", "https://www.theguardian.com/world/rss"],
    ["CBS News", "https://www.cbsnews.com/latest/rss/main"],
    ["AP Top News", gnews("site:apnews.com")],
    ["Axios", gnews("site:axios.com")],
    ["The Guardian – US", "https://www.theguardian.com/us-news/rss"],
    ["Global News (Canada)", "https://globalnews.ca/feed/"],
    ["CTV News (Canada)", gnews("site:ctvnews.ca")],
    ["The Globe and Mail", gnews("site:theglobeandmail.com")],
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
    ["Rangers", gnews("New York Rangers")],
    ["NHL trades & rumors", gnews("NHL trade")],
    ["Sportsnet NHL", gnews("site:sportsnet.ca NHL")],
  ],
  ai: [
    ["The Verge – AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"],
    ["TechCrunch – AI", "https://techcrunch.com/category/artificial-intelligence/feed/"],
    ["MIT Technology Review", "https://www.technologyreview.com/feed/"],
    ["Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"],
    ["Hacker News – Front page", "https://hnrss.org/frontpage"],
    ["VentureBeat – AI", "https://venturebeat.com/category/ai/feed/"],
    ["Simon Willison", "https://simonwillison.net/atom/everything/"],
    ["Import AI", "https://importai.substack.com/feed"],
    ["Google AI blog", "https://blog.google/technology/ai/rss/"],
    ["Anthropic news", gnews("Anthropic Claude")],
    ["OpenAI news", gnews("OpenAI")],
    ["The Verge", "https://www.theverge.com/rss/index.xml"],
    ["TechCrunch", "https://techcrunch.com/feed/"],
    ["Wired", "https://www.wired.com/feed/rss"],
    ["Engadget", "https://www.engadget.com/rss.xml"],
  ],
  markets: [
    ["CNBC Top News", "https://www.cnbc.com/id/100003114/device/rss/rss.html"],
    ["MarketWatch", "https://feeds.content.dowjones.io/public/rss/mw_topstories"],
    ["Google News – Business", "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en"],
    ["CNBC Markets", "https://www.cnbc.com/id/15839069/device/rss/rss.html"],
    ["Federal Reserve", "https://www.federalreserve.gov/feeds/press_all.xml"],
    ["Bank of Canada", gnews("Bank of Canada interest rate")],
    ["Earnings", gnews("earnings beat estimates")],
    ["Morning Brew", gnews("site:morningbrew.com")],
    ["Bloomberg", gnews("site:bloomberg.com markets")],
    ["Globe and Mail – Business", gnews("site:theglobeandmail.com business")],
  ],
  science: [
    ["ScienceDaily", "https://www.sciencedaily.com/rss/top.xml"],
    ["NASA", "https://www.nasa.gov/news-release/feed/"],
    ["Ars Technica – Science", "https://feeds.arstechnica.com/arstechnica/science"],
    ["Google News – Science", "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en"],
  ],
  health: [
    ["STAT News", "https://www.statnews.com/feed/"],
    ["NPR Health", "https://feeds.npr.org/1128/rss.xml"],
    ["Google News – Health", "https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en"],
  ],
  gaming: [
    ["Polygon", "https://www.polygon.com/rss/index.xml"],
    ["IGN", gnews("site:ign.com")],
    ["Kotaku", "https://kotaku.com/rss"],
  ],
  travel: [
    ["The Points Guy", "https://thepointsguy.com/feed/"],
    ["Travel + Leisure", gnews("site:travelandleisure.com")],
    ["Travel news", gnews("travel news airlines")],
  ],
  food: [
    ["Eater", "https://www.eater.com/rss/index.xml"],
    ["Serious Eats", gnews("site:seriouseats.com")],
    ["Bon Appétit", gnews("site:bonappetit.com")],
  ],
  parenting: [
    ["Parents", gnews("site:parents.com")],
    ["Parenting news", gnews("parenting kids news")],
    ["School news", gnews("schools education news")],
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
    ["TRREB market reports", gnews("TRREB market watch")],
    ["Mississauga condos", gnews("Mississauga condo")],
    ["Bank of Canada rates", gnews("Bank of Canada rate decision")],
  ],
  industry: [
    ["Executive moves – CTO", gnews('"chief technology officer" appointed')],
    ["Executive moves – CIO", gnews('"chief information officer" appointed')],
    ["Executive moves – CPO", gnews('"chief product officer" named')],
    ["CRN", gnews("site:crn.com")],
    ["Channel Futures", gnews("site:channelfutures.com")],
    ["MSSP Alert", gnews("site:msspalert.com")],
    ["Managed services M&A", gnews("managed services acquisition")],
  ],
  local: [],
  leadership: [
    ["CIO Dive", "https://www.ciodive.com/feeds/news/"],
    ["CIO.com", "https://www.cio.com/feed/"],
    ["Google News – Technology", "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en"],
    ["Google News – Managed services", "https://news.google.com/rss/search?q=%22managed%20services%22&hl=en-US&gl=US&ceid=US:en"],
  ],
};

const RIDE_APPS = [
  { name: "Uber", url: "https://m.uber.com", icon: "🚗" },
  { name: "Lyft", url: "https://ride.lyft.com", icon: "🚕" },
  { name: "Uber Eats", url: "https://www.ubereats.com", icon: "🍔" },
  { name: "DoorDash", url: "https://www.doordash.com", icon: "🥡" },
];
const feedsFrom = (cat, n) => SUGGESTED_FEEDS[cat].slice(0, n).map(([name, url]) => ({ name, url, on: true }));

const DEFAULTS = {
  version: 11,
  realestate: { country: "CA", areas: { CA: ["Ontario", "GTA", "Mississauga", "Brampton", "Oakville", "Hamilton", "Ottawa", "Kitchener-Waterloo"], US: ["New Jersey", "Monmouth County"] }, area: { CA: "", US: "" } },
  name: "Dean",
  theme: "dark",
  units: "F",
  textSize: "standard",
  showApps: false,
  apps: [
    { name: "Executive Search", url: "https://dean-executive-search.netlify.app", icon: "💼" },
    { name: "United Airlines", url: "https://www.united.com", icon: "✈️" },
    ...RIDE_APPS,
  ],
  sections: [
    { id: "brief", on: true, w: 8 },
    { id: "calendar", on: true, w: 4 },
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
      { key: "mls", teams: ["TOR", "NY"], showAll: false },
      { key: "pga", teams: [], showAll: true },
      { key: "cricket", teams: [], showAll: true },
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
      { id: "science", name: "Science", on: false, feeds: feedsFrom("science", 3) },
      { id: "health", name: "Health", on: false, feeds: feedsFrom("health", 3) },
      { id: "gaming", name: "Gaming", on: false, feeds: feedsFrom("gaming", 3) },
      { id: "travel", name: "Travel", on: false, feeds: feedsFrom("travel", 3) },
      { id: "food", name: "Food", on: false, feeds: feedsFrom("food", 3) },
      { id: "parenting", name: "Parenting", on: false, feeds: feedsFrom("parenting", 3) },
      { id: "industry", name: "Industry & Moves", on: true, feeds: feedsFrom("industry", 5) },
      { id: "local", name: "Local", on: true, feeds: feedsFrom("local", 5) },
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
  calendars: [],
  saved: [],
  collapsed: {},
  alerts: { gameStart: true, finals: true, pregame: false, weather: true, rainToday: false, movePct: 3, prices: [], eventMins: 10, quiet: { on: false, from: 22, to: 7 }, mute: [] },
  ticker: {
    on: false,
    symbols: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^GSPTSE", "^TNX", "BTC-USD", "GC=F", "CL=F", "CAD=X", "NVDA", "MSFT", "AAPL"],
  },
  markets: {
    view: "tiles",
    converter: true,
    realestate: true,
    groups: [
      { name: "Indices", symbols: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^GSPTSE"] },
      { name: "Watchlist", symbols: ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "AVGO", "TSLA", "CSCO", "ORCL"] },
      { name: "Rates, FX, Crypto & Commodities", symbols: ["^TNX", "CAD=X", "BTC-USD", "ETH-USD", "GC=F", "CL=F"] },
    ],
  },
};

const SECTION_META = {
  brief: { title: "Your brief", icon: "sparkles" },
  calendar: { title: "Calendar", icon: "calendar-days" },
  sports: { title: "Sports", icon: "trophy" },
  news: { title: "News", icon: "newspaper" },
  weather: { title: "Weather", icon: "cloud-sun" },
  markets: { title: "Markets", icon: "trending-up" },
};

const FRIENDLY = {
  "^GSPC": "S&P 500", "^DJI": "Dow", "^IXIC": "Nasdaq", "^RUT": "Russell 2000", "^VIX": "VIX",
  "^GSPTSE": "TSX", "^TNX": "10Y Yield", "BTC-USD": "Bitcoin", "ETH-USD": "Ether", "GC=F": "Gold",
  "CL=F": "Crude Oil", "CAD=X": "USD/CAD", "SI=F": "Silver", "NG=F": "Nat Gas", "EURUSD=X": "EUR/USD",
  "^FTSE": "FTSE 100", "^N225": "Nikkei", "^STOXX50E": "Euro Stoxx 50",
};

// ============================================================ state
const PROFILES_KEY = "dailyhq.profiles";
const ACTIVE_KEY = "dailyhq.activeProfile";
let profileId = (() => { try { return localStorage.getItem(ACTIVE_KEY) || "main"; } catch { return "main"; } })();
const pkey = (k, id = profileId) => (id === "main" ? k : `${k}:${id}`);
const KEY_BASE = "dailyhq.config.v1";
const KEY = pkey(KEY_BASE);
const VISIT_KEY = pkey("dailyhq.lastVisit");
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const clone = (o) => JSON.parse(JSON.stringify(o));

// Generic starting point for a new person (no teams, cities or apps yet)
function freshDefaults(name = "") {
  const d = clone(DEFAULTS);
  d.name = name;
  d.apps = [];
  d.weather.cities = [];
  d.sports.leagues = [{ key: "nhl", teams: [], showAll: true }, { key: "nfl", teams: [], showAll: true }, { key: "nba", teams: [], showAll: true }];
  d.sports.mode = "0";
  for (const c of d.news.categories) {
    if (c.id === "local") c.feeds = [];
    if (c.id === "industry" || c.id === "leadership") c.on = false;
  }
  d.realestate = { country: "US", areas: { CA: ["Ontario", "GTA", "Ottawa", "Hamilton"], US: [] }, area: { CA: "", US: "" } };
  d.markets.realestate = false;
  // New people start with Top News, Sports, Tech, Business and Local; the rest come from the interests they pick
  for (const c of d.news.categories) c.on = ["general", "sports", "ai", "markets", "local"].includes(c.id);
  d.extras = { onThisDay: true, holidays: true, events: true, radius: 25 };
  d.commute = { on: false, mode: "drive", arrive: "09:00", days: [1, 2, 3, 4, 5] };
  d.needsSetup = true;
  return d;
}
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
  if (c.version < 5) {
    // v5: brief + calendar sections, Industry & Local tabs, alerts, saved headlines, converter
    for (const [id, w] of [["calendar", 4], ["brief", 8]]) if (!c.sections.some((x) => x.id === id)) c.sections.unshift({ id, on: true, w });
    const d = clone(DEFAULTS);
    const at = Math.max(0, c.news.categories.findIndex((x) => x.id === "leadership"));
    for (const id of ["local", "industry"]) if (!c.news.categories.some((x) => x.id === id)) c.news.categories.splice(at, 0, d.news.categories.find((x) => x.id === id));
    c.markets.converter ??= true;
    c.version = 5;
  }
  if (c.version < 6) {
    // v6: ride and food delivery shortcuts (only for the original profile; others choose their own)
    if (profileId === "main") for (const a of RIDE_APPS) if (!c.apps.some((x) => x.url === a.url)) c.apps.push({ ...a });
    c.version = 6;
  }
  if (c.version < 7) { c.markets.realestate ??= true; c.version = 7; }
  if (c.version < 8) {
    // v8: real estate areas (from the earlier region/city picks)
    const o = c.realestate || {}, d = clone(DEFAULTS.realestate);
    const areasFrom = (x, fb) => (x?.region ? [x.region, x.city].filter(Boolean) : fb);
    c.realestate = { country: o.country || d.country, areas: { CA: areasFrom(o.CA, d.areas.CA), US: areasFrom(o.US, d.areas.US) }, area: { CA: "", US: "" } };
    c.version = 8;
  }
  if (c.version < 9) {
    // v9: Canada/Ontario first — add the Ontario areas that now carry local board data
    const r = c.realestate || (c.realestate = clone(DEFAULTS.realestate));
    r.areas ||= { CA: [], US: [] };
    const ca = (r.areas.CA ||= []);
    if (!ca.includes("Ontario")) ca.unshift("Ontario");
    ["GTA", "Mississauga", "Brampton", "Oakville", "Hamilton", "Ottawa", "Kitchener-Waterloo"].forEach((a) => { if (!ca.includes(a)) ca.push(a); });
    c.version = 9;
  }
  if (c.version < 10) {
    // v10: more sports — MLB, MLS, PGA Tour golf and cricket (original profile only)
    if (profileId === "main") {
      const have = new Set(c.sports.leagues.map((l) => l.key));
      [["mlb", ["NYY", "TOR"]], ["mls", ["TOR", "NY"]], ["pga", []], ["cricket", []]].forEach(([key, teams]) => { if (!have.has(key)) c.sports.leagues.push({ key, teams, showAll: !teams.length }); });
    }
    c.version = 10;
  }
  if (c.version < 11) {
    // v11: optional interest tabs (off until turned on), brief extras, commute, betting lines
    for (const dc of DEFAULTS.news.categories) if (!c.news.categories.some((x) => x.id === dc.id)) c.news.categories.push({ ...clone(dc), on: false });
    c.version = 11;
  }
  c.extras = { onThisDay: true, holidays: true, events: true, radius: 25, ...(c.extras || {}) };
  c.commute ??= { on: false, mode: "drive", arrive: "09:00", days: [1, 2, 3, 4, 5] };
  c.calendars ??= []; c.saved ??= []; c.collapsed ??= {};
  c.alerts = { ...clone(DEFAULTS.alerts), ...(c.alerts || {}) };
  return c;
}
function loadCfg() {
  try {
    const s = JSON.parse(store.get(KEY));
    if (s && s.version >= 1) return migrate(s);
  } catch {}
  if (window.DHQ_PREVIEW) { const d = clone(DEFAULTS); d.calendars = [{ name: "Sample", url: "https://example.com/sample.ics" }]; return d; }
  // First visit on a device: start fresh with a short setup guide (or restore with a sync code)
  return freshDefaults();
}
let cfg = loadCfg();
function save() {
  if (cfg.sync?.code) cfg.sync.updatedAt = Date.now();
  store.set(KEY, JSON.stringify(cfg));
  queueSyncPush();
}

// ---------- profiles (several people on one device, fully separate)
function listProfiles() {
  try { const p = JSON.parse(store.get(PROFILES_KEY)); if (Array.isArray(p) && p.length) return p; } catch {}
  return [{ id: "main", name: cfg.name || "Me" }];
}
function saveProfiles(list) { store.set(PROFILES_KEY, JSON.stringify(list)); }
function switchProfile(id) { store.set(ACTIVE_KEY, id); location.reload(); }
function addProfile(name) {
  const list = listProfiles();
  if (!list.some((p) => p.id === "main")) list.unshift({ id: "main", name: cfg.name || "Me" });
  const id = uid();
  list.push({ id, name });
  saveProfiles(list);
  store.set(pkey(KEY_BASE, id), JSON.stringify(freshDefaults(name)));
  switchProfile(id);
}
function removeProfile(id) {
  if (id === "main") return;
  saveProfiles(listProfiles().filter((p) => p.id !== id));
  for (const k of [KEY_BASE, "dailyhq.snapshot.v1", "dailyhq.lastVisit", "dailyhq.alertsSeen", "dailyhq.alertLog"]) try { localStorage.removeItem(pkey(k, id)); } catch {}
  if (profileId === id) switchProfile("main");
}
function renameProfileEntry() {
  const list = listProfiles();
  const me = list.find((p) => p.id === profileId);
  if (me && cfg.name && me.name !== cfg.name) { me.name = cfg.name; saveProfiles(list); }
}

// ---------- cross-device sync (private sync code -> Netlify Blobs)
const CODE_ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => CODE_ALPHA[b % CODE_ALPHA.length]).join("");
const fmtCode = (c) => c.replace(/(.{4})(?=.)/g, "$1-");
const cleanCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
let syncTimer;
function queueSyncPush() {
  if (!cfg.sync?.code) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncPush, 1500);
}
async function syncPush() {
  if (!cfg.sync?.code) return;
  try {
    await fetch("/api/sync", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: cfg.sync.code, data: cfg, updatedAt: cfg.sync.updatedAt || Date.now() }) });
  } catch {}
}
async function syncPull(code = cfg.sync?.code, force = false) {
  if (!code) return false;
  const r = await fetch(`/api/sync?code=${encodeURIComponent(code)}`);
  if (r.status === 404) { if (force) throw new Error("No settings found for that code"); return false; }
  if (!r.ok) throw new Error("Sync is unavailable right now");
  const remote = await r.json();
  if (!remote?.data) return false;
  if (!force && (remote.updatedAt || 0) <= (cfg.sync?.updatedAt || 0)) return false;
  cfg = migrate({ ...remote.data, sync: { code, updatedAt: remote.updatedAt } });
  delete cfg.needsSetup;
  store.set(KEY, JSON.stringify(cfg));
  return true;
}
function afterConfigReplaced() {
  applyTheme(); tickClock(); buildShell(); renderApps(); refreshFromCache(); refresh();
}

const prevVisit = Number(store.get(VISIT_KEY)) || Date.now() - 6 * 3600e3;
const markVisit = () => store.set(VISIT_KEY, String(Date.now()));
addEventListener("pagehide", markVisit);
document.addEventListener("visibilitychange", () => document.hidden && markVisit());

const data = { sports: [], news: {}, weather: [], quotes: {}, updated: {}, extras: {}, commute: null };
let newsSource = {};
const CACHE_KEY = pkey("dailyhq.snapshot.v1");
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
const ic = (name, cls = "") => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const wxSrc = (n) => (window.WX_INLINE && window.WX_INLINE[n]) || `/wx/${n}.svg`;
const hostName = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
// League logos come from ESPN's own scoreboard data (light + dark versions), remembered between visits
let leagueLogos = {};
try { leagueLogos = JSON.parse(localStorage.getItem("dailyhq.leagueLogos") || "{}"); } catch {}
function captureLeague(path, logos) {
  if (!logos?.length) return;
  const pick = (rel) => logos.find((l) => (l.rel || []).includes(rel))?.href;
  const entry = { light: pick("default") || logos[0].href, dark: pick("dark") || pick("default") || logos[0].href };
  if (JSON.stringify(leagueLogos[path]) !== JSON.stringify(entry)) {
    leagueLogos[path] = entry;
    try { localStorage.setItem("dailyhq.leagueLogos", JSON.stringify(leagueLogos)); } catch {}
  }
}
function leagueBadge(key, cls = "lg-logo") {
  const m = LEAGUES[key];
  const lg = leagueLogos[m.path];
  if (!lg) return `<span class="${cls} lg-emoji">${m.icon}</span>`;
  const dark = document.documentElement.dataset.theme !== "light";
  return `<img class="${cls}" src="${esc(dark ? lg.dark : lg.light)}" alt="${esc(m.name)}" loading="lazy" onerror="this.outerHTML='<span class=&quot;${cls} lg-emoji&quot;>${m.icon}</span>'">`;
}
const hashStr = (str) => { let h = 7; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

async function api(url, asText = false) {
  const r = await fetch(url);
  if (!r.ok) {
    let msg = "";
    try { msg = asText ? await r.text() : (await r.json()).error || ""; } catch {}
    // Never show a raw web page or a long technical message to the person
    if (!msg || msg.length > 140 || /<[a-z!/]/i.test(msg)) msg = r.status === 404 ? "not found" : r.status === 429 ? "busy — try again shortly" : r.status >= 500 ? "temporarily unavailable" : "couldn't load";
    throw new Error(msg);
  }
  return asText ? r.text() : r.json();
}

function toast(msg) {
  const t = $("#toast");
  t.classList.remove("alert-toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 2200);
}

// ---------- confirm before anything that can't be undone, and Undo for small removals
function askConfirm({ title, body = "", ok = "Delete", danger = true }) {
  return new Promise((resolve) => {
    let el = $("#confirmDlg");
    if (!el) { el = document.createElement("div"); el.id = "confirmDlg"; el.className = "confirm-wrap"; document.body.append(el); }
    el.innerHTML = `<div class="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="cfT" aria-describedby="cfB">
      <div class="confirm-ic ${danger ? "danger" : ""}">${ic(danger ? "trash-2" : "triangle-alert")}</div>
      <b id="cfT">${esc(title)}</b>${body ? `<p id="cfB">${body}</p>` : ""}
      <div class="confirm-btns"><button class="btn" data-cf="0">Cancel</button><button class="btn ${danger ? "danger-solid" : "primary"}" data-cf="1">${esc(ok)}</button></div></div>`;
    el.hidden = false;
    const done = (v) => { el.hidden = true; el.onclick = null; document.removeEventListener("keydown", key, true); resolve(v); };
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } else if (e.key === "Enter") { e.preventDefault(); done(true); } };
    el.onclick = (e) => { e.stopPropagation(); const b = e.target.closest("[data-cf]"); if (b) done(b.dataset.cf === "1"); else if (e.target === el) done(false); };
    document.addEventListener("keydown", key, true);
    setTimeout(() => el.querySelector('[data-cf="0"]')?.focus(), 0);
  });
}
function undoToast(msg, undo) {
  const t = $("#toast");
  t.innerHTML = `<span>${esc(msg)}</span><button class="toast-undo">Undo</button>`;
  t.hidden = false;
  t.querySelector(".toast-undo").onclick = (e) => { e.stopPropagation(); t.hidden = true; undo(); toast("Restored"); };
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 6000);
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
      const col = !!cfg.collapsed?.[s.id];
      return `<section class="card w-${s.w || 12} ${col ? "collapsed" : ""}" id="sec-${s.id}" data-sec="${s.id}">
        <div class="card-head">
          <button class="mini-btn back-home" data-back-home aria-label="Back to Home">${ic("chevron-left")} Home</button>
          <button class="sec-toggle" data-sec-toggle="${s.id}" aria-expanded="${!col}" title="Collapse / expand">${ic("chevron-down", "chev")}<h2><span class="ico">${ic(m.icon)}</span>${m.title}</h2></button><span class="sub" id="${s.id}-sub"></span>
          <span class="spacer"></span>
          <span id="${s.id}-extra"></span>
          <button class="mini-btn" data-config="${s.id}" title="Customize ${m.title}">Edit</button>
          <button class="mini-btn" data-reload="${s.id}" title="Refresh" aria-label="Refresh">${ic("refresh-cw")}</button>
        </div>
        <div class="card-body" id="${s.id}-body">${skeleton(4)}</div>
      </section>`;
    })
    .join("") || `<div class="card w-12"><div class="empty">All sections are hidden. <br><button class="btn" data-config="general">Customize</button></div></div>`;

  $("#jump").innerHTML = `<button class="jump-btn" data-collapse-all="1" title="Collapse all sections">${ic("chevron-down", "rot")} Collapse all</button><button class="jump-btn" data-collapse-all="0" title="Expand all sections">${ic("chevron-down")} Expand all</button>` + on.map((s) => `<a href="#sec-${s.id}" data-sec="${s.id}">${ic(SECTION_META[s.id].icon)} ${SECTION_META[s.id].title}</a>`).join("");
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
  renderBrief();
  if (["sports", "markets", "weather"].includes(id)) checkAlerts(id);
  const bs = $("#brief-sub"); if (bs) bs.textContent = new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}
function stampSnapshot() {
  if (!data.snapshotAt) return;
  for (const id of ["sports", "weather", "news", "markets", "calendar"]) {
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
      odds: c.odds?.[0]?.details ? { details: c.odds[0].details, ou: c.odds[0].overUnder ?? null } : null,
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
    range: async () => { const d = await espnJSON(`${ESPN}${path}/scoreboard?dates=${dates}`); captureLeague(path, d.leagues?.[0]?.logos); return trimEvents(d); },
    days: async () => {
      // one request per day (yesterday-3 … +6), merged
      const days = [...Array(10)].map((_, i) => ymd(addDays(i - 3)));
      const res = await Promise.allSettled(days.map((d) => espnJSON(`${ESPN}${path}/scoreboard?dates=${d}`)));
      const ok = res.filter((r) => r.status === "fulfilled");
      if (!ok.length) throw new Error("no days");
      captureLeague(path, ok[0].value.leagues?.[0]?.logos);
      const seen = new Set();
      return ok.flatMap((r) => trimEvents(r.value)).filter((e) => !seen.has(e.id) && seen.add(e.id));
    },
    proxy: async () => { const d = await api(`/api/sports?path=${path}&dates=${dates}`); captureLeague(path, d.leagueLogos); return d.events; },
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
async function fetchRaw(path) {
  try { return await espnJSON(`${ESPN}${path}${path.startsWith("golf/") ? "/scoreboard" : ""}`); }
  catch { return api(`/api/sports?path=${path}&kind=raw`); }
}
const toPar = (v) => (v == null || v === "" ? "–" : String(v));
async function fetchGolf(path) {
  const d = await fetchRaw(path);
  captureLeague(path, d.leagues?.[0]?.logos);
  return (d.events || []).map((e) => {
    const c = e.competitions?.[0] || {};
    const st = c.status || e.status || {};
    const nets = new Set();
    for (const b of c.broadcasts || []) for (const n of b.names || []) nets.add(n);
    const round = st.period || 1;
    const comps = (c.competitors || []).slice().sort((a, b) => (a.order || 999) - (b.order || 999));
    const leaders = comps.slice(0, 60).map((p, i) => {
      const sc = p.score?.displayValue ?? p.score;
      const ls = (p.linescores || []).find((l) => l.period === round);
      return { name: p.athlete?.displayName || p.athlete?.shortName, flag: p.athlete?.flag?.href, score: sc, today: ls?.displayValue, order: p.order || i + 1 };
    });
    leaders.forEach((l, i) => {
      const tied = leaders.filter((x) => x.score === l.score);
      const first = leaders.findIndex((x) => x.score === l.score);
      l.pos = `${tied.length > 1 ? "T" : ""}${first + 1}`;
    });
    return {
      id: e.id, date: e.date, endDate: e.endDate, name: e.name, golf: true, teams: [],
      state: st.type?.state, detail: st.type?.shortDetail || st.type?.detail || "", completed: !!st.type?.completed,
      broadcasts: [...nets], leaders, field: comps.length,
      link: e.links?.find((l) => (l.rel || []).includes("summary"))?.href || e.links?.[0]?.href || `https://www.espn.com/golf/leaderboard`,
    };
  });
}
async function fetchCricket(L) {
  const d = await fetchRaw("cricket/scorepanel");
  const mine = new Set(L.teams || []);
  const out = [];
  for (const blk of d.scores || []) {
    const lg = blk.leagues?.[0] || {};
    for (const e of blk.events || []) {
      const c = e.competitions?.[0] || {};
      const st = c.status || e.status || {};
      const teams = (c.competitors || []).map((t) => ({
        abbr: t.team?.abbreviation, name: t.team?.displayName || t.team?.shortDisplayName, logo: t.team?.logo,
        score: t.score || "", homeAway: t.homeAway, winner: t.winner === true || t.winner === "true",
      }));
      const intl = c.class && c.class.internationalClassId && c.class.internationalClassId !== "0";
      if (!(intl || CRICKET_MAJOR.test(lg.name || "") || teams.some((t) => mine.has(t.abbr)))) continue;
      const nets = new Set();
      for (const b of c.broadcasts || []) for (const n of b.names || []) nets.add(n);
      out.push({
        id: e.id, date: e.date, name: e.shortName || e.name, cricket: true, series: lg.name,
        state: st.type?.state, detail: st.type?.state === "post" ? "Result" : st.type?.shortDetail || st.type?.detail || "",
        completed: st.type?.state === "post", note: [lg.name, c.description].filter(Boolean).join(" · "), summary: st.type?.state === "pre" ? "" : st.summary || c.notes?.[0]?.text || "",
        venue: c.venue?.fullName, broadcasts: [...nets], teams,
        link: e.links?.find((l) => (l.rel || []).includes("summary"))?.href || e.links?.[0]?.href,
      });
    }
  }
  return out;
}
async function fetchTeams(path) {
  if (path === "cricket/scorepanel") {
    const seen = new Map(CRICKET_TEAMS.map(([abbr, name]) => [abbr, { id: abbr, abbr, name, short: name }]));
    for (const r of data.sports || []) for (const e of r.events || []) if (e.cricket) for (const t of e.teams) if (t.abbr && !seen.has(t.abbr)) seen.set(t.abbr, { id: t.abbr, abbr: t.abbr, name: t.name, short: t.name, logo: t.logo });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
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
        const m = LEAGUES[L.key];
        const events = m.kind === "golf" ? await fetchGolf(m.path) : m.kind === "cricket" ? await fetchCricket(L) : await fetchScoreboard(m.path, range);
        return { L, events };
      } catch (e) {
        const p = prev[L.key];
        return p?.events ? { L, events: p.events, stale: true } : { L, error: e.message };
      }
    })
  );
  anyLive = data.sports.some((r) => r.events?.some((e) => e.state === "in"));
  renderSports();
  renderCalendar();
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
  return out.sort((a, b) => rank[a.state] - rank[b.state] || (a.state === "post" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));
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
  if (e.broadcasts?.length) meta.push(`<span class="tv">${ic("tv")}${esc(e.broadcasts.slice(0, 4).join(", "))}</span>`);
  if (e.state === "pre" && e.venue) meta.push(esc(e.venue));
  if (e.state === "pre" && e.odds && cfg.sports.odds !== false) meta.push(`<span class="odds" title="Betting line">${esc(e.odds.details)}${e.odds.ou != null ? ` · O/U ${esc(e.odds.ou)}` : ""}</span>`);
  if (e.note) meta.push(esc(e.note));
  if (e.link) meta.push(`<a href="${esc(e.link)}" target="_blank" rel="noopener">Game ${ic("external-link", "xs")}</a>`);
  return `<div class="game ${e.state === "in" ? "is-live" : e.state === "post" ? "is-final" : ""}" data-game="${esc(e.id)}" data-path="${esc(gameHTML.path || "")}" role="button" tabindex="0" title="Tap for game details"><div class="g-status">${pill}</div>${rows}${meta.length ? `<div class="g-meta">${meta.join("<span>·</span>")}</div>` : ""}</div>`;
}

function golfHTML(e) {
  const k = `golf-${e.id}`;
  const full = !!cfg.sports.golfFull?.[e.id];
  const rows = e.leaders.slice(0, full ? 60 : 10);
  const pill = e.state === "in" ? `<span class="pill live">LIVE</span> ${esc(e.detail)}` : e.state === "post" ? `<span class="pill final">Final</span>` : `<span class="pill">${esc(new Date(e.date).toLocaleDateString([], { month: "short", day: "numeric" }))} – ${esc(new Date(e.endDate || e.date).toLocaleDateString([], { month: "short", day: "numeric" }))}</span>`;
  return `<div class="golf" data-k="${k}"><div class="golf-h"><b>${esc(e.name)}</b><div class="g-status">${pill}</div></div>
    ${rows.length ? `<div class="golf-lb"><div class="golf-r head"><span>Pos</span><span>Player</span><span>Total</span><span>Rd</span></div>${rows
      .map((p) => `<div class="golf-r ${p.order === 1 ? "lead" : ""}"><span class="pos">${esc(p.pos)}</span><span class="pl">${p.flag ? `<img src="${esc(p.flag)}" alt="" loading="lazy">` : ""}${esc(p.name || "")}</span><span class="tp ${String(p.score).startsWith("-") ? "up" : ""}">${esc(toPar(p.score))}</span><span class="rd">${esc(toPar(p.today))}</span></div>`)
      .join("")}</div>` : `<div class="empty">Tee times not posted yet.</div>`}
    <div class="g-meta">${e.leaders.length > 10 ? `<button class="linkish" data-golf-full="${esc(e.id)}">${full ? "Top 10 only" : `Show all ${Math.min(e.leaders.length, 60)}`}</button><span>·</span>` : ""}${e.broadcasts.length ? `<span class="tv">${ic("tv")}${esc(e.broadcasts.slice(0, 3).join(", "))}</span><span>·</span>` : ""}<a href="${esc(e.link)}" target="_blank" rel="noopener">Full leaderboard ${ic("external-link", "xs")}</a></div></div>`;
}
function cricketHTML(e, watched) {
  const pill = e.state === "in" ? `<span class="pill live">LIVE</span> ${/^live$/i.test(e.detail) ? "" : esc(e.detail)}` : e.state === "post" ? `<span class="pill final">Result</span> ${esc(dayLabel(e.date))}` : `<span class="pill">${esc(when(e.date))}</span>`;
  const rows = e.teams.map((t) => `<div class="g-team ${e.state === "post" && e.teams.some((o) => o.winner) && !t.winner ? "lose" : ""} ${watched.includes(t.abbr) ? "mine" : ""}">
      ${t.logo ? `<img src="${esc(t.logo)}" alt="" loading="lazy">` : "<span></span>"}<span class="nm">${esc(t.name)}</span><span class="sc ck">${e.state !== "pre" ? esc(t.score) : ""}</span></div>`).join("");
  const meta = [];
  if (e.summary) meta.push(`<b>${esc(e.summary)}</b>`);
  if (e.note) meta.push(esc(e.note));
  if (e.broadcasts?.length) meta.push(`<span class="tv">${ic("tv")}${esc(e.broadcasts.slice(0, 3).join(", "))}</span>`);
  if (e.link) meta.push(`<a href="${esc(e.link)}" target="_blank" rel="noopener">Scorecard ${ic("external-link", "xs")}</a>`);
  return `<div class="game cricket ${e.state === "in" ? "is-live" : e.state === "post" ? "is-final" : ""}"><div class="g-status">${pill}</div>${rows}<div class="g-meta">${meta.join("<span>·</span>")}</div></div>`;
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

  const upnext = "";
  const tiles = data.sports
    .map(({ L, events, error, stale }) => {
      const meta = LEAGUES[L.key];
      if (!meta) return "";
      let inner;
      if (error) inner = `<div class="err">Couldn't load ${meta.name} right now — will retry.</div>`;
      else if (meta.kind === "golf") inner = events.length ? events.map(golfHTML).join("") : `<div class="empty">No ${meta.name} event this week.</div>`;
      else if (meta.kind === "cricket") {
        let games;
        const rank = { in: 0, post: 1, pre: 2 };
        if (mode === "mine") {
          games = (L.teams || []).length ? pickGames(L, events) : [];
          if (!games.length) games = [...events].sort((a, b) => rank[a.state] - rank[b.state] || (a.state === "post" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date))).slice(0, 8);
        } else games = events.filter((e) => sameDay(new Date(e.date), addDays(+mode)) || (mode === "0" && e.state === "in")).sort((a, b) => rank[a.state] - rank[b.state]);
        inner = games.length ? games.map((g) => cricketHTML(g, L.teams || [])).join("") : `<div class="empty">No international or major-league matches ${mode === "mine" ? "right now" : mode === "0" ? "today" : mode === "1" ? "tomorrow" : "yesterday"}.</div>`;
      } else {
        let games, none;
        if (mode === "mine") {
          games = pickGames(L, events);
          none = (L.teams || []).length ? (events.length ? "No games for your teams in the past or next week." : "No games this week — likely off-season.") : "Pick teams in Customize → Sports to see their games here.";
        } else {
          const day = addDays(+mode);
          const rank = { in: 0, pre: 1, post: 2 };
          games = events.filter((e) => sameDay(new Date(e.date), day)).sort((a, b) => rank[a.state] - rank[b.state] || new Date(a.date) - new Date(b.date));
          none = `No ${meta.name} games ${mode === "0" ? "today" : mode === "1" ? "tomorrow" : "yesterday"}.`;
        }
        gameHTML.path = meta.path;
        inner = (games.length ? games.map((g) => gameHTML(g, L.teams || [])).join("") : `<div class="empty">${none}</div>`) +
          `<button class="lg-more" data-standings="${L.key}">${ic("list-ordered")} Standings</button>`;
      }
      const tl = meta.kind === "golf" ? "Leaderboard" : mode === "mine" ? `${(L.teams || []).join(" · ") || (meta.kind === "cricket" ? "Internationals & major leagues" : "All games")} · Live, last & next` : SP_MODES.find((m) => m[0] === mode)[1];
      const collapsed = !!cfg.sports.collapsed?.[L.key];
      const liveN = (events || []).filter((e) => e.state === "in" && (mode !== "mine" || isMine(L, e))).length;
      return `<div class="league ${collapsed ? "collapsed" : ""}">
        <button class="league-h" data-league-toggle="${L.key}" aria-expanded="${!collapsed}">
          ${ic("chevron-down", "chev")}<span class="lg-name">${leagueBadge(L.key)} ${meta.name}</span>
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
    const srcUrl = n.getElementsByTagName("source")[0]?.getAttribute("url") || "";
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
      site: (() => { try { return new URL(srcUrl || (/news\.google\./.test(link) ? "" : link)).hostname.replace(/^www\./, ""); } catch { return ""; } })(),
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
  if (cat.id === "realestate") { await Promise.all([loadRE(), loadRates()]); return; }
  const feeds = cat.feeds.filter((f) => f.on);
  const results = await Promise.all(
    feeds.map(async (f) => {
      try {
        const xml = await api(`/api/feed?url=${encodeURIComponent(f.url)}`, true);
        return { items: parseFeed(xml, f) };
      } catch (e) {
        return { error: f.name, items: [] };
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
  if (activeNews === "realestate" && document.activeElement?.closest?.(".re [data-mort-box], #reNewArea")) return;
  const body = $("#news-body");
  if (!body) return;
  const cats = cfg.news.categories.filter((c) => c.on);
  const savedTab = (cfg.saved || []).length ? `<button data-news="__saved" class="${activeNews === "__saved" ? "on" : ""}">${ic("bookmark", "xs")} Saved<span class="dot">${cfg.saved.length}</span></button>` : "";
  if (activeNews === "__saved" && !savedTab) activeNews = cats[0]?.id;
  const tabs = cats
    .map((c) => {
      const d = data.news[c.id];
      const fresh = d ? d.items.filter((i) => i.ts > prevVisit).length : 0;
      return `<button data-news="${c.id}" class="${c.id === activeNews ? "on" : ""}">${esc(c.name)}${fresh ? `<span class="dot" title="New since your last visit">${fresh}</span>` : ""}</button>`;
    })
    .join("");
  const d = activeNews === "__saved" ? { items: cfg.saved, errors: [] } : data.news[activeNews];
  const isRE = activeNews === "realestate";
  const isSaved = (link) => (cfg.saved || []).some((x) => x.link === link);
  const saveBtn = (i) => `<button class="save-btn ${isSaved(i.link) ? "on" : ""}" data-save="${esc(i.link)}" title="${isSaved(i.link) ? "Remove from Saved" : "Save for later"}" aria-label="Save for later">${ic(isSaved(i.link) ? "bookmark-check" : "bookmark")}</button>`;
  let list;
  if (isRE) list = renderREHTML(saveBtn);
  else if (!d) list = skeleton(6);
  else if (d.empty) list = emptyState("No feeds in this category.", "news");
  else {
    const q = newsFilter.toLowerCase();
    const src = newsSource[activeNews] || "";
    let items = src ? d.items.filter((i) => i.feed === src) : d.items;
    if (q) items = items.filter((i) => (i.title + " " + i.source + " " + i.desc).toLowerCase().includes(q));
    const limit = newsLimit[activeNews] || cfg.news.perCategory;
    const shown = items.slice(0, limit);
    const heroIdx = q ? -1 : shown.findIndex((i, idx) => idx < 4 && imgFor(i));
    const hero = heroIdx >= 0 ? shown.splice(heroIdx, 1)[0] : null;
    const newDot = (i) => (i.ts > prevVisit ? `<span class="new" title="New since last visit"></span>` : "");
    list =
      `<div class="news-wrap">` +
      (hero
        ? `<a class="hero" href="${esc(hero.link)}" target="_blank" rel="noopener"><img src="${esc(imgFor(hero))}" alt="" loading="lazy" onerror="this.remove()">
            <div><div class="meta">${newDot(hero)}${esc(hero.source)} · ${ago(hero.ts)}${saveBtn(hero)}</div><h3>${esc(hero.title)}</h3><p>${esc(hero.desc)}</p></div></a>`
        : "") +
      shown
        .map(
          (i) => `<div class="item"><div>
            <a class="t" href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a>
            <div class="meta">${newDot(i)}${esc(i.source)}${i.ts ? ` · ${ago(i.ts)}` : ""}${saveBtn(i)}</div></div>
            ${thumbHTML(i)}</div>`
        )
        .join("") +
      `</div>` +
      (items.length > limit ? `<div class="more"><button class="btn sm" data-more="1">Show more (${items.length - limit})</button></div>` : "") +
      (!items.length ? `<div class="empty">${q ? "No headlines match your filter." : "No headlines right now."}</div>` : "") +
      (d.errors.length ? `<div class="err">${d.errors.length === 1 ? "One source" : `${d.errors.length} sources`} didn't load just now (${esc(d.errors.slice(0, 4).join(", "))}${d.errors.length > 4 ? "…" : ""}). Daily HQ will try again on the next refresh.</div>` : "");
  }
  const hadFocus = document.activeElement?.id === "newsFilter";
  const catCfg = activeNews === "__saved" ? null : cats.find((c) => c.id === activeNews);
  const feedsOn = (catCfg?.feeds || []).filter((f) => f.on);
  const srcSel = newsSource[activeNews] || "";
  const srcChips = !isRE && feedsOn.length > 1
    ? `<div class="src-chips"><button data-src="" class="${!srcSel ? "on" : ""}">All sources</button>${feedsOn.map((f) => `<button data-src="${esc(f.name)}" class="${srcSel === f.name ? "on" : ""}">${esc(f.name.replace(/^Topic: /, ""))}</button>`).join("")}</div>`
    : "";
  body.innerHTML = `<div class="tabs">${tabs}${savedTab}</div>
    ${srcChips}
    <div class="news-tools"><input id="newsFilter" type="search" placeholder="Filter headlines…  ( / )" value="${esc(newsFilter)}"></div>
    ${list}`;
  setTimeout(fillArticleImages, 50);
  updateBadges();
  if (hadFocus) { const f = $("#newsFilter"); f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
}

// ============================================================ weather
// WMO weather code -> [day icon, night icon, label]  (icons: Meteocons by Bas Milius, MIT)
const WMO = {
  0: ["clear-day", "clear-night", "Clear"], 1: ["partly-cloudy-day", "partly-cloudy-night", "Mostly clear"],
  2: ["partly-cloudy-day", "partly-cloudy-night", "Partly cloudy"], 3: ["overcast", "overcast", "Overcast"],
  45: ["fog", "fog", "Fog"], 48: ["fog", "fog", "Icy fog"],
  51: ["drizzle", "drizzle", "Light drizzle"], 53: ["drizzle", "drizzle", "Drizzle"], 55: ["drizzle", "drizzle", "Heavy drizzle"],
  56: ["sleet", "sleet", "Freezing drizzle"], 57: ["sleet", "sleet", "Freezing drizzle"],
  61: ["rain", "rain", "Light rain"], 63: ["rain", "rain", "Rain"], 65: ["rain", "rain", "Heavy rain"],
  66: ["sleet", "sleet", "Freezing rain"], 67: ["sleet", "sleet", "Freezing rain"],
  71: ["snow", "snow", "Light snow"], 73: ["snow", "snow", "Snow"], 75: ["snow", "snow", "Heavy snow"], 77: ["snow", "snow", "Snow grains"],
  80: ["partly-cloudy-day-rain", "partly-cloudy-night-rain", "Showers"], 81: ["partly-cloudy-day-rain", "partly-cloudy-night-rain", "Showers"],
  82: ["rain", "rain", "Heavy showers"], 85: ["partly-cloudy-day-snow", "partly-cloudy-night-snow", "Snow showers"],
  86: ["snow", "snow", "Snow showers"], 95: ["thunderstorms-day-rain", "thunderstorms-rain", "Thunderstorm"],
  96: ["thunderstorms-rain", "thunderstorms-rain", "Storm & hail"], 99: ["thunderstorms-rain", "thunderstorms-rain", "Storm & hail"],
};
// returns [<img> icon html, label]
const wmo = (c, day = 1) => {
  const w = WMO[c] || ["not-available", "not-available", "—"];
  const name = day ? w[0] : w[1];
  return [`<img class="wxi" src="${wxSrc(name)}" alt="${w[2]}" title="${w[2]}" loading="lazy">`, w[2]];
};

// ---------- "right now" = what's actually happening, not just the forecast model
// 1) a nearby official station's observation (NWS / Environment Canada) if it's recent,
// 2) otherwise rain or snow the radar-driven 15-minute data says is falling now,
// 3) otherwise the forecast model.
function obsToCode(t) {
  t = (t || "").toLowerCase();
  if (/thunder|t-storm|tstorm/.test(t)) return 95;
  if (/freezing (rain|drizzle)|ice pellets|sleet/.test(t)) return /drizzle/.test(t) ? 56 : 66;
  if (/snow|flurr|blizzard/.test(t)) return /heavy|blizzard/.test(t) ? 75 : /light|flurr/.test(t) ? 71 : 73;
  if (/drizzle/.test(t)) return /heavy/.test(t) ? 55 : /light/.test(t) ? 51 : 53;
  if (/rain|shower|precip/.test(t)) return /heavy/.test(t) ? 65 : /light/.test(t) ? 61 : 63;
  if (/fog|mist|haze|smoke/.test(t)) return 45;
  if (/overcast/.test(t)) return 3;
  if (/mostly cloudy|cloudy/.test(t)) return /partly/.test(t) ? 2 : 3;
  if (/partly|mostly sunny|mostly clear|few clouds|scattered clouds/.test(t)) return /mostly (sunny|clear)|few/.test(t) ? 1 : 2;
  if (/clear|sunny|fair/.test(t)) return 0;
  return null;
}
function wxApplyNow(d, obs, F) {
  const cur = d.current;
  if (!cur) return;
  cur._model = { code: cur.weather_code, temp: cur.temperature_2m };
  const m = d.minutely_15;
  // precipitation falling now (mm in the current 15-min block / last hour)
  let nowMm = cur.precipitation || 0, nowSnow = cur.snowfall || 0;
  if (m?.time?.length) {
    const ni = Math.max(0, m.time.findIndex((t) => t > cur.time) - 1);
    nowMm = Math.max(nowMm, m.precipitation[ni] || 0);
    nowSnow = Math.max(nowSnow, m.snowfall?.[ni] || 0);
    // heavy rain due within ~30 min usually arrives early or the timing is off by a block — treat it as here
    const soon = Math.max(m.precipitation[ni + 1] || 0, m.precipitation[ni + 2] || 0);
    if (soon >= 1 && nowMm < 0.1) { nowMm = soon; nowSnow = Math.max(m.snowfall?.[ni + 1] || 0, m.snowfall?.[ni + 2] || 0); cur._arriving = true; }
  }
  const fresh = obs?.text && obs.time && Date.now() - new Date(obs.time) < 100 * 60e3;
  const oc = fresh ? obsToCode(obs.text) : null;
  if (oc != null) {
    cur.weather_code = oc; cur._src = `Observed${obs.station ? ` at ${obs.station}` : ""} ${hm(obs.time)}`; cur._obs = obs.text;
    if (obs.tempC != null && Number.isFinite(+obs.tempC)) cur.temperature_2m = F ? +obs.tempC * 9 / 5 + 32 : +obs.tempC;
  }
  // radar-driven precip beats a "cloudy" reading from either source
  if (nowMm >= 0.1 && ![51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(cur.weather_code)) {
    cur.weather_code = nowSnow > 0 ? (nowSnow >= 1 ? 75 : 73) : nowMm >= 2 ? 65 : nowMm >= 0.5 ? 63 : 61;
    cur._src = cur._arriving ? "Live rain data (moving in now)" : "Live rain data";
  }
  cur._src ||= "Forecast model";
  // what's next in the coming 2-3 hours
  if (m?.time?.length) {
    const ni = Math.max(0, m.time.findIndex((t) => t > cur.time) - 1);
    const wet = (k) => (m.precipitation[k] || 0) >= 0.1;
    const heavy = Math.max(...m.precipitation.slice(ni, ni + 6).map((x) => x || 0)) >= 2.5;
    const raining = wet(ni) || [61, 63, 65, 80, 81, 82, 51, 53, 55, 71, 73, 75].includes(cur.weather_code);
    const kind = (k) => ((m.snowfall?.[k] || 0) > 0 ? "Snow" : "Rain");
    let note = "";
    if (raining || cur._arriving) { const k0 = cur._arriving ? ni + 1 : ni; const stop = m.time.findIndex((t, k) => k > k0 && !wet(k) && !wet(k + 1)); note = `${heavy ? "Heavy " + kind(k0).toLowerCase() : kind(k0)}${cur._arriving ? " moving in now" : ""}${stop > 0 ? ` — easing around ${hm(m.time[stop])}` : ", continuing for the next few hours"}`; }
    else { const start = m.time.findIndex((t, k) => k > ni && wet(k)); if (start > 0) note = `${kind(start)} starting around ${hm(m.time[start])}`; }
    cur._next = note;
  }
}

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
        current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall",
        minutely_15: "precipitation,snowfall", forecast_minutely_15: 12, past_minutely_15: 1,
        hourly: "temperature_2m,precipitation_probability,weather_code,is_day",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max",
        temperature_unit: F ? "fahrenheit" : "celsius", wind_speed_unit: F ? "mph" : "kmh",
      }).forEach(([k, v]) => u.searchParams.set(k, v));
      const aqP = api(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}&current=us_aqi`).then((d) => d.current?.us_aqi ?? null).catch(() => prevW[c.name]?.aqi ?? null);
      const obsP = api(`/api/obs?lat=${c.lat}&lon=${c.lon}`).then((d) => d.obs).catch(() => prevW[c.name]?.obs || null);
      try { const d = await api(u), obs = await obsP; wxApplyNow(d, obs, F); return { c, d, obs, alerts: await alertsP, aqi: await aqP }; }
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
    .map(({ c, d, error, alerts, aqi }, idx) => {
      if (error) return `<div class="wx"><div class="wx-city">${esc(c.name)}</div><div class="err">Weather unavailable</div></div>`;
      const cur = d.current, dl = d.daily, hr = d.hourly;
      const [ico, desc] = wmo(cur.weather_code, cur.is_day);
      // hourly from the current hour (times are local to the city)
      const nowIdx = Math.max(0, hr.time.findIndex((t) => t >= cur.time.slice(0, 13)));
      const hours = hr.time.slice(nowIdx, nowIdx + 12).map((t, i) => {
        const j = nowIdx + i;
        const hh = Number(t.slice(11, 13));
        const lbl = i === 0 ? "Now" : `${hh % 12 || 12}${hh < 12 ? "a" : "p"}`;
        return `<div class="wx-h">${lbl}${wmo(i === 0 ? cur.weather_code : hr.weather_code[j], hr.is_day[j])[0]}<b>${Math.round(i === 0 ? cur.temperature_2m : hr.temperature_2m[j])}°</b>${hr.precipitation_probability[j] >= 20 ? `<span class="rp">${hr.precipitation_probability[j]}%</span>` : "&nbsp;"}</div>`;
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
        .map((a) => `<a class="wx-alert ${sev(a)}" href="${esc(a.url)}" target="_blank" rel="noopener" title="${esc(a.headline || a.event)} — ${esc(a.source)}">${ic("triangle-alert")} <b>${esc(a.event)}</b>${a.ends ? ` · until ${esc(when(a.ends))}` : ""}</a>`)
        .join("");
      return `<div class="wx ${alerts?.length ? "has-alert" : ""} ${cfg.wxOpen?.[c.name] ? "open" : ""}" data-wx="${idx}" data-wx-name="${esc(c.name)}" role="button" aria-expanded="${!!cfg.wxOpen?.[c.name]}">
        ${alertHTML}
        <div class="wx-top"><div class="wx-ico">${ico}</div>
          <span class="wx-chev" aria-hidden="true">${ic("chevron-down")}</span>
          <div><div class="wx-city">${esc(c.name)}</div><div class="wx-temp">${Math.round(cur.temperature_2m)}°</div></div>
          <div class="wx-right"><div><b>${esc(cur._obs && obsToCode(cur._obs) === cur.weather_code ? cur._obs : desc)}</b></div>
            ${cur._next ? `<div class="wx-next">${ic(/starting/.test(cur._next) ? "umbrella" : "clock")} ${esc(cur._next)}</div>` : ""}
            <div>H ${Math.round(dl.temperature_2m_max[0])}° · L ${Math.round(dl.temperature_2m_min[0])}° · Feels ${Math.round(cur.apparent_temperature)}°</div>
            <div class="wx-stats"><span title="Wind">${ic("wind")}${Math.round(cur.wind_speed_10m)} ${wind}</span><span title="Humidity">${ic("droplets")}${cur.relative_humidity_2m}%</span><span title="Chance of rain today">${ic("umbrella")}${dl.precipitation_probability_max[0] ?? 0}%</span></div>
            <div class="wx-stats">${aqi != null ? `<span class="aq ${aqiCls(aqi)}" title="US Air Quality Index: ${aqiLabel(aqi)}">AQI ${Math.round(aqi)}</span>` : ""}${dl.uv_index_max?.[0] != null ? `<span class="uv" title="UV index today: ${uvLabel(dl.uv_index_max[0])}">UV ${Math.round(dl.uv_index_max[0])}</span>` : ""}</div>
          </div></div>
        <div class="wx-hours">${hours.join("")}</div>
        <div class="wx-days">${days.join("")}<div class="meta">${ic("sunrise")} ${sun(dl.sunrise[0])} · ${ic("sunset")} ${sun(dl.sunset[0])}${cur._src ? ` · <span class="wx-src">Now: ${esc(cur._src)}</span>` : ""}</div></div>
      </div>`;
    })
    .join("")}</div><div class="meta" style="justify-content:center;margin-top:8px">Tap a city to expand or collapse its 7-day forecast · Alerts: NWS (US) & Environment Canada</div>`;
  updateBadges();
}

// ============================================================ markets
function allSymbols() {
  const s = new Set();
  if (cfg.ticker.on) cfg.ticker.symbols.forEach((x) => s.add(x));
  if (sectionOn("markets")) cfg.markets.groups.forEach((g) => g.symbols.forEach((x) => s.add(x)));
  if (sectionOn("markets") && cfg.markets.converter) s.add("CAD=X");
  (cfg.alerts?.prices || []).forEach((p) => s.add(p.symbol));
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
  await loadRates();
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

function renderMarkets(force = false) {
  if (!force && document.activeElement?.closest?.("[data-mort-box]")) { renderMarkets.pending = true; return; }
  const status = $("#markets-extra");
  if (status) {
    const open = marketOpen();
    status.innerHTML = `<span class="mk-status ${open ? "open" : ""}">● US market ${open ? "open" : "closed"}</span>`;
  }
  const body = $("#markets-body");
  if (!body) return;
  if (!cfg.markets.groups.length) { body.innerHTML = emptyState("No watchlists yet.", "markets"); return; }
  const tabsList = marketTabs();
  let tab = cfg.markets.tab || "all";
  if (!tabsList.some(([k]) => k === tab)) tab = "all";
  const tabBar = `<div class="tabs mk-tabs" role="tablist">${tabsList.map(([k, l, i]) => `<button data-mktab="${esc(k)}" class="${k === tab ? "on" : ""}">${i ? ic(i, "xs") + " " : ""}${l}</button>`).join("")}</div>`;
  const err = data.marketsError ? `<div class="err">Some quotes are delayed — showing the last prices received.</div>` : "";
  if (tab.startsWith("re:")) { body.innerHTML = tabBar + reMarketTabHTML(tab.slice(3)); return; }
  if (tab === "fx") { body.innerHTML = tabBar + converterHTML(true) + fxGroupHTML(); return; }
  const groups = tab.startsWith("grp:") ? cfg.markets.groups.filter((g) => g.name === tab.slice(4)) : cfg.markets.groups;
  const extras = tab === "all" ? realEstateMarketsHTML() + converterHTML() : "";
  const viewSeg = `<div class="seg mk-view">${[["tiles", "layout-grid", "Tiles"], ["list", "list", "List"]].map(([v, i, l]) => `<button data-mkview="${v}" class="${cfg.markets.view === v ? "on" : ""}">${ic(i)} ${l}</button>`).join("")}</div>`;
  body.innerHTML = tabBar + viewSeg + groups.map((g) => groupHTML(g, tab !== "all")).join("") + extras + err;
}
function marketTabs() {
  const t = [["all", "All"]];
  cfg.markets.groups.forEach((g) => t.push([`grp:${g.name}`, esc(g.name)]));
  if (cfg.markets.realestate) {
    const order = reDefaults().country === "US" ? ["US", "CA"] : ["CA", "US"];
    order.forEach((c) => t.push([`re:${c}`, `${RE_MARKETS[c].flag} Real estate ${c === "CA" ? "Canada" : "U.S."}`]));
  }
  if (cfg.markets.converter) t.push(["fx", "USD ⇄ CAD", "arrow-left-right"]);
  return t;
}
function quoteTile(s) {
  const q = data.quotes[s];
  if (!q) return `<div class="q"><div class="q-top"><span class="sym">${esc(label(s))}</span></div>${skeleton(2)}</div>`;
  if (q.error) return `<div class="q"><div class="q-top"><span class="sym">${esc(label(s))}</span></div><div class="px">—</div><div class="nm">No data for ${esc(s)}</div></div>`;
  return `<a class="q ${q.change == null ? "" : q.change >= 0 ? "q-up" : "q-down"}" href="https://finance.yahoo.com/quote/${encodeURIComponent(s)}" target="_blank" rel="noopener" title="${esc(q.name)}">
    <div class="q-top"><span class="sym">${esc(label(s))}</span><span class="pct ${cls(q.change)}">${sign(q.pct)}${fmtNum(q.pct, 2)}%</span></div>
    <div class="px">${fmtNum(q.price, priceDigits(q.price))}</div>
    <div class="nm"><span class="${cls(q.change)}">${sign(q.change)}${fmtNum(q.change, priceDigits(q.price))}</span> · ${esc(q.name)}</div>
    ${spark(q.spark, q.prev, q.change >= 0)}
  </a>`;
}
function quoteRow(s) {
  const q = data.quotes[s];
  if (!q || q.error) return `<div class="mk-row"><span class="sym">${esc(label(s))}</span><span class="nm">${q ? "No data" : "Loading…"}</span><span></span><span></span><span></span></div>`;
  return `<a class="mk-row" href="https://finance.yahoo.com/quote/${encodeURIComponent(s)}" target="_blank" rel="noopener">
    <span class="sym">${esc(label(s))}</span><span class="nm">${esc(q.name)}</span>
    <span class="mini">${spark(q.spark, q.prev, q.change >= 0)}</span>
    <span class="px">${fmtNum(q.price, priceDigits(q.price))}</span>
    <span class="pct ${cls(q.change)}">${sign(q.pct)}${fmtNum(q.pct, 2)}%</span></a>`;
}
function groupHTML(g, single) {
  const list = cfg.markets.view === "list";
  const inner = list ? `<div class="mk-list">${g.symbols.map(quoteRow).join("")}</div>` : `<div class="mk-grid">${g.symbols.map(quoteTile).join("")}</div>`;
  const col = !single && cfg.markets.collapsed?.[g.name];
  return `<div class="mk-group ${col ? "collapsed" : ""}"><h3><button data-grp-toggle="${esc(g.name)}">${ic("chevron-down", "chev")}${esc(g.name)} <small>${g.symbols.length}</small></button></h3>${inner}</div>`;
}
function fxGroupHTML() {
  const fx = ["CAD=X", "EURUSD=X", "GBPUSD=X", "JPY=X"].filter((s) => data.quotes[s]);
  return fx.length ? `<div class="mk-group"><h3><button>${ic("arrow-left-right", "chev")}Currencies</button></h3><div class="mk-grid">${fx.map(quoteTile).join("")}</div></div>` : "";
}
function reMarketTabHTML(c) {
  const M = RE_MARKETS[c], snap = RE_SNAPSHOT[c], def = reDefaults();
  const tiles = (arr) => `<div class="re-tiles">${arr.map(([l, val, sub]) => `<div class="re-tile"><small>${esc(l)}</small><b>${esc(val)}</b><span>${esc(sub)}</span></div>`).join("")}</div>`;
  const areas = (def.areas[c] || []).filter((a) => reLocal(a));
  const seen = new Set();
  const uniq = areas.filter((a) => { const k = reLocal(a).name; return !seen.has(k) && seen.add(k); });
  let pick = marketREArea[c];
  if (!uniq.includes(pick)) pick = uniq.includes(def.area[c]) ? def.area[c] : uniq[0];
  const loc = pick ? reLocal(pick) : null;
  const areaChips = uniq.length ? `<div class="chips mk-reareas">${uniq.map((a) => `<button class="chip ${a === pick ? "on" : ""}" data-mk-rearea="${c}|${esc(a)}">${esc(a)}</button>`).join("")}</div>` : "";
  const localHTML = loc ? `<h4 class="re-h local">${ic("map-pin")} ${esc(loc.name)} <small>${esc(loc.assoc)} · ${esc(loc.period)}</small></h4>${tiles(loc.tiles)}
    <p class="re-src">${esc(loc.summary)} <a href="${esc(loc.source)}" target="_blank" rel="noopener">Source ${ic("external-link", "xs")}</a></p>` : "";
  return `<div class="re re-mk">
    <div class="re-col"><b>${M.flag} ${c === "CA" ? "Canada" : "U.S."} rates</b><div class="re-rates">${RATE_ROWS[c].map(rateChip).join("") || `<span class="hint">Rates loading…</span>`}</div></div>
    ${uniq.length ? `<h4 class="re-h">${ic("building-2")} Local markets</h4>${areaChips}${localHTML}` : ""}
    <h4 class="re-h">${ic("flag")} National · ${esc(snap.source[0])} ${esc(snap.period)}</h4>${tiles(snap.tiles)}
    <p class="re-src">Next update ${esc(snap.next)} · <a href="${esc(snap.source[1])}" target="_blank" rel="noopener">${esc(snap.source[0])} ${ic("external-link", "xs")}</a> · <button class="linkish" data-mk-renews="${c}">Agent briefing &amp; news ${ic("arrow-right", "xs")}</button></p>
    ${mortgageHTML(c)}
  </div>`;
}
const marketREArea = {};

function converterHTML(force = false) {
  if (!cfg.markets.converter && !force) return "";
  const q = data.quotes["CAD=X"];
  const rate = q && !q.error ? q.price : null;
  const usd = converterHTML.usd ?? 1000;
  return `<div class="conv">${ic("arrow-left-right")}<b>USD ⇄ CAD</b>
    <label>US$ <input type="number" inputmode="decimal" id="convUsd" value="${usd}"></label>
    <label>C$ <input type="number" inputmode="decimal" id="convCad" value="${rate ? (usd * rate).toFixed(2) : ""}"></label>
    <span class="hint">${rate ? `1 USD = ${rate.toFixed(4)} CAD` : "Loading rate…"}</span></div>`;
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
    (alert ? ` <span class="warn-t">· ${ic("triangle-alert", "xs")} ${esc(alert.event)}</span>` : "");
}

// ============================================================ calendar (private .ics links)
const WIN_TZ = {
  "Eastern Standard Time": "America/New_York", "Central Standard Time": "America/Chicago", "Mountain Standard Time": "America/Denver",
  "Pacific Standard Time": "America/Los_Angeles", "GMT Standard Time": "Europe/London", "W. Europe Standard Time": "Europe/Berlin",
  "Romance Standard Time": "Europe/Paris", "India Standard Time": "Asia/Kolkata", "US Eastern Standard Time": "America/Indianapolis",
};
function tzOffsetMs(tz, t) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - t;
  } catch { return null; }
}
function icsDate(val, params = {}) {
  const m = val.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, se, z] = m;
  if (h === undefined) return { date: new Date(+y, +mo - 1, +d), allDay: true };
  if (z) return { date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se)), allDay: false };
  const tz = WIN_TZ[params.TZID] || params.TZID;
  if (tz) {
    const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi, +se);
    const off = tzOffsetMs(tz, guess);
    if (off !== null) { const off2 = tzOffsetMs(tz, guess - off); return { date: new Date(guess - (off2 ?? off)), allDay: false }; }
  }
  return { date: new Date(+y, +mo - 1, +d, +h, +mi, +se), allDay: false };
}
const icsText = (v) => (v || "").replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
function parseICS(text) {
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = { exdates: [] }; continue; }
    if (line === "END:VEVENT") { if (cur?.start) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    const [name, ...ps] = line.slice(0, i).split(";");
    const params = Object.fromEntries(ps.map((x) => x.split("=")).map(([k, v]) => [k, (v || "").replace(/"/g, "")]));
    const val = line.slice(i + 1);
    switch (name) {
      case "UID": cur.uid = val; break;
      case "SUMMARY": cur.title = icsText(val); break;
      case "LOCATION": cur.location = icsText(val); break;
      case "DESCRIPTION": cur.desc = icsText(val).slice(0, 1500); break;
      case "URL": cur.url = val; break;
      case "STATUS": cur.status = val; break;
      case "RRULE": cur.rrule = Object.fromEntries(val.split(";").map((x) => x.split("="))); break;
      case "DTSTART": { const d = icsDate(val, params); if (d) { cur.start = d.date; cur.allDay = d.allDay; } break; }
      case "DTEND": { const d = icsDate(val, params); if (d) cur.end = d.date; break; }
      case "EXDATE": for (const v of val.split(",")) { const d = icsDate(v, params); if (d) cur.exdates.push(d.date.getTime()); } break;
      case "RECURRENCE-ID": { const d = icsDate(val, params); if (d) cur.recurrenceId = d.date.getTime(); break; }
    }
  }
  return events;
}
const DOW = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
function expandEvents(events, from, to) {
  const out = [];
  const overridden = new Set(events.filter((e) => e.recurrenceId).map((e) => `${e.uid}|${e.recurrenceId}`));
  for (const e of events) {
    if (e.status === "CANCELLED") continue;
    const dur = (e.end || e.start) - e.start || (e.allDay ? 86400e3 : 0);
    const push = (st) => {
      const en = new Date(st.getTime() + dur);
      if (en > from && st < to && !e.exdates.includes(st.getTime()) && !overridden.has(`${e.uid}|${st.getTime()}`))
        out.push({ ...e, start: st, end: en });
    };
    if (!e.rrule || e.recurrenceId) { push(e.start); continue; }
    const r = e.rrule, freq = r.FREQ, interval = +r.INTERVAL || 1, count = +r.COUNT || Infinity;
    const until = r.UNTIL ? icsDate(r.UNTIL)?.date : null;
    const byday = r.BYDAY ? r.BYDAY.split(",").map((x) => DOW[x.slice(-2)]).filter((x) => x !== undefined) : null;
    let n = 0, guard = 0;
    const cursor = new Date(e.start);
    const okDate = (d) => (!until || d <= until) && n < count;
    if (freq === "WEEKLY") {
      const days = byday?.length ? byday : [e.start.getDay()];
      const weekStart = new Date(cursor); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      while (guard++ < 2000) {
        for (const dw of [...days].sort()) {
          const d = new Date(weekStart); d.setDate(d.getDate() + dw);
          d.setHours(e.start.getHours(), e.start.getMinutes(), e.start.getSeconds(), 0);
          if (d < e.start) continue;
          if (!okDate(d) || d > to) { guard = 1e9; break; }
          n++; push(d);
        }
        weekStart.setDate(weekStart.getDate() + 7 * interval);
        if (weekStart > to) break;
      }
    } else if (["DAILY", "MONTHLY", "YEARLY"].includes(freq)) {
      while (guard++ < 3000 && cursor <= to && okDate(cursor)) {
        if (!(freq === "DAILY" && byday && !byday.includes(cursor.getDay()))) { n++; push(new Date(cursor)); }
        if (freq === "DAILY") cursor.setDate(cursor.getDate() + interval);
        else if (freq === "MONTHLY") cursor.setMonth(cursor.getMonth() + interval);
        else cursor.setFullYear(cursor.getFullYear() + interval);
      }
    } else push(e.start);
  }
  return out.sort((a, b) => a.start - b.start);
}

async function loadCalendar() {
  if (!$("#calendar-body")) return;
  const cals = cfg.calendars || [];
  const prev = data.calRaw || [];
  data.calRaw = await Promise.all(cals.map(async (c, i) => {
    const color = c.color || CAL_COLORS[i % CAL_COLORS.length];
    try { return { cal: c.name, color, events: parseICS(await api(`/api/ics?url=${encodeURIComponent(c.url)}`, true)) }; }
    catch (e) { return { cal: c.name, color, events: prev.find((p) => p.cal === c.name)?.events, error: `${c.name}: ${e.message}` }; }
  }));
  data.calErrors = data.calRaw.filter((r) => r.error).map((r) => r.error);
  refreshCalData();
  renderCalendar();
  renderBrief();
  updateBadges();
  stamp("calendar", !!data.calErrors.length);
}
const CAL_COLORS = ["#5b8cff", "#22c27a", "#f5b041", "#ff5c6c", "#a78bfa", "#38bdf8"];
const LOCAL_CAL = "Daily HQ", LOCAL_COLOR = "#ec4899", GAME_CAL = "My games", GAME_COLOR = "#ff8a3d";
const sod = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const dkey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const plusDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const calUI = { month: null, sel: null, list: [] };
function calMonthView() {
  const v = store.get(pkey("dhq-cal-view"));
  return v ? v === "month" : !matchMedia("(max-width: 680px)").matches;
}
function myGames() {
  const seen = new Set(), out = [];
  for (const { L, events } of data.sports || [])
    for (const e of events || []) {
      if (!isMine(L, e) || seen.has(e.id)) continue;
      seen.add(e.id);
      const st = new Date(e.date);
      out.push({ title: matchup(e), start: st, end: new Date(st.getTime() + 3 * 3600e3), cal: GAME_CAL, color: GAME_COLOR, game: true, tv: (e.broadcasts || []).slice(0, 2).join(", "), detail: e.state !== "pre" ? e.detail : "", league: L.key });
    }
  return out;
}
function calEventsBetween(from, to, games = true) {
  const hidden = new Set(cfg.calHidden || []);
  const out = [];
  for (const r of data.calRaw || [])
    if (r.events && !hidden.has(r.cal)) out.push(...expandEvents(r.events, from, to).map((e) => ({ ...e, cal: r.cal, color: r.color })));
  if (!hidden.has(LOCAL_CAL))
    for (const e of cfg.events || []) {
      const st = new Date(e.start), en = new Date(e.end || e.start);
      if (en > from && st < to) out.push({ ...e, start: st, end: en, cal: LOCAL_CAL, color: LOCAL_COLOR, local: true });
    }
  if (games && !hidden.has(GAME_CAL)) for (const g of myGames()) if (g.end > from && g.start < to) out.push(g);
  return out.sort((a, b) => a.start - b.start || b.allDay - a.allDay);
}
// today + tomorrow, used by the brief and alerts
function refreshCalData() {
  const t = sod(new Date());
  data.calendar = { events: calEventsBetween(t, plusDays(t, 2), false), errors: data.calErrors || [] };
}
const JOIN_RE = /https?:\/\/[^\s<>"')]*(?:teams\.microsoft\.com|teams\.live\.com|zoom\.us|meet\.google\.com|webex\.com|gotomeet|whereby\.com)[^\s<>"')]*/i;
const joinLink = (e) => [e.location, e.desc, e.url].map((x) => (x || "").match(JOIN_RE)?.[0]).find(Boolean);
const placeOf = (e) => {
  const l = (e.location || "").trim();
  return !l || /^https?:|microsoft teams|zoom meeting|google meet|webex/i.test(l) ? "" : l;
};
const mapsLink = (l) => `https://maps.apple.com/?q=${encodeURIComponent(l)}`;
const untilText = (ms) => {
  const m = Math.round(ms / 60000);
  if (m < 1) return "starting now";
  if (m < 60) return `in ${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  if (h < 24) return `in ${h}h${r ? ` ${r}m` : ""}`;
  const d = Math.round(h / 24);
  return `in ${d} day${d > 1 ? "s" : ""}`;
};
const calDayLabel = (d) => {
  const t = sod(new Date());
  if (sameDay(d, t)) return "Today";
  if (sameDay(d, plusDays(t, 1))) return "Tomorrow";
  if (sameDay(d, plusDays(t, -1))) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};
function dayWeather() {
  const w = data.weather?.find((x) => x.d)?.d?.daily;
  const m = new Map();
  if (w) w.time.forEach((t, i) => m.set(t, { code: w.weather_code[i], hi: Math.round(w.temperature_2m_max[i]), lo: Math.round(w.temperature_2m_min[i]), pop: w.precipitation_probability_max?.[i] }));
  return m;
}
const evTime = (e) => (e.allDay ? "All day" : `${hm(e.start)}${e.end - e.start > 0 && !e.game ? ` – ${hm(e.end)}` : ""}`);

function renderCalendar() {
  const body = $("#calendar-body");
  if (!body) return;
  const now = new Date(), today = sod(now);
  calUI.sel ||= today;
  calUI.month ||= new Date(today.getFullYear(), today.getMonth(), 1);
  const month = calMonthView(), sel = calUI.sel;
  let gStart, gEnd;
  if (month) {
    gStart = plusDays(calUI.month, -calUI.month.getDay());
    const last = new Date(calUI.month.getFullYear(), calUI.month.getMonth() + 1, 0);
    gEnd = plusDays(last, 7 - last.getDay());
  } else {
    gStart = plusDays(sel, -sel.getDay());
    gEnd = plusDays(gStart, 7);
  }
  const evs = calEventsBetween(gStart, gEnd);
  const byDay = new Map();
  for (const e of evs) {
    const d = sod(e.start < gStart ? gStart : e.start);
    do { const k = dkey(d); byDay.has(k) ? byDay.get(k).push(e) : byDay.set(k, [e]); d.setDate(d.getDate() + 1); } while (d < e.end && d < gEnd);
  }
  const wx = dayWeather();
  const cells = [];
  for (let d = new Date(gStart); d < gEnd; d = plusDays(d, 1)) {
    const k = dkey(d), list = byDay.get(k) || [];
    const colors = [...new Set(list.map((e) => e.color))].slice(0, 4);
    const w = wx.get(k);
    cells.push(`<button class="cal-d ${month && d.getMonth() !== calUI.month.getMonth() ? "out" : ""} ${sameDay(d, today) ? "today" : ""} ${sameDay(d, sel) ? "sel" : ""} ${d < today ? "past" : ""} ${[0, 6].includes(d.getDay()) ? "we" : ""}" data-cal-day="${k}" aria-label="${esc(d.toDateString())}${list.length ? `, ${list.length} events` : ""}">
      <span class="cal-n">${d.getDate()}</span>${w && d >= today ? `<span class="cal-wx">${wmo(w.code)[0]}</span>` : ""}
      <span class="cal-dots">${colors.map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</span></button>`);
  }
  const title = month
    ? calUI.month.toLocaleDateString([], { month: "long", year: "numeric" })
    : `${gStart.toLocaleDateString([], { month: "short", day: "numeric" })} – ${plusDays(gEnd, -1).toLocaleDateString([], { month: gStart.getMonth() === plusDays(gEnd, -1).getMonth() ? undefined : "short", day: "numeric" })}`;

  // filters: subscribed calendars + Daily HQ + games
  const hidden = new Set(cfg.calHidden || []);
  const srcs = [...(data.calRaw || []).map((r) => [r.cal, r.color]), [LOCAL_CAL, LOCAL_COLOR]];
  if ((data.sports || []).some(({ L }) => (L.teams || []).length)) srcs.push([GAME_CAL, GAME_COLOR]);
  const filters = srcs.length > 1 ? `<div class="cal-filters">${srcs.map(([n, c]) => `<button class="cal-f ${hidden.has(n) ? "off" : ""}" data-cal-filter="${esc(n)}" aria-pressed="${!hidden.has(n)}"><i style="background:${esc(c)}"></i>${esc(n)}</button>`).join("")}</div>` : "";

  // up next (next 30 days, timed events)
  const ahead = calEventsBetween(now, plusDays(today, 30));
  const nextEv = ahead.find((e) => !e.allDay && e.end > now);
  calUI.list = [];
  const reg = (e) => calUI.list.push(e) - 1;
  let nextHTML = "";
  if (nextEv) {
    const live = nextEv.start <= now, join = joinLink(nextEv), place = placeOf(nextEv);
    nextHTML = `<div class="cal-next" style="--evc:${esc(nextEv.color)}">
      <button class="cal-next-main" data-cal-ev="${reg(nextEv)}">
        <small>${live ? `<span class="pill live">NOW</span> until ${hm(nextEv.end)}` : `Up next · ${esc(calDayLabel(nextEv.start))} ${hm(nextEv.start)} · <b>${untilText(nextEv.start - now)}</b>`}</small>
        <b class="cal-next-t">${esc(nextEv.title || "Busy")}</b>
        <span class="cal-next-m">${esc(nextEv.cal)}${nextEv.tv ? ` · ${esc(nextEv.tv)}` : ""}</span></button>
      ${join || place ? `<div class="cal-next-acts">${join ? `<a class="btn sm primary" href="${esc(join)}" target="_blank" rel="noopener">${ic("video")} Join</a>` : ""}${place ? `<a class="btn sm" href="${esc(mapsLink(place))}" target="_blank" rel="noopener">${ic("map-pin")} ${esc(place.length > 28 ? place.slice(0, 27) + "…" : place)}</a>` : ""}</div>` : ""}
    </div>`;
  }

  // selected day list
  const dayEvs = calEventsBetween(sel, plusDays(sel, 1));
  const w = wx.get(dkey(sel));
  const dayHTML = `<div class="cal-dayh"><b>${esc(calDayLabel(sel))}</b>${calDayLabel(sel) !== sel.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }) ? `<small>${esc(sel.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }))}</small>` : ""}
      ${w ? `<span class="cal-daywx">${wmo(w.code)[0]} ${w.hi}° / ${w.lo}°${w.pop >= 30 ? ` · ${w.pop}% rain` : ""}</span>` : ""}
      <button class="mini-btn" data-cal-add="${dkey(sel)}">${ic("plus")} Add</button></div>
    ${dayEvs.map((e) => {
      const live = e.start <= now && e.end > now;
      return `<button class="ev ${live ? "now" : ""} ${e.end <= now ? "past" : ""}" data-cal-ev="${reg(e)}"><span class="ev-dot" style="background:${esc(e.color)}"></span>
        <span class="ev-main"><span class="ev-title">${e.game ? ic("trophy", "xs") + " " : ""}${esc(e.title || "Busy")}</span><span class="ev-meta">${evTime(e)}${placeOf(e) ? ` · ${esc(placeOf(e))}` : ""}${e.tv ? ` · ${esc(e.tv)}` : ""} · ${esc(e.cal)}</span></span>
        ${live ? `<span class="pill live">NOW</span>` : joinLink(e) && e.end > now ? ic("video", "xs") : ""}</button>`;
    }).join("") || `<div class="ev-none">Nothing scheduled. <button class="linkish" data-cal-add="${dkey(sel)}">Add something</button></div>`}`;

  const connect = !(cfg.calendars || []).length ? `<div class="cal-connect">${ic("link")} Show your Outlook, Google or iCloud events here. <button class="linkish" data-config="calendar">Connect a calendar</button></div>` : "";
  body.innerHTML = `
    <form class="cal-quick" data-cal-quick><span class="cal-quick-ic">${ic("sparkles")}</span><input name="q" placeholder="Quick add: Lunch with Alex Tue 12:30" autocomplete="off" enterkeyhint="done"><button class="btn sm primary" type="submit" aria-label="Add">${ic("plus")}</button></form>
    ${nextHTML}
    <div class="cal-top">
      <div class="cal-nav"><button class="icon-btn sm" data-cal-nav="-1" aria-label="Previous">${ic("chevron-left")}</button><b>${esc(title)}</b><button class="icon-btn sm" data-cal-nav="1" aria-label="Next">${ic("chevron-right")}</button></div>
      <div class="cal-acts"><button class="mini-btn" data-cal-today>Today</button><button class="mini-btn" data-cal-view>${month ? "Week" : "Month"}</button></div>
    </div>
    <div class="cal-grid ${month ? "month" : "week"}">${["S", "M", "T", "W", "T", "F", "S"].map((x) => `<span class="cal-dow">${x}</span>`).join("")}${cells.join("")}</div>
    ${filters}
    <div class="cal-day">${dayHTML}</div>
    ${connect}
    ${data.calErrors?.length ? `<div class="err">${esc(data.calErrors.join(" · "))}</div>` : ""}`;
}

// ---------- quick add: "Lunch with Alex Tue 12:30", "Dentist Nov 12 3pm for 45m", "Gym tomorrow 6am"
const MONTHS3 = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function parseQuick(text, base) {
  let s = ` ${text.trim()} `;
  const now = new Date();
  let date = null, time = null, dur = 60;
  const take = (re, fn) => { const m = s.match(re); if (!m) return false; fn(m); s = s.replace(m[0], " "); return true; };
  take(/\s(?:for\s)?(\d+(?:\.\d+)?)\s?(hours?|hrs?|h|minutes?|mins?|m)(?=\s)/i, (m) => (dur = /^h/i.test(m[2]) ? +m[1] * 60 : +m[1]));
  take(/\s(today|tonight)(?=\s)/i, (m) => { date = sod(now); if (/night/i.test(m[1])) time = [19, 0]; }) ||
    take(/\s(?:tomorrow|tmrw|tmr)(?=\s)/i, () => (date = plusDays(sod(now), 1))) ||
    take(/\s(?:on\s)?(next\s)?(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?(?=\s)/i, (m) => {
      const t = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(m[2].toLowerCase());
      let add = (t - now.getDay() + 7) % 7;
      if (add === 0 || m[1]) add += add === 0 ? 7 : 0;
      date = plusDays(sod(now), add);
    }) ||
    take(/\s(?:on\s)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s(\d{1,2})(?:st|nd|rd|th)?,?(?=\s)/i, (m) => {
      date = new Date(now.getFullYear(), MONTHS3.indexOf(m[1].toLowerCase()), +m[2]);
      if (date < sod(now)) date.setFullYear(date.getFullYear() + 1);
    }) ||
    take(/\s(?:on\s)?(\d{1,2})\/(\d{1,2})(?=\s)/, (m) => {
      date = new Date(now.getFullYear(), +m[1] - 1, +m[2]);
      if (date < sod(now)) date.setFullYear(date.getFullYear() + 1);
    });
  take(/\s(?:at\s|@\s?)?(\d{1,2})(?::(\d{2}))?\s?(am|pm|a|p)(?=\s)/i, (m) => { let h = +m[1] % 12; if (/^p/i.test(m[3])) h += 12; time = [h, +(m[2] || 0)]; }) ||
    take(/\s(?:at\s|@\s?)?(\d{1,2}):(\d{2})(?=\s)/, (m) => { let h = +m[1]; if (h < 7) h += 12; time = [h, +m[2]]; }) ||
    take(/\s(?:at\s)?(noon|midnight)(?=\s)/i, (m) => (time = /noon/i.test(m[1]) ? [12, 0] : [0, 0])) ||
    take(/\s(?:at|@)\s(\d{1,2})(?=\s)/i, (m) => { let h = +m[1]; if (h < 7) h += 12; time = [h, 0]; });
  date ||= sod(base || now);
  const start = new Date(date);
  if (time) start.setHours(time[0], time[1], 0, 0);
  const end = time ? new Date(start.getTime() + dur * 60000) : plusDays(start, 1);
  const title = s.replace(/\s(at|on|@)\s*$/i, " ").replace(/\s+/g, " ").trim();
  return { title: title || "New event", start, end, allDay: !time };
}

// ---------- local events + "send to your calendar"
const toLocalInput = (d) => `${dkey(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const icsStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
function sendLinks(e) {
  const st = new Date(e.start), en = new Date(e.end);
  const q = (o) => Object.entries(o).filter(([, v]) => v !== "" && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const allEnd = plusDays(sod(en), sameDay(st, en) || en.getHours() || en.getMinutes() ? 1 : 0);
  const ol = (host) => `https://${host}/calendar/0/deeplink/compose?` + q({ path: "/calendar/action/compose", rru: "addevent", subject: e.title, startdt: e.allDay ? dkey(st) : st.toISOString(), enddt: e.allDay ? dkey(allEnd) : en.toISOString(), allday: e.allDay ? "true" : "", location: e.location, body: e.notes });
  const g = "https://calendar.google.com/calendar/render?" + q({ action: "TEMPLATE", text: e.title, dates: e.allDay ? `${ymd(st)}/${ymd(allEnd)}` : `${icsStamp(st)}/${icsStamp(en)}`, location: e.location, details: e.notes });
  const ics = "/api/event.ics?" + q({ title: e.title, start: e.allDay ? ymd(st) : icsStamp(st), end: e.allDay ? ymd(allEnd) : icsStamp(en), location: e.location, notes: e.notes });
  return `<div class="send-cal"><small>Also add it to your calendar</small><div class="send-btns">
    <a class="btn sm" href="${esc(ol("outlook.live.com"))}" target="_blank" rel="noopener">${ic("mail")} Outlook.com</a>
    <a class="btn sm" href="${esc(ol("outlook.office.com"))}" target="_blank" rel="noopener">${ic("briefcase")} Outlook (work)</a>
    <a class="btn sm" href="${esc(g)}" target="_blank" rel="noopener">${ic("calendar-days")} Google</a>
    <a class="btn sm" href="${esc(ics)}">${ic("smartphone")} iPhone / Apple</a></div>
    <p class="hint">Opens that calendar with everything filled in — tap Save there. Subscribed calendars can take a while to refresh in Daily HQ.</p></div>`;
}
function eventForm(e = {}) {
  const st = e.start ? new Date(e.start) : (() => { const d = new Date(calUI.sel || new Date()); const n = new Date(); d.setHours(n.getHours() + 1, 0, 0, 0); return d; })();
  const en = e.end ? new Date(e.end) : new Date(st.getTime() + 3600e3);
  openModal(`${ic(e.id ? "pencil" : "calendar-plus")} ${e.id ? "Edit event" : "New event"}`, `
    <form class="ev-form" data-ev-form="${esc(e.id || "")}">
      <label class="fld">What<input name="title" value="${esc(e.title || "")}" placeholder="e.g. Lunch with Alex" required></label>
      <label class="chk"><input type="checkbox" name="allDay" ${e.allDay ? "checked" : ""}> All day</label>
      <div class="ev-when">
        <label class="fld">Starts<input type="${e.allDay ? "date" : "datetime-local"}" name="start" value="${e.allDay ? dkey(st) : toLocalInput(st)}" required></label>
        <label class="fld">Ends<input type="${e.allDay ? "date" : "datetime-local"}" name="end" value="${e.allDay ? dkey(plusDays(en, sameDay(st, en) ? 0 : -1)) : toLocalInput(en)}"></label>
      </div>
      <label class="fld">Where<input name="location" value="${esc(e.location || "")}" placeholder="Address or meeting link"></label>
      <label class="fld">Notes<textarea name="notes" rows="2">${esc(e.notes || "")}</textarea></label>
      <button class="btn primary wide" type="submit">${ic("check")} ${e.id ? "Save changes" : "Save to Daily HQ"}</button>
    </form>`);
}
function saveEventForm(form) {
  const f = new FormData(form), allDay = !!f.get("allDay");
  const parse = (v) => (allDay ? new Date(v + "T00:00") : new Date(v));
  const start = parse(f.get("start"));
  if (isNaN(start)) return toast("Pick a start date");
  let end = f.get("end") ? parse(f.get("end")) : null;
  if (allDay) end = plusDays(end && !isNaN(end) && end >= start ? end : start, 1);
  else if (!end || isNaN(end) || end <= start) end = new Date(start.getTime() + 3600e3);
  const id = form.dataset.evForm || `l${Date.now().toString(36)}`;
  const ev = { id, title: (f.get("title") || "").trim() || "New event", start: start.toISOString(), end: end.toISOString(), allDay, location: (f.get("location") || "").trim(), notes: (f.get("notes") || "").trim() };
  addLocalEvent(ev);
  showEvent(ev, true);
}
function addLocalEvent(ev) {
  cfg.events = (cfg.events || []).filter((x) => x.id !== ev.id);
  cfg.events.push(ev);
  const cutoff = Date.now() - 120 * 864e5;
  cfg.events = cfg.events.filter((x) => new Date(x.end) > cutoff).sort((a, b) => new Date(a.start) - new Date(b.start));
  calUI.sel = sod(new Date(ev.start));
  calUI.month = new Date(calUI.sel.getFullYear(), calUI.sel.getMonth(), 1);
  save(); refreshCalData(); renderCalendar(); renderBrief();
}
function showEvent(e, justSaved = false) {
  const st = new Date(e.start), en = new Date(e.end);
  const join = joinLink(e), place = placeOf(e);
  const when2 = e.allDay ? `${calDayLabel(st)} · All day` : `${calDayLabel(st)} · ${hm(st)}${e.game ? "" : ` – ${hm(en)}`}`;
  const local = e.local || (cfg.events || []).some((x) => x.id === e.id);
  openModal(`${e.game ? ic("trophy") : ic("calendar-days")} ${esc(e.title || "Busy")}`, `
    ${justSaved ? `<div class="ok-note">${ic("check")} Saved to Daily HQ${cfg.sync?.code ? " and synced to your devices" : ""}.</div>` : ""}
    <div class="ev-det">
      <div>${ic("clock")} ${esc(when2)}${!e.allDay && en > new Date() && st > new Date() ? ` <small>(${untilText(st - new Date())})</small>` : ""}</div>
      <div><i class="ev-dot" style="background:${esc(e.color || LOCAL_COLOR)}"></i> ${esc(e.cal || LOCAL_CAL)}</div>
      ${e.tv ? `<div>${ic("tv")} ${esc(e.tv)}</div>` : ""}
      ${place ? `<div>${ic("map-pin")} <a href="${esc(mapsLink(place))}" target="_blank" rel="noopener">${esc(place)}</a></div>` : ""}
      ${join ? `<a class="btn primary wide" href="${esc(join)}" target="_blank" rel="noopener">${ic("video")} Join meeting</a>` : ""}
      ${e.notes ? `<p class="ev-notes">${esc(e.notes)}</p>` : e.desc && !e.game ? `<p class="ev-notes">${esc(e.desc.slice(0, 400))}${e.desc.length > 400 ? "…" : ""}</p>` : ""}
    </div>
    ${local ? sendLinks(e) + `<div class="ev-acts"><button class="btn" data-ev-edit="${esc(e.id)}">${ic("pencil")} Edit</button><button class="btn danger" data-ev-del="${esc(e.id)}">${ic("trash-2")} Delete</button></div>` : ""}
    ${e.game ? `<button class="btn wide" data-cal-scores>${ic("trophy")} Open Scores</button>` : ""}
    ${!local && !e.game ? `<p class="hint">From your ${esc(e.cal)} calendar — edit it there.</p>` : ""}`);
}

// ============================================================ brief
let briefEvents = [];
let backSpot = null;
function showBackPill(label) {
  let b = $("#backPill");
  if (!b) { b = document.createElement("button"); b.id = "backPill"; b.className = "back-pill"; b.dataset.backPill = ""; document.body.append(b); }
  b.innerHTML = `${ic("chevron-left")} Back to ${esc(label)}`;
  b.hidden = false;
}
function hideBackPill() { const b = $("#backPill"); if (b) b.hidden = true; backSpot = null; }
function goBack() {
  const spot = backSpot;
  hideBackPill();
  if (!spot) return;
  if (spot.view && document.body.dataset.view !== spot.view) setView(spot.view);
  requestAnimationFrame(() => scrollTo({ top: spot.y, behavior: "smooth" }));
}
function goToSection(id, from = "Your brief") {
  const spot = { view: document.body.dataset.view || "home", y: scrollY };
  if (cfg.collapsed?.[id]) { delete cfg.collapsed[id]; save(); $(`#sec-${id}`)?.classList.remove("collapsed"); }
  const el = $(`#sec-${id}`);
  if (!el) return;
  if (matchMedia("(max-width: 680px)").matches) {
    if (["sports", "weather", "news", "markets", "calendar"].includes(id)) { setView(id); backSpot = spot; showBackPill(from); return; }
    if (document.body.dataset.view && document.body.dataset.view !== "home") setView("home");
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  backSpot = spot;
  showBackPill(from);
}
function renderBrief() {
  const body = $("#brief-body");
  if (!body) return;
  const rows = [];
  // weather
  const w = data.weather.find((x) => x.d);
  if (w) {
    const cur = w.d.current, dl = w.d.daily, hr = w.d.hourly;
    const [icon, desc] = wmo(cur.weather_code, cur.is_day);
    const nowIdx = Math.max(0, hr.time.findIndex((t) => t >= cur.time.slice(0, 13)));
    const today = cur.time.slice(0, 10);
    let rain = "";
    for (let j = nowIdx; j < hr.time.length && hr.time[j].startsWith(today); j++)
      if (hr.precipitation_probability[j] >= 50) { const hh = +hr.time[j].slice(11, 13); rain = ` ${[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(hr.weather_code[j]) || true ? "Rain" : "Precipitation"} likely around ${hh % 12 || 12} ${hh < 12 ? "AM" : "PM"}.`; break; }
    const aq = w.aqi != null ? ` Air quality ${aqiLabel(w.aqi).toLowerCase()}.` : "";
    rows.push(`<div class="br-row">${icon}<div><button class="br-link" data-goto="weather"><b>${Math.round(cur.temperature_2m)}° and ${esc(desc.toLowerCase())}</b> in ${esc(w.c.name.split(",")[0])} ${ic("chevron-right", "xs")}</button>${cur._next ? ` <b>${esc(cur._next)}.</b>` : ""} High ${Math.round(dl.temperature_2m_max[0])}°, low ${Math.round(dl.temperature_2m_min[0])}°.${rain}${aq}</div></div>`);
    for (const a of data.weather.flatMap((x) => (x.alerts || []).map((al) => ({ al, city: x.c.name.split(",")[0] }))).slice(0, 2))
      rows.push(`<div class="br-row warn">${ic("triangle-alert")}<div><button class="br-link" data-goto="weather"><b>${esc(a.al.event)}</b> for ${esc(a.city)}${a.al.ends ? ` until ${esc(when(a.al.ends))}` : ""}. ${ic("chevron-right", "xs")}</button></div></div>`);
  }
  // commute
  const cm = commuteRow(); if (cm) rows.push(cm);
  // calendar: every event is tappable; the summary jumps to today in the calendar
  if (data.calendar) {
    const now = new Date(), end = new Date(); end.setHours(23, 59, 59);
    const todays = data.calendar.events.filter((e) => e.end > now && e.start <= end);
    const left = todays.filter((e) => !e.allDay);
    const allDay = todays.filter((e) => e.allDay);
    briefEvents = [...left, ...allDay];
    const chips = briefEvents.slice(0, 6).map((e, i) => `<button class="br-ev" data-brief-ev="${i}"><i style="background:${esc(e.color || LOCAL_COLOR)}"></i><span class="br-ev-t">${e.allDay ? "All day" : e.start <= now ? "Now" : hm(e.start)}</span> ${esc(e.title || "Busy")}</button>`).join("");
    const more = briefEvents.length > 6 ? `<button class="br-ev more" data-brief-cal>+${briefEvents.length - 6} more</button>` : "";
    if ((cfg.calendars || []).length || (cfg.events || []).length || briefEvents.length)
      rows.push(`<div class="br-row">${ic("calendar-days")}<div><button class="br-link" data-brief-cal>${left.length ? `<b>${left.length} ${left.length === 1 ? "event" : "events"} left today</b>` : "<b>No more meetings today</b>"}${allDay.length ? ` · ${allDay.length} all-day` : ""} ${ic("chevron-right", "xs")}</button>${chips || more ? `<div class="br-evs">${chips}${more}</div>` : ""}</div></div>`);
  }
  // sports
  const mine = data.sports.flatMap(({ L, events }) => (events || []).filter((e) => isMine(L, e)).map((e) => ({ e, L })));
  const live = mine.filter((x) => x.e.state === "in");
  const recent = mine.filter((x) => x.e.state === "post" && Date.now() - new Date(x.e.date) < 30 * 3600e3);
  const tonight = mine.filter((x) => x.e.state === "pre" && sameDay(new Date(x.e.date), new Date()));
  const seenG = new Set();
  const sport = [];
  for (const { e, L } of [...live, ...recent, ...tonight]) {
    if (seenG.has(e.id)) continue; seenG.add(e.id);
    const [a, b] = [e.teams.find((t) => t.homeAway === "away"), e.teams.find((t) => t.homeAway === "home")];
    if (!a || !b) continue;
    const fin = e.state === "post", liveG = e.state === "in";
    const tl = (t, o) => `<span class="bs-t ${fin && +t.score < +o.score ? "lose" : ""} ${(L.teams || []).includes(t.abbr) ? "mine" : ""}">${imgOr(t.logo, t.abbr, "bs-logo")}<span class="bs-n">${esc(t.abbr || t.name)}</span>${liveG || fin ? `<b class="bs-s">${esc(t.score ?? "")}</b>` : ""}</span>`;
    const st = liveG ? `<span class="pill live">LIVE</span><span class="bs-d">${esc(e.detail)}</span>` : fin ? `<span class="pill final">${esc(e.detail || "Final")}</span>` : `<span class="bs-d">${hm(e.date)}${e.broadcasts?.length ? ` · ${esc(e.broadcasts[0])}` : ""}</span>`;
    sport.push(`<button class="bs-game ${liveG ? "is-live" : ""}" data-game="${esc(e.id)}" data-path="${esc(LEAGUES[L.key]?.path || "")}" title="${esc(matchup(e))}">${leagueBadge(L.key, "bs-lg")}${tl(a, b)}<span class="bs-at">${liveG || fin ? "–" : "@"}</span>${tl(b, a)}<span class="bs-st">${st}</span>${ic("chevron-right", "xs")}</button>`);
  }
  if (sport.length) rows.push(`<div class="br-row">${ic("trophy")}<div class="bs-list">${sport.slice(0, 5).join("")}</div></div>`);
  // markets
  const idx = ["^GSPC", "^IXIC", "^DJI"].map((s) => data.quotes[s]).filter((q) => q && !q.error);
  if (idx.length) {
    const movers = cfg.markets.groups.flatMap((g) => g.symbols).filter((s) => !/^\^|=X$|=F$/.test(s)).map((s) => data.quotes[s]).filter((q) => q && !q.error && q.pct != null).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    const top = movers[0];
    rows.push(`<div class="br-row">${ic("trending-up")}<div><button class="br-link" data-goto="markets">${marketOpen() ? "" : "<b>Market closed.</b> "}${idx.map((q) => `${esc(label(q.symbol))} <span class="${cls(q.pct)}">${sign(q.pct)}${fmtNum(q.pct, 2)}%</span>`).join(" · ")}${top ? `. Top mover: <b>${esc(label(top.symbol))}</b> <span class="${cls(top.pct)}">${sign(top.pct)}${fmtNum(top.pct, 1)}%</span>` : ""}. ${ic("chevron-right", "xs")}</button></div></div>`);
  }
  // headlines
  const cat = cfg.news.categories.find((c) => c.on && data.news[c.id]?.items?.length);
  if (cat) rows.push(`<div class="br-row">${ic("newspaper")}<div class="br-heads">${data.news[cat.id].items.slice(0, 3).map((i) => `<a href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a>`).join("")}</div></div>`);
  rows.push(...extrasRows());
  body.innerHTML = rows.length ? `<div class="brief">${rows.join("")}</div>` : skeleton(4);
  loadExtras();
  loadCommute();
}

// ============================================================ modal, game details, standings
function openModal(title, html) {
  $("#modalTitle").innerHTML = title;
  $("#modalBody").innerHTML = html;
  $("#modal").hidden = false;
  document.body.classList.add("modal-open");
}
function closeModal() {
  $("#modal").hidden = true;
  document.body.classList.remove("modal-open");
  clearInterval(openModal.timer);
}
async function espnOrProxy(direct, proxy) {
  try { return await espnJSON(direct); } catch { return await api(proxy); }
}
async function showGame(path, id) {
  const lg = Object.values(LEAGUES).find((l) => l.path === path);
  openModal(`${lg ? lg.name : ""} game`, skeleton(6));
  const load = async () => {
    try {
      const d = await espnOrProxy(`${ESPN}${path}/summary?event=${id}`, `/api/sports?path=${path}&kind=summary&event=${id}`);
      $("#modalBody").innerHTML = gameDetailHTML(d, path, id);
      const st = d.header?.competitions?.[0]?.status?.type?.state;
      if (st !== "in") clearInterval(openModal.timer);
    } catch { $("#modalBody").innerHTML = `<div class="err">Couldn't load game details right now.</div>`; }
  };
  await load();
  clearInterval(openModal.timer);
  openModal.timer = setInterval(() => { if (!$("#modal").hidden) load(); }, 30000);
}
function gameDetailHTML(d, path, id) {
  const comp = d.header?.competitions?.[0] || {};
  if (!comp.competitors?.length) return `<div class="empty">Details for this game aren't available yet.</div><a class="btn wide" href="https://www.espn.com/${path.split("/")[1]}/game/_/gameId/${id}" target="_blank" rel="noopener">Open on ESPN ${ic("external-link", "xs")}</a>`;
  const st = comp.status?.type || {};
  const teams = [...(comp.competitors || [])].sort((a) => (a.homeAway === "away" ? -1 : 1));
  const periods = Math.max(0, ...teams.map((t) => (t.linescores || []).length));
  const head = `<div class="gd-head">${teams.map((t) => `<div class="gd-team ${t.winner ? "win" : ""}">${t.team?.logos?.[0]?.href || t.team?.logo ? `<img src="${esc(t.team.logos?.[0]?.href || t.team.logo)}" alt="">` : ""}<span>${esc(t.team?.shortDisplayName || t.team?.displayName)}</span><b>${st.state === "pre" ? "" : esc(t.score ?? "")}</b><small>${esc(t.record?.[0]?.summary || t.records?.[0]?.summary || "")}</small></div>`).join(`<div class="gd-vs">${st.state === "in" ? `<span class="pill live">LIVE</span>` : ""}<span>${esc(st.shortDetail || st.detail || "")}</span></div>`)}</div>`;
  const line = periods
    ? `<table class="gd-line"><thead><tr><th></th>${Array.from({ length: periods }, (_, i) => `<th>${i + 1 > (path.includes("hockey") ? 3 : path.includes("baseball") ? 9 : 4) ? (path.includes("hockey") ? (i === 3 ? "OT" : "SO") : "OT") : i + 1}</th>`).join("")}<th>T</th></tr></thead><tbody>${teams.map((t) => `<tr><td>${esc(t.team?.abbreviation)}</td>${Array.from({ length: periods }, (_, i) => `<td>${esc(t.linescores?.[i]?.displayValue ?? "")}</td>`).join("")}<td><b>${esc(t.score ?? "")}</b></td></tr>`).join("")}</tbody></table>`
    : "";
  const plays = (d.scoringPlays || []).slice(-25).map((p) => `<li><span class="gd-when">${p.period?.number ? `P${p.period.number}` : ""} ${esc(p.clock?.displayValue || "")}</span><b>${esc(p.team?.abbreviation || "")}</b> ${esc(p.text || "")}</li>`).join("");
  const leaders = (d.leaders || []).map((tl) => `<div class="gd-lead"><b>${esc(tl.team?.abbreviation || "")}</b>${(tl.leaders || []).slice(0, 3).map((c) => `<span>${esc(c.displayName)}: ${esc(c.leaders?.[0]?.athlete?.displayName || "")} ${esc(c.leaders?.[0]?.displayValue || "")}</span>`).join("")}</div>`).join("");
  const info = d.gameInfo || {};
  const nets = (comp.broadcasts || []).map((b) => b.media?.shortName || b.names?.join(", ")).filter(Boolean);
  const meta = [info.venue?.fullName, nets.length ? `${ic("tv")} ${nets.join(", ")}` : "", info.attendance ? `Attendance ${Number(info.attendance).toLocaleString()}` : ""].filter(Boolean).join(" · ");
  const link = (d.header?.links || []).find((l) => (l.rel || []).includes("summary"))?.href || `https://www.espn.com/${path.split("/")[1]}/game/_/gameId/${id}`;
  const pick = d.pickcenter?.[0] || d.odds?.[0];
  const odds = cfg.sports.odds !== false && pick?.details ? `<div class="gd-meta">${ic("trending-up")} Line: <b>${esc(pick.details)}</b>${pick.overUnder != null ? ` · Over/under <b>${esc(pick.overUnder)}</b>` : ""}${pick.provider?.name ? ` <small>(${esc(pick.provider.name)})</small>` : ""}</div>` : "";
  const inj = (d.injuries || []).map((tm) => {
    const list = (tm.injuries || []).filter((x) => x.athlete?.displayName).slice(0, 8);
    if (!list.length) return "";
    return `<div class="gd-inj"><b>${esc(tm.team?.abbreviation || tm.team?.displayName || "")}</b><ul>${list.map((x) => `<li>${esc(x.athlete.displayName)}${x.athlete.position?.abbreviation ? ` <small>${esc(x.athlete.position.abbreviation)}</small>` : ""} — <span class="inj-st">${esc(x.status || x.type?.description || "Out")}</span>${x.details?.type ? ` <small>(${esc(x.details.type)})</small>` : ""}</li>`).join("")}</ul></div>`;
  }).join("");
  return head + line + (meta ? `<div class="gd-meta">${meta}</div>` : "") + odds +
    (inj ? `<h4 class="gd-h">Injuries</h4><div class="gd-injs">${inj}</div>` : "") +
    (plays ? `<h4 class="gd-h">Scoring</h4><ol class="gd-plays">${plays}</ol>` : "") +
    (leaders ? `<h4 class="gd-h">Leaders</h4>${leaders}` : "") +
    `<a class="btn wide" href="${esc(link)}" target="_blank" rel="noopener">Open full game on ESPN ${ic("external-link", "xs")}</a>`;
}
const STANDING_COLS = {
  hockey: [["gamesPlayed", "GP"], ["wins", "W"], ["losses", "L"], ["otLosses", "OTL"], ["points", "PTS"]],
  basketball: [["wins", "W"], ["losses", "L"], ["winPercent", "PCT"], ["gamesBehind", "GB"], ["streak", "STRK"]],
  football: [["wins", "W"], ["losses", "L"], ["ties", "T"], ["winPercent", "PCT"], ["streak", "STRK"]],
  baseball: [["wins", "W"], ["losses", "L"], ["winPercent", "PCT"], ["gamesBehind", "GB"]],
  soccer: [["gamesPlayed", "GP"], ["wins", "W"], ["ties", "D"], ["losses", "L"], ["points", "PTS"]],
};
async function showStandings(key) {
  const L = LEAGUES[key];
  const mineTeams = cfg.sports.leagues.find((x) => x.key === key)?.teams || [];
  openModal(`${leagueBadge(key)} ${L.name} standings`, skeleton(8));
  try {
    const d = await espnOrProxy(`https://site.api.espn.com/apis/v2/sports/${L.path}/standings`, `/api/sports?path=${L.path}&kind=standings`);
    const groups = [];
    const walk = (n) => { if (n?.standings?.entries?.length) groups.push({ name: n.name || n.abbreviation || L.name, entries: n.standings.entries }); (n?.children || []).forEach(walk); };
    walk(d);
    const sport = L.path.split("/")[0];
    const cols = STANDING_COLS[sport] || STANDING_COLS.basketball;
    const stat = (e, n) => e.stats?.find((s) => s.name === n || s.type === n.toLowerCase())?.displayValue ?? "";
    const num = (e, n) => Number(e.stats?.find((s) => s.name === n)?.value ?? 0);
    const sortKey = sport === "hockey" || sport === "soccer" ? "points" : "winPercent";
    $("#modalBody").innerHTML = groups.length
      ? groups.map((g) => `<h4 class="gd-h">${esc(g.name)}</h4><table class="st-table"><thead><tr><th>#</th><th class="tl">Team</th>${cols.map(([, h]) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
          [...g.entries].sort((a, b) => num(b, sortKey) - num(a, sortKey)).map((e, i) => `<tr class="${mineTeams.includes(e.team?.abbreviation) ? "mine" : ""}"><td>${i + 1}</td><td class="tl">${e.team?.logos?.[0]?.href ? `<img src="${esc(e.team.logos[0].href)}" alt="">` : ""}${esc(e.team?.shortDisplayName || e.team?.displayName)}</td>${cols.map(([n]) => `<td>${esc(stat(e, n))}</td>`).join("")}</tr>`).join("")
        }</tbody></table>`).join("")
      : `<div class="empty">Standings aren't available right now.</div>`;
  } catch { $("#modalBody").innerHTML = `<div class="err">Couldn't load standings right now.</div>`; }
}

// ============================================================ air quality
const aqiLabel = (v) => (v <= 50 ? "Good" : v <= 100 ? "Moderate" : v <= 150 ? "Unhealthy for sensitive groups" : v <= 200 ? "Unhealthy" : "Very unhealthy");
const aqiCls = (v) => (v <= 50 ? "aq-good" : v <= 100 ? "aq-mod" : "aq-bad");
const uvLabel = (v) => (v < 3 ? "Low" : v < 6 ? "Moderate" : v < 8 ? "High" : "Very high");

// ============================================================ alerts (in-app + device notifications)
const SEEN_KEY = pkey("dailyhq.alertsSeen"), LOG_KEY = pkey("dailyhq.alertLog");
// On the very first run, quietly record what's already happening instead of alerting on it
let alertsBootstrap = !store.get(SEEN_KEY);
const alertsLoaded = new Set();
function checkAlerts(kind) {
  if (kind) alertsLoaded.add(kind);
  const A = cfg.alerts || {};
  const cands = [];
  const etDay = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const muted = new Set(A.mute || []);
  if (A.gameStart || A.finals || A.pregame) for (const { L, events } of data.sports) for (const e of events || []) {
    if (!isMine(L, e) || muted.has(`lg:${L.key}`)) continue;
    if ((L.teams || []).filter((ab) => e.teams.some((t) => t.abbr === ab)).every((ab) => muted.has(`tm:${L.key}:${ab}`))) continue;
    const [a, b] = [e.teams.find((t) => t.homeAway === "away"), e.teams.find((t) => t.homeAway === "home")];
    if (!a || !b) continue;
    const lgName = LEAGUES[L.key]?.name || "";
    const mineT = [a, b].find((t) => (L.teams || []).includes(t.abbr)) || a;
    const tm = (t) => ({ abbr: t.abbr, logo: t.logo, name: t.name, score: t.score, record: t.record, winner: t.winner, mine: (L.teams || []).includes(t.abbr) });
    const vis = { t: "game", lg: L.key, a: tm(a), b: tm(b), path: LEAGUES[L.key]?.path, id: e.id, icon: mineT.logo, state: e.state, detail: e.detail, tv: (e.broadcasts || []).slice(0, 2).join(", ") };
    const mins = (new Date(e.date) - Date.now()) / 6e4;
    if (A.pregame && e.state === "pre" && mins > 0 && mins <= 30) cands.push({ id: `pre-${e.id}`, title: `${lgName} · Starting soon: ${a.name} @ ${b.name}`, body: `${hm(e.date)}${e.broadcasts?.length ? ` on ${e.broadcasts.slice(0, 2).join(", ")}` : ""}`, vis: { ...vis, state: "pre", detail: hm(e.date) } });
    if (A.gameStart && e.state === "in") cands.push({ id: `start-${e.id}`, title: `${lgName} · Game on: ${a.name} @ ${b.name}`, body: e.broadcasts?.length ? `Watch on ${e.broadcasts.slice(0, 2).join(", ")}` : e.detail, vis: { ...vis, live: true } });
    if (A.finals && e.state === "post" && Date.now() - new Date(e.date) < 8 * 3600e3) cands.push({ id: `final-${e.id}`, title: `${lgName} · Final: ${a.name} ${a.score}, ${b.name} ${b.score}`, body: e.detail, vis });
  }
  if (A.rainToday) for (const w of data.weather) {
    if (muted.has(`city:${w.c.name}`) || !w.d) continue;
    const pop = w.d.daily?.precipitation_probability_max?.[0] ?? 0, code = w.d.daily?.weather_code?.[0];
    if (pop >= 60 && new Date().getHours() >= 6) cands.push({ id: `rain-${w.c.name}-${etDay}`, title: `${[71, 73, 75, 77, 85, 86].includes(code) ? "Snow" : "Rain"} likely today · ${w.c.name.split(",")[0]}`, body: `${pop}% chance — high ${Math.round(w.d.daily.temperature_2m_max[0])}°`, vis: { t: "wx", ev: [71, 73, 75, 77, 85, 86].includes(code) ? "snow" : "rain" } });
  }
  if (A.weather) for (const w of data.weather) for (const al of w.alerts || []) if (!muted.has(`city:${w.c.name}`)) cands.push({ id: `wx-${w.c.name}-${al.event}-${al.ends}`, title: `${al.event}`, body: `${w.c.name}${al.ends ? ` until ${when(al.ends)}` : ""}`, vis: { t: "wx", ev: al.event } });
  if (+A.eventMins && data.calendar) for (const e of data.calendar.events || []) {
    if (e.allDay || muted.has(`cal:${e.cal}`)) continue;
    const mins = (e.start - Date.now()) / 6e4;
    if (mins > 0 && mins <= +A.eventMins) cands.push({ id: `ev-${e.uid || e.id || e.title}-${+e.start}`, title: `${e.title || "Event"} in ${Math.max(1, Math.round(mins))} min`, body: [hm(e.start), placeOf(e), joinLink(e) ? "Tap to join" : ""].filter(Boolean).join(" · "), vis: { t: "cal", color: e.color, join: joinLink(e) } });
  }
  if (+A.movePct) for (const s of new Set(cfg.markets.groups.filter((g) => !muted.has(`board:${g.name}`)).flatMap((g) => g.symbols))) {
    const q = data.quotes[s];
    if (!q || q.error || q.pct == null || Math.abs(q.pct) < +A.movePct) continue;
    cands.push({ id: `move-${s}-${etDay}-${Math.floor(Math.abs(q.pct) / +A.movePct)}-${q.pct > 0 ? "u" : "d"}`, title: `${label(s)} ${q.pct > 0 ? "up" : "down"} ${fmtNum(Math.abs(q.pct), 1)}% today`, body: `${fmtNum(q.price, priceDigits(q.price))} · ${q.name}`, vis: { t: "mk", sym: s, up: q.pct > 0, icon: stockLogo(s) } });
  }
  for (const pt of A.prices || []) {
    const q = data.quotes[pt.symbol];
    if (!q || q.error) continue;
    if (pt.above && q.price >= +pt.above) cands.push({ id: `px-${pt.symbol}-a${pt.above}-${etDay}`, title: `${label(pt.symbol)} above ${pt.above}`, body: `Now ${fmtNum(q.price, priceDigits(q.price))}`, vis: { t: "mk", sym: pt.symbol, up: true, icon: stockLogo(pt.symbol) } });
    if (pt.below && q.price <= +pt.below) cands.push({ id: `px-${pt.symbol}-b${pt.below}-${etDay}`, title: `${label(pt.symbol)} below ${pt.below}`, body: `Now ${fmtNum(q.price, priceDigits(q.price))}`, vis: { t: "mk", sym: pt.symbol, up: false, icon: stockLogo(pt.symbol) } });
  }
  let seen;
  try { seen = JSON.parse(store.get(SEEN_KEY)); } catch {}
  seen = new Set(Array.isArray(seen) ? seen : []);
  const fresh = cands.filter((c) => !seen.has(c.id));
  fresh.forEach((c) => seen.add(c.id));
  store.set(SEEN_KEY, JSON.stringify([...seen].slice(-400)));
  if (alertsBootstrap) {
    const need = ["sports", "weather", "markets"].filter((x) => x === "markets" ? sectionOn("markets") : sectionOn(x));
    if (need.every((x) => alertsLoaded.has(x))) alertsBootstrap = false;
    return;
  }
  for (const c of fresh.slice(0, 4)) notify(c);
}
// ---------- logos and icons for alerts
const INDEX_ICON = { "^GSPC": "🇺🇸", "^DJI": "🇺🇸", "^IXIC": "🇺🇸", "^RUT": "🇺🇸", "^GSPTSE": "🇨🇦", "^VIX": "📈", "CAD=X": "💱", "EURUSD=X": "💱", "GC=F": "🥇", "CL=F": "🛢️", "BTC-USD": "₿", "ETH-USD": "Ξ" };
function stockLogo(sym) {
  if (!sym || /^\^|=|-USD$/.test(sym)) return "";
  return `https://financialmodelingprep.com/image-stock/${encodeURIComponent(sym.toUpperCase())}.png`;
}
function wxAlertIcon(ev = "") {
  const e = ev.toLowerCase();
  const f = /tornado|thunder|severe storm/.test(e) ? "thunderstorms-rain" : /blizzard|snow|winter|ice|freez|frost|sleet/.test(e) ? (/sleet|ice|freezing rain/.test(e) ? "sleet" : "snow")
    : /flood|rain|hurricane|tropical/.test(e) ? "rain" : /fog|smoke|air quality|dust/.test(e) ? "fog" : /heat/.test(e) ? "clear-day" : "";
  return f ? `<img class="nv-wx" src="/wx/${f}.svg" alt="">` : `<span class="nv-ic warn">${ic(/wind|gale/.test(e) ? "wind" : "triangle-alert")}</span>`;
}
const imgOr = (src, fallback, cls = "") => src
  ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy" data-fb="${esc(fallback || "")}" onerror="const s=document.createElement('span');s.className='nv-fb ${cls}';s.textContent=this.dataset.fb;this.replaceWith(s)">`
  : `<span class="nv-fb ${cls}">${esc(fallback || "")}</span>`;
function alertVis(v) {
  if (!v) return `<span class="nv nv-plain">${ic("bell")}</span>`;
  if (v.t === "game") return `<span class="nv nv-game ${v.live ? "live" : ""}">${LEAGUES[v.lg] ? leagueBadge(v.lg, "nv-lg") : ""}<span class="nv-teams">${imgOr(v.a?.logo, v.a?.abbr, "nv-team")}${imgOr(v.b?.logo, v.b?.abbr, "nv-team")}</span></span>`;
  if (v.t === "wx") return `<span class="nv nv-wxw">${wxAlertIcon(v.ev)}</span>`;
  if (v.t === "cal") return `<span class="nv nv-cal" style="--evc:${esc(v.color || "#ec4899")}">${ic(v.join ? "video" : "calendar-days")}</span>`;
  if (v.t === "mk") return `<span class="nv nv-mk">${v.icon ? imgOr(v.icon, label(v.sym).slice(0, 4), "nv-stock") : `<span class="nv-fb nv-stock">${esc(INDEX_ICON[v.sym] || label(v.sym).slice(0, 4))}</span>`}<span class="nv-dir ${v.up ? "up" : "down"}">${ic(v.up ? "trending-up" : "trending-down", "xs")}</span></span>`;
  return `<span class="nv nv-plain">${ic("bell")}</span>`;
}
// Game alerts look like the Sports cards: league + status, then each team with logo and score
function alertGameCard(a, unread) {
  const v = a.vis, live = v.state === "in" || v.live, fin = v.state === "post" || /^final/i.test(a.title.split("· ").pop() || "");
  const lgName = LEAGUES[v.lg]?.name || "";
  const status = live ? `<span class="pill live">LIVE</span> ${esc(v.detail || "")}` : fin ? `<span class="pill final">${esc(v.detail || "Final")}</span>` : `<span class="pill">${esc(v.detail || "")}</span>`;
  const lose = (t, o) => fin && (t.winner === false || (t.winner == null && o && +t.score < +o.score));
  const row = (t, o) => `<div class="g-team ${lose(t, o) ? "lose" : ""} ${t.mine ? "mine" : ""}">${imgOr(t.logo, t.abbr, "nv-row-logo")}<span class="nm">${esc(t.name || t.abbr || "")}${t.record ? `<small>${esc(t.record)}</small>` : ""}</span><span class="sc">${live || fin ? esc(t.score ?? "") : ""}</span></div>`;
  return `<button class="bell-game game ${live ? "is-live" : fin ? "is-final" : ""} ${unread ? "unread" : ""}" ${alertTarget(v)}>
    <div class="bg-h">${LEAGUES[v.lg] ? leagueBadge(v.lg, "bg-lg") : ""}<b>${esc(lgName)}</b><span class="g-status">${status}</span><small>${ago(a.t)}</small></div>
    ${row(v.a, v.b)}${row(v.b, v.a)}
    ${v.tv ? `<div class="g-meta"><span class="tv">${ic("tv")}${esc(v.tv)}</span></div>` : ""}</button>`;
}
function alertTarget(v) {
  if (!v) return "";
  if (v.t === "game" && v.path && v.id) return `data-game="${esc(v.id)}" data-path="${esc(v.path)}"`;
  if (v.t === "wx") return `data-goto="weather"`;
  if (v.t === "cal") return v.join ? `data-open-url="${esc(v.join)}"` : `data-goto="calendar"`;
  if (v.t === "mk") return `data-goto="markets"`;
  return "";
}
const UNREAD_KEY = pkey("dailyhq.alertUnread");
const unreadCount = () => Number(store.get(UNREAD_KEY)) || 0;
function setUnread(n) {
  store.set(UNREAD_KEY, String(n));
  const b = $("#bellBadge");
  if (b) { b.hidden = !n; b.textContent = n > 9 ? "9+" : String(n); }
  // number on the home-screen icon (installed app; needs notification permission on iPhone)
  try { if (n && navigator.setAppBadge) navigator.setAppBadge(n); else if (navigator.clearAppBadge) navigator.clearAppBadge(); } catch {}
}
// Older game alerts were saved without team details — rebuild them from the loaded scores (or the title)
function upgradeAlert(a) {
  const m = /^(start|final)-(.+)$/.exec(a.id || "");
  if (!m || (a.vis?.t === "game" && a.vis.a?.name)) return a;
  const eid = m[2];
  for (const { L, events } of data.sports || []) {
    const e = (events || []).find((x) => x.id === eid);
    if (!e) continue;
    const A = e.teams.find((t) => t.homeAway === "away"), B = e.teams.find((t) => t.homeAway === "home");
    if (!A || !B) break;
    const tm = (t) => ({ abbr: t.abbr, logo: t.logo, name: t.name, score: t.score, record: t.record, winner: e.state === "post" ? t.winner : undefined, mine: (L.teams || []).includes(t.abbr) });
    const fin = m[1] === "final";
    return { ...a, title: a.title.includes(" · ") ? a.title : `${LEAGUES[L.key]?.name || ""} · ${a.title}`, vis: { t: "game", lg: L.key, a: tm(A), b: tm(B), path: LEAGUES[L.key]?.path, id: e.id, state: fin ? "post" : e.state === "in" ? "in" : "post", detail: fin ? e.detail : e.state === "in" ? e.detail : "Final", tv: (e.broadcasts || []).slice(0, 2).join(", "), icon: tm(A).mine ? A.logo : B.logo } };
  }
  // not in the loaded scores any more: rebuild from the title, logos found by team name
  const t = a.title.replace(/^.*· /, "");
  const allTeams = (data.sports || []).flatMap(({ L, events }) => (events || []).flatMap((e) => e.teams.map((x) => ({ ...x, lg: L.key, mine: (L.teams || []).includes(x.abbr) }))));
  const find = (n) => allTeams.find((x) => x.name === n) || { name: n };
  let mm = /^Final: (.+?) (\d+), (.+?) (\d+)$/.exec(t);
  if (mm) {
    const A = find(mm[1]), B = find(mm[3]);
    return { ...a, vis: { t: "game", lg: A.lg || B.lg, a: { ...A, score: mm[2], winner: +mm[2] > +mm[4] }, b: { ...B, score: mm[4], winner: +mm[4] > +mm[2] }, state: "post", detail: a.body || "Final" } };
  }
  mm = /^Game on: (.+?) @ (.+)$/.exec(t);
  if (mm) {
    const A = find(mm[1]), B = find(mm[2]);
    return { ...a, vis: { t: "game", lg: A.lg || B.lg, a: A, b: B, state: "pre", detail: "Game started", tv: (a.body || "").replace(/^Watch on /, "") } };
  }
  return a;
}
function renderBellPop() {
  let log = [];
  try { log = JSON.parse(store.get(LOG_KEY)) || []; } catch {}
  const up = log.map(upgradeAlert);
  if (JSON.stringify(up) !== JSON.stringify(log)) { log = up; if (data.sports?.length) store.set(LOG_KEY, JSON.stringify(log)); }
  const unread = unreadCount();
  const perm = "Notification" in window ? Notification.permission : "unsupported";
  $("#bellPop").innerHTML = `<div class="bell-h"><b>Alerts</b><span class="pop-acts"><button class="mini-btn" data-config="alerts">Settings</button><button class="pop-x" data-pop-close aria-label="Close">${ic("x")}</button></span></div>
    ${perm !== "granted" && perm !== "unsupported" ? `<button class="btn primary wide" data-quick="notif">${ic("bell-ring")} Also show alerts on this device</button>` : ""}
    ${log.length ? log.slice(0, 15).map((a, i) => { if (a.vis?.t === "game" && a.vis.a?.name) return alertGameCard(a, i < unread); const tg = alertTarget(a.vis); return `<${tg ? "button" : "div"} class="bell-item ${i < unread ? "unread" : ""}" ${tg}>${alertVis(a.vis)}<div><b>${esc(a.title)}</b>${a.body ? `<span>${esc(a.body)}</span>` : ""}<small>${ago(a.t)}</small></div>${tg ? ic("chevron-right", "xs") : "<span></span>"}</${tg ? "button" : "div"}>`; }).join("")
      : `<div class="empty">No alerts yet. You'll see game starts, final scores, weather warnings and stock moves here.</div>`}`;
}
function toggleBell(force) {
  const pop = $("#bellPop");
  const open = force ?? pop.hidden;
  if (open) { renderBellPop(); $("#appsPop").hidden = true; }
  pop.hidden = !open;
  if (open) setUnread(0);
}
function inQuiet() {
  const q = cfg.alerts?.quiet;
  if (!q?.on) return false;
  const h = new Date().getHours();
  return q.from > q.to ? h >= q.from || h < q.to : h >= q.from && h < q.to;
}
function logAlertOnly(c) {
  setUnread(unreadCount() + 1);
  let log = [];
  try { log = JSON.parse(store.get(LOG_KEY)) || []; } catch {}
  log.unshift({ ...c, t: Date.now(), quiet: true });
  store.set(LOG_KEY, JSON.stringify(log.slice(0, 15)));
}
function notify(c) {
  if (inQuiet()) { logAlertOnly(c); return; }
  const t = $("#toast");
  t.innerHTML = c.vis?.t === "game" && c.vis.a?.name ? alertGameCard({ ...c, t: Date.now() }, false) : `${alertVis(c.vis)}<span class="toast-txt"><b>${esc(c.title)}</b>${c.body ? `<span>${esc(c.body)}</span>` : ""}</span>`;
  t.classList.add("alert-toast"); t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; t.classList.remove("alert-toast"); }, 5000);
  setUnread(unreadCount() + 1);
  let log = [];
  try { log = JSON.parse(store.get(LOG_KEY)) || []; } catch {}
  log.unshift({ ...c, t: Date.now() });
  store.set(LOG_KEY, JSON.stringify(log.slice(0, 15)));
  if ("Notification" in window && Notification.permission === "granted") {
    // icon = team / company logo where the device shows one (Android, Mac, Windows); iPhone always shows the app icon
    const opts = { body: c.body || "", icon: c.vis?.icon || "/icon-192.png", badge: "/icon-192.png", tag: c.id, data: { url: "/?alerts" } };
    navigator.serviceWorker?.ready?.then((r) => r.showNotification(c.title, opts)).catch(() => { try { new Notification(c.title, opts); } catch {} });
  }
}

// ============================================================ brief extras: on this day, holidays, things to do nearby
const homeCC = () => cfg.homeCC || (cfg.units === "C" ? "CA" : "US");
let extrasBusy = false;
async function loadExtras(force = false) {
  if (extrasBusy) return;
  const X = (data.extras ||= {}), now = Date.now(), today = new Date().toDateString();
  const need = [];
  if (cfg.extras.onThisDay && (force || X.otd?.day !== today)) need.push("otd");
  if (cfg.extras.holidays && (force || !X.hol || now - X.hol.t > 12 * 3600e3 || X.hol.cc !== homeCC())) need.push("hol");
  const c0 = cfg.weather.cities[0];
  if (cfg.extras.events && c0 && (force || !X.ev || now - X.ev.t > 3 * 3600e3 || X.ev.city !== c0.name)) need.push("ev");
  if (!need.length) return;
  extrasBusy = true;
  const d = new Date();
  await Promise.all(need.map(async (k) => {
    try {
      if (k === "otd") { const r = await api(`/api/extras?kind=onthisday&m=${d.getMonth() + 1}&d=${d.getDate()}`); X.otd = { day: today, items: r.items || [] }; }
      if (k === "hol") { const r = await api(`/api/extras?kind=holidays&cc=${homeCC()}`); X.hol = { t: now, cc: homeCC(), items: r.items || [] }; }
      if (k === "ev") { const r = await api(`/api/extras?kind=events&lat=${c0.lat}&lon=${c0.lon}&radius=${cfg.extras.radius || 25}`); X.ev = { t: now, city: c0.name, items: r.items || [], needsKey: !!r.needsKey }; }
    } catch { if (k === "otd") X.otd = { day: today, items: [] }; if (k === "hol") X.hol = { t: now, cc: homeCC(), items: [] }; if (k === "ev") X.ev = { t: now, city: c0?.name, items: [] }; }
  }));
  extrasBusy = false;
  renderBrief();
}
const dayDiff = (iso) => { const a = new Date(iso + "T12:00:00"), b = new Date(); b.setHours(12, 0, 0, 0); return Math.round((a - b) / 864e5); };
function extrasRows() {
  const X = data.extras || {}, rows = [];
  if (cfg.extras.holidays && X.hol?.items?.length) {
    const h = X.hol.items.find((x) => dayDiff(x.date) >= 0 && dayDiff(x.date) <= 30);
    if (h) { const n = dayDiff(h.date); rows.push(`<div class="br-row">${ic("flag")}<div><b>${esc(h.name)}</b> ${n === 0 ? "is today" : n === 1 ? "is tomorrow" : `in ${n} days`} <small class="muted">· ${esc(new Date(h.date + "T12:00:00").toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }))}</small></div></div>`); }
  }
  if (cfg.extras.events && X.ev?.items?.length) {
    const top = X.ev.items.slice(0, 3);
    rows.push(`<div class="br-row">${ic("calendar-plus")}<div><button class="br-link" data-events><b>Things to do near ${esc(X.ev.city.split(",")[0])}</b> · ${X.ev.items.length} this week ${ic("arrow-right", "xs")}</button><div class="br-sub">${top.map((e) => `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.name)}</a> <small class="muted">${esc(evWhen(e))}</small>`).join("<br>")}</div></div></div>`);
  }
  if (cfg.extras.onThisDay && X.otd?.items?.length) {
    const i = X.otd.items[new Date().getDate() % X.otd.items.length];
    rows.push(`<div class="br-row">${ic("clock")}<div><b>On this day in ${esc(i.year)}:</b> ${esc(i.text)}${i.link ? ` <a href="${esc(i.link)}" target="_blank" rel="noopener">More ${ic("external-link", "xs")}</a>` : ""}</div></div>`);
  }
  return rows;
}
const evWhen = (e) => { const n = dayDiff(e.date); const d = n === 0 ? "Today" : n === 1 ? "Tomorrow" : new Date(e.date + "T12:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }); return `${d}${e.time && !e.tba ? " · " + hm(new Date(`${e.date}T${e.time}`)) : ""}${e.venue ? " · " + e.venue : ""}`; };
function showEvents(filter = "All") {
  const X = data.extras?.ev; if (!X?.items?.length) return;
  const segs = ["All", ...new Set(X.items.map((e) => e.segment).filter((s) => s && s !== "Undefined"))];
  const list = X.items.filter((e) => filter === "All" || e.segment === filter);
  const byDay = {}; for (const e of list) (byDay[e.date] ||= []).push(e);
  openModal(`${ic("calendar-plus")} Things to do near ${esc(X.city.split(",")[0])}`, `
    <p class="hint">Concerts, games, shows and family events in the next 7 days within ${cfg.extras.radius || 25} miles. Change the distance in Customize → General.</p>
    <div class="chips">${segs.map((s) => `<span class="chip add ${s === filter ? "sel" : ""}" data-ev-seg="${esc(s)}">${esc(s === "Arts & Theatre" ? "Arts & theatre" : s)}</span>`).join("")}</div>
    ${Object.entries(byDay).map(([d, evs]) => `<h4 class="gd-h">${esc(dayDiff(d) === 0 ? "Today" : dayDiff(d) === 1 ? "Tomorrow" : new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }))}</h4>
      <div class="ev-list">${evs.map((e) => `<a class="ev" href="${esc(e.url)}" target="_blank" rel="noopener">${e.img ? `<img src="${esc(e.img)}" alt="" loading="lazy">` : `<span class="ev-noimg">${ic("calendar-plus")}</span>`}<span><b>${esc(e.name)}</b><small>${e.time && !e.tba ? esc(hm(new Date(`${e.date}T${e.time}`))) + " · " : ""}${esc(e.venue)}${e.city ? ", " + esc(e.city) : ""}${e.price != null ? ` · from $${Math.round(e.price)}` : ""}</small></span></a>`).join("")}</div>`).join("") || `<div class="empty">Nothing in that category this week.</div>`}
    <p class="hint" style="margin-top:12px">Event listings from Ticketmaster.</p>`);
  $("#modalBody").onclick = (ev) => { const s = ev.target.closest("[data-ev-seg]"); if (s) showEvents(s.dataset.evSeg); };
}

// ============================================================ commute (typical drive time; live traffic opens in your maps app)
const toMin = (hhmm) => { const [h, m] = String(hhmm || "09:00").split(":").map(Number); return h * 60 + (m || 0); };
function commuteLeg() {
  const C = cfg.commute;
  if (!C?.on || !C.home || !C.work) return null;
  const now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  if (!(C.days || []).includes(day)) return null;
  const arrive = toMin(C.arrive);
  if (mins >= 240 && mins <= arrive + 30) return { from: C.home, to: C.work, label: "To work", arrive };
  if (mins >= 14 * 60 && mins <= 20 * 60) return { from: C.work, to: C.home, label: "Home" };
  return null;
}
let commuteBusy = false;
async function loadCommute() {
  const C = cfg.commute;
  if (!C?.on || !C.home || !C.work || C.mode === "transit" || commuteBusy) return;
  const key = `${C.home.lat},${C.home.lon}|${C.work.lat},${C.work.lon}`;
  if (data.commute?.key === key && Date.now() - data.commute.t < 12 * 3600e3) return;
  commuteBusy = true;
  try { const r = await api(`/api/extras?kind=route&from=${C.home.lat},${C.home.lon}&to=${C.work.lat},${C.work.lon}`); data.commute = { key, t: Date.now(), minutes: r.minutes, km: r.km }; }
  catch { data.commute = { key, t: Date.now(), minutes: null }; }
  commuteBusy = false;
  renderBrief();
}
function commuteLinks(a, b, mode) {
  const g = `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lon}&destination=${b.lat},${b.lon}&travelmode=${mode === "transit" ? "transit" : "driving"}`;
  const ap = `https://maps.apple.com/?saddr=${a.lat},${a.lon}&daddr=${b.lat},${b.lon}&dirflg=${mode === "transit" ? "r" : "d"}`;
  const wz = `https://waze.com/ul?ll=${b.lat},${b.lon}&navigate=yes`;
  return `<span class="cm-links"><a href="${esc(g)}" target="_blank" rel="noopener">Google Maps</a> · <a href="${esc(ap)}" target="_blank" rel="noopener">Apple Maps</a>${mode === "transit" ? "" : ` · <a href="${esc(wz)}" target="_blank" rel="noopener">Waze</a>`}</span>`;
}
function commuteRow() {
  const leg = commuteLeg(); if (!leg) return "";
  const C = cfg.commute, mins = data.commute?.minutes;
  let main;
  if (C.mode === "transit") main = `<b>${leg.label}:</b> check your train or bus`;
  else if (mins == null) main = `<b>${leg.label}</b>`;
  else {
    main = `<b>${leg.label}: about ${mins} min</b> drive <small class="muted">(typical, without traffic)</small>`;
    if (leg.arrive != null) { const leave = leg.arrive - mins - 5; const d = new Date(); d.setHours(Math.floor(leave / 60), leave % 60, 0, 0); main += ` · leave by <b>${hm(d)}</b> to arrive ${hm(new Date(new Date().setHours(Math.floor(leg.arrive / 60), leg.arrive % 60, 0, 0)))}`; }
  }
  return `<div class="br-row">${ic("map-pin")}<div>${main}<div class="br-sub">Live traffic: ${commuteLinks(leg.from, leg.to, C.mode)}</div></div></div>`;
}
let cmResults = { home: [], work: [] };
async function commuteSearch(which) {
  const q = $(`#cm-q-${which}`)?.value.trim(); if (!q) return;
  try { cmResults[which] = (await api(`/api/extras?kind=geocode&q=${encodeURIComponent(q)}`)).items || []; if (!cmResults[which].length) toast("No matches — try adding the town and state"); }
  catch { toast("Address search isn't available right now"); }
  renderSettings();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cm]"); if (b) {
    const [act, which, k] = b.dataset.cm.split(":");
    if (act === "search") commuteSearch(which);
    if (act === "pick") { const r = cmResults[which][+k]; cfg.commute[which] = { label: r.label.split(",").slice(0, 3).join(","), lat: +r.lat.toFixed(5), lon: +r.lon.toFixed(5) }; cmResults[which] = []; data.commute = null; if (cfg.commute.home && cfg.commute.work) cfg.commute.on = true; save(); renderSettings(); renderBrief(); }
    if (act === "clear") { delete cfg.commute[which]; data.commute = null; save(); renderSettings(); renderBrief(); }
    if (act === "day") { const d = +which, days = new Set(cfg.commute.days || []); days.has(d) ? days.delete(d) : days.add(d); cfg.commute.days = [...days].sort(); save(); renderSettings(); renderBrief(); }
    if (act === "mode") { cfg.commute.mode = which; save(); renderSettings(); renderBrief(); }
    return;
  }
  if (e.target.closest("[data-events]")) showEvents();
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id?.startsWith("cm-q-")) { e.preventDefault(); commuteSearch(e.target.id.slice(5)); } });
function setCommuteHTML() {
  const C = cfg.commute;
  const place = (which, label) => `<div class="fld"><span>${label}</span>${C[which]
    ? `<div class="row"><span class="grow">${ic("map-pin")} ${esc(C[which].label)}</span><button class="btn sm" data-cm="clear:${which}">Change</button></div>`
    : `<div class="inline"><input id="cm-q-${which}" placeholder="Street address or place" autocomplete="street-address"><button class="btn" data-cm="search:${which}">Search</button></div>${cmResults[which].length ? `<div class="sugg">${cmResults[which].map((r, k) => `<button data-cm="pick:${which}:${k}">${esc(r.label.split(",").slice(0, 2).join(","))}<small>${esc(r.label.split(",").slice(2, 5).join(","))}</small></button>`).join("")}</div>` : ""}`}</div>`;
  return `<div class="set"><h4>${ic("map-pin")} Commute</h4><p class="hint">On the days you pick, your brief shows the drive to work in the morning and home in the afternoon, when to leave, and one-tap live traffic in Google Maps, Apple Maps or Waze. Drive times are typical times without traffic.</p>
    <div class="row"><span class="grow">Show my commute in the brief</span>${sw("cm-on", !!C.on)}</div>
    ${place("home", "Home")}${place("work", "Work")}
    <div class="row"><span class="grow">Arrive at work by</span><input type="time" data-act="cm-arrive" value="${esc(C.arrive || "09:00")}" style="width:auto"></div>
    <div class="row"><span class="grow">How I get there</span><span class="seg">${[["drive", "Drive"], ["transit", "Transit"]].map(([v, l]) => `<button data-cm="mode:${v}" class="${(C.mode || "drive") === v ? "on" : ""}">${l}</button>`).join("")}</span></div>
    <div class="chips">${["S", "M", "T", "W", "T", "F", "S"].map((l, d) => `<span class="chip add ${(C.days || []).includes(d) ? "sel" : ""}" data-cm="day:${d}">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}</span>`).join("")}</div></div>`;
}
function setExtrasHTML() {
  const X = cfg.extras;
  return `<div class="set"><h4>${ic("sparkles")} Brief extras</h4>
    <div class="row"><span class="grow">On this day in history</span>${sw("ex-otd", X.onThisDay !== false)}</div>
    <div class="row"><span class="grow">Upcoming public holidays</span>${sw("ex-hol", X.holidays !== false)}</div>
    <div class="row"><span class="grow">Things to do nearby <small class="muted">(near ${esc(cfg.weather.cities[0]?.name || "your first weather city")})</small></span>${sw("ex-ev", X.events !== false)}</div>
    <div class="row"><span class="grow">Distance for things to do</span><select data-act="ex-rad" style="width:auto">${[10, 25, 50, 75].map((n) => `<option value="${n}" ${+X.radius === n ? "selected" : ""}>${n} miles</option>`).join("")}</select></div></div>`;
}

// ============================================================ onboarding (first run / new person)
function showWelcome() {
  const leagues = ["nhl", "nfl", "nba", "mlb", "mls", "epl", "pga", "cricket"];
  openModal(`${ic("sparkles")} Welcome to Daily HQ`, `
    <p class="hint">Scores, news, weather, markets and your calendar on one screen. Set the basics now, then fine-tune any time from Customize.</p>
    <label class="fld">Your first name<input id="wName" value="${esc(cfg.name || "")}" placeholder="e.g. Alex" autocomplete="given-name"></label>
    <label class="fld">Your city<div class="inline" style="margin-top:4px"><input id="wCity" placeholder="Search a city…" enterkeyhint="search"><button class="btn" data-w="city">Search</button></div></label>
    <button class="btn wide" data-w="locate" style="margin-top:-4px">${ic("map-pin")} Use my location</button>
    <div id="wCities" class="chips">${cfg.weather.cities.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("")}</div>
    <div id="wCityRes"></div>
    <div class="fld">Show on your home page<div class="chips">${cfg.sections.map((s) => `<span class="chip add ${s.on ? "sel" : ""}" data-w="section" data-k="${s.id}">${ic(SECTION_META[s.id].icon, "xs")} ${esc(s.id === "brief" ? "Brief" : SECTION_META[s.id].title)}</span>`).join("")}</div><p class="hint" style="margin:6px 0 0">Tap to turn on or off. You can change this any time.</p></div>
    <div class="fld">News you're interested in<div class="chips">${INTERESTS.map(([id, label]) => `<span class="chip add ${(id === "realestate" ? cfg.markets.realestate : cfg.news.categories.find((c) => c.id === id)?.on) ? "sel" : ""}" data-w="interest" data-k="${id}">${label}</span>`).join("")}</div><p class="hint" style="margin:6px 0 0">Top news, sports and local news are always included.</p></div>
    <div class="fld">Leagues you follow<div class="chips">${leagues.map((k) => `<span class="chip add ${cfg.sports.leagues.some((l) => l.key === k) ? "sel" : ""}" data-w="league" data-k="${k}">${LEAGUES[k].icon} ${LEAGUES[k].name}</span>`).join("")}</div></div>
    <button class="btn primary wide" data-w="done">Start using Daily HQ</button>
    <details class="w-sync"><summary>Already set up on another device?</summary>
      <p class="hint">Enter the sync code from Customize → General on your other device.</p>
      <div class="inline"><input id="wCode" placeholder="XXXX-XXXX-XXXX"><button class="btn" data-w="code">Use code</button></div></details>`);
}
const INTERESTS = [["ai", "💻 Tech"], ["markets", "📈 Business"], ["politics", "🏛️ Politics"], ["entertainment", "🎬 Entertainment"], ["science", "🔬 Science"], ["health", "🩺 Health"], ["gaming", "🎮 Gaming"], ["travel", "✈️ Travel"], ["food", "🍳 Food"], ["parenting", "👪 Parenting"], ["realestate", "🏠 Real estate"]];
const gnewsCC = (q, cc) => (cc === "CA" ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-CA&gl=CA&ceid=CA:en` : gnews(q));
// Local news for a city the person chose: the city itself plus its state/province
function addLocalNews(city, region, cc) {
  const cat = cfg.news.categories.find((c) => c.id === "local");
  if (!cat || !city) return;
  const add = (name, q) => { const url = gnewsCC(q, cc); if (!cat.feeds.some((f) => f.url === url || f.name === name)) cat.feeds.push({ name, url, on: true }); };
  add(city, region ? `"${city}" ${region}` : `"${city}"`);
  if (region && region !== city) add(region, `${region} news`);
  cat.on = true;
}
// News for every team the person follows, kept in step as they follow and unfollow teams
let teamFeedT;
function queueTeamFeeds() { clearTimeout(teamFeedT); teamFeedT = setTimeout(() => syncTeamFeeds().catch(() => {}), 1500); }
async function syncTeamFeeds() {
  const cat = cfg.news.categories.find((c) => c.id === "sports");
  if (!cat) return;
  const want = [];
  for (const L of cfg.sports.leagues) {
    if (!L.teams?.length || !LEAGUES[L.key] || L.key === "cricket") continue;
    if (!teamCache[L.key]) { try { teamCache[L.key] = await fetchTeams(LEAGUES[L.key].path); } catch { continue; } }
    const byAbbr = Object.fromEntries((teamCache[L.key] || []).map((t) => [t.abbr, t]));
    for (const ab of L.teams) if (byAbbr[ab]?.name) want.push(byAbbr[ab].name);
  }
  const before = JSON.stringify(cat.feeds);
  cat.feeds = cat.feeds.filter((f) => !f.auto || want.includes(f.team));
  for (const name of want) {
    const short = name.split(" ").slice(-1)[0].toLowerCase();
    if (cat.feeds.some((f) => f.team === name || f.name.toLowerCase() === name.toLowerCase() || f.url.includes(encodeURIComponent(name)) || (!f.auto && f.name.toLowerCase() === short))) continue;
    cat.feeds.push({ name, url: gnews(`"${name}"`), on: true, auto: "team", team: name });
  }
  if (JSON.stringify(cat.feeds) !== before) { save(); if (sectionOn("news")) loadCategory(cat).then(() => renderNews()).catch(() => {}); }
}
function setHomeCountry(cc) {
  if (!cc) return;
  cfg.homeCC = cc;
  cfg.units = cc === "US" || cc === "LR" || cc === "MM" ? "F" : "C";
  if (cc === "US" || cc === "CA") cfg.realestate.country = cc;
}
const lastGeo = { region: "" };
async function welcomeAction(a) {
  const w = a.dataset.w;
  if (w === "interest") {
    const k = a.dataset.k, on = !a.classList.contains("sel");
    if (k === "realestate") cfg.markets.realestate = on;
    const c = cfg.news.categories.find((x) => x.id === k); if (c) c.on = on;
    a.classList.toggle("sel", on); save(); return;
  }
  if (w === "section") {
    const s = cfg.sections.find((x) => x.id === a.dataset.k); if (!s) return;
    if (s.on && cfg.sections.filter((x) => x.on).length === 1) return toast("Keep at least one section");
    s.on = !s.on; a.classList.toggle("sel", s.on); save(); return;
  }
  if (w === "locate") {
    if (!navigator.geolocation) return toast("Location isn't available here — search for your city instead");
    a.disabled = true; a.innerHTML = `${ic("map-pin")} Finding you…`;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      let name = "My location", cc = "";
      try {
        const g = await api(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        cc = g.countryCode || "";
        const region = cc === "US" || cc === "CA" ? abbrevRegion(g.principalSubdivision || "") : g.countryName;
        lastGeo.region = g.principalSubdivision || "";
        name = [g.city || g.locality, region].filter(Boolean).join(", ") || name;
      } catch {}
      if (!cfg.weather.cities.some((c) => c.name === name)) cfg.weather.cities.unshift({ name, lat: +lat.toFixed(4), lon: +lon.toFixed(4) });
      setHomeCountry(cc); addLocalNews((name.split(",")[0] || "").trim(), cc === "US" || cc === "CA" ? (await Promise.resolve(lastGeo.region)) : "", cc); save();
      $("#wCities").innerHTML = cfg.weather.cities.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("");
      a.innerHTML = `${ic("check")} ${esc(name)}`;
    }, () => { a.disabled = false; a.innerHTML = `${ic("map-pin")} Use my location`; toast("Couldn't get your location — search for your city instead"); }, { timeout: 12000, maximumAge: 600000 });
    return;
  }
  if (w === "league") {
    const k = a.dataset.k, i = cfg.sports.leagues.findIndex((l) => l.key === k);
    if (i >= 0) cfg.sports.leagues.splice(i, 1); else cfg.sports.leagues.push({ key: k, teams: [], showAll: true });
    a.classList.toggle("sel"); save();
  } else if (w === "city") {
    const q = $("#wCity").value.trim(); if (!q) return;
    try {
      const d = await api(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en`);
      $("#wCityRes").innerHTML = `<div class="sugg">${(d.results || []).map((r, k) => `<button data-w="pick" data-k="${k}">${esc(r.name)}<small>${esc([r.admin1, r.country].filter(Boolean).join(", "))}</small></button>`).join("") || "<p class='hint'>No matches</p>"}</div>`;
      welcomeAction.res = d.results || [];
    } catch { toast("City search failed"); }
  } else if (w === "pick") {
    const r = welcomeAction.res[+a.dataset.k];
    const region = r.country_code === "US" || r.country_code === "CA" ? abbrevRegion(r.admin1) : r.country;
    cfg.weather.cities.push({ name: [r.name, region].filter(Boolean).join(", "), lat: r.latitude, lon: r.longitude });
    if (cfg.weather.cities.length === 1) { setHomeCountry(r.country_code); addLocalNews(r.name, r.admin1 || "", r.country_code); }
    $("#wCities").innerHTML = cfg.weather.cities.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("");
    $("#wCityRes").innerHTML = ""; $("#wCity").value = ""; save();
  } else if (w === "code") {
    const code = cleanCode($("#wCode").value);
    try { await syncPull(code, true); closeModal(); afterConfigReplaced(); toast("Your settings are synced"); } catch (e) { toast(e.message); }
  } else if (w === "done") {
    cfg.name = $("#wName").value.trim();
    delete cfg.needsSetup; save(); renameProfileEntry();
    closeModal(); tickClock(); buildShell(); refresh();
    setTimeout(maybeInstallTip, 45000);
    if (cfg.sports.leagues.length) { openPicker = cfg.sports.leagues[0].key; openSettings("sports"); ensureTeams(openPicker).then(renderSettings); toast("Pick your teams — or skip to see every game"); }
  }
}

// ============================================================ beta: feedback + install tip
const BETA = window.DHQ_BETA || null;
function openFeedback(kind = "") {
  if (!BETA) return toast("Feedback isn't available here");
  const kinds = [["idea", "💡 Idea"], ["problem", "🐞 Something's wrong"], ["confusing", "🤔 Confusing"], ["like", "👍 I like this"]];
  openModal(`${ic("send")} Send feedback to Dean`, `
    <p class="hint">What's working, what's broken, what's confusing — anything helps. It goes straight to Dean with the app version (${esc(BETA.version)}).</p>
    <div class="chips" id="fbKinds">${kinds.map(([k, l]) => `<span class="chip add ${k === kind ? "sel" : ""}" data-k="${k}">${l}</span>`).join("")}</div>
    <label class="fld">Your note<textarea id="fbText" rows="6" placeholder="e.g. The weather for my city was wrong this morning…" style="width:100%"></textarea></label>
    <button class="btn primary wide" id="fbSend">${ic("send")} Send</button>`);
  let k = kind;
  $("#fbKinds").onclick = (e) => { const c = e.target.closest("[data-k]"); if (!c) return; k = c.dataset.k; [...$("#fbKinds").children].forEach((x) => x.classList.toggle("sel", x === c)); };
  $("#fbSend").onclick = async () => {
    const text = $("#fbText").value.trim(); if (!text) return toast("Write a short note first");
    $("#fbSend").disabled = true;
    try { const r = await BETA.feedback(text, k, (location.hash || "home").slice(0, 40)); if (!r.ok) throw new Error(); closeModal(); toast("Thanks — Dean will see this"); }
    catch { $("#fbSend").disabled = false; toast("Couldn't send — check your connection"); }
  };
}
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
let installEvt = null;
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; });
function maybeInstallTip(force = false) {
  const shown = +(store.get("dailyhq.installTip") || 0);
  const phone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || matchMedia("(max-width: 820px)").matches;
  if (!force && (isStandalone() || !phone || shown >= 2 || !$("#modal").hidden || cfg.needsSetup)) return;
  store.set("dailyhq.installTip", String(shown + 1));
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent), chromeIOS = ios && /CriOS/i.test(navigator.userAgent);
  const steps = ios
    ? `<ol class="install-steps"><li>Tap the <b>Share</b> button ${chromeIOS ? "(top right, next to the address bar)" : "(the square with an arrow, at the bottom)"}.</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. Daily HQ now opens full-screen from its own icon.</li></ol>`
    : installEvt ? `<p class="hint">Your browser can install Daily HQ as an app.</p><button class="btn primary wide" id="installNow">${ic("smartphone")} Install Daily HQ</button>`
    : `<ol class="install-steps"><li>Open your browser's <b>⋮</b> menu.</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>`;
  openModal(`${ic("smartphone")} Put Daily HQ on your home screen`, `<p class="hint">It opens like a regular app — full screen, one tap, no browser bars.</p>${steps}<button class="btn wide" data-close-install style="margin-top:10px">Maybe later</button>`);
  $("[data-close-install]").onclick = closeModal;
  const b = $("#installNow"); if (b) b.onclick = async () => { closeModal(); installEvt.prompt(); installEvt = null; };
}
setTimeout(() => { if (!cfg.needsSetup) syncTeamFeeds().catch(() => {}); }, 8000);
if (BETA && $("#betaPill")) { $("#betaPill").hidden = false; $("#betaPill").onclick = () => openFeedback(); }
if (BETA) setTimeout(() => { if (!cfg.needsSetup && !store.get("dailyhq.installTip")) maybeInstallTip(); }, 20000);

// ============================================================ real estate (agent briefing + markets)
// Official monthly snapshot — update after each release (CREA mid-month, NAR around the 2nd week).
const RE_SNAPSHOT = {
  CA: {
    period: "September 2026", currency: "CAD", released: "2026-10-16", next: "2026-11-17",
    source: ["CREA", "https://creastats.crea.ca/en-CA/"],
    tiles: [
      ["Average sold price", "$666,538", "−1.6% year over year"],
      ["Sales activity", "−2.3%", "month over month · seasonally adjusted"],
      ["HPI benchmark price", "−3.4%", "year over year (−0.4% vs August)"],
      ["Months of inventory", "4.9", "national resale market · long-term average"],
      ["Sales / new listings", "48.8%", "national ratio · 45–65% = balanced"],
      ["Active listings", "200,000+", "+1.8% year over year"],
    ],
    snlr: 48.8, moi: 4.9, priceYoY: -1.6, salesChg: -2.3,
  },
  US: {
    period: "September 2026", currency: "USD", released: "2026-10-13", next: "2026-11-12",
    source: ["NAR", "https://www.nar.realtor/newsroom/existing-home-sales-increased-1-5-in-september-according-to-nar-report"],
    tiles: [
      ["Median sold price", "$417,500", "+1.3% year over year"],
      ["Existing-home sales", "3.99M", "annual rate · +1.5% m/m, −2.2% y/y"],
      ["Months' supply", "4.8", "4.5–6 months = balanced"],
      ["Homes for sale", "1.60M", "+4.6% year over year"],
      ["Single-family median", "$422,700", "+1.2% year over year"],
      ["Condo / co-op median", "$363,700", "+1.2% year over year"],
    ],
    moi: 4.8, priceYoY: 1.3, salesChg: -2.2,
  },
};
// Local association figures (agents need local, not just national). Update monthly.
const RE_LOCAL = {
  GTA: {
    name: "Greater Toronto Area", assoc: "TRREB", period: "September 2026", released: "2026-10-06",
    source: "https://trreb.ca/hlfiles/pdf/mw_september_2026_564895214753249.pdf",
    tiles: [
      ["Average sold price", "$1,006,409", "−5.1% year over year"],
      ["Median price", "$860,000", "all home types"],
      ["Sales", "5,040", "−9.0% year over year"],
      ["New listings", "16,500", "−14.4% year over year"],
      ["Active listings", "26,131", "−9.3% year over year"],
      ["Days on market", "34", "average listing DOM · 51 property DOM"],
      ["HPI composite benchmark", "$917,600", "−4.65% · detached $1,196,400"],
    ],
    summary: "GTA sales are down 9% and new listings down 14% from a year ago, so supply is tightening while prices sit about 5% lower. Buyers can still negotiate; well-priced listings are selling in about a month.",
    buyer: ["Prices are about 5% below last year — use recent comparables to anchor offers.", "Fewer new listings means good homes get attention; be pre-approved before showings.", "Condos remain the softest segment for negotiating."],
    seller: ["Price to today's comparables; last year's prices are not the benchmark.", "With new listings down 14%, a well-presented home stands out.", "Plan for about 30–50 days on market and build that into timing."],
  },
  Mississauga: {
    name: "Mississauga", assoc: "TRREB", period: "September 2026", released: "2026-10-07",
    source: "https://www.insauga.com/five-most-expensive-homes-sold-for-under-asking-in-mississauga-2/", board: "https://trreb.ca/",
    tiles: [
      ["Average sold price", "$929,600", "−4.1% y/y · +3.5% vs August"],
      ["Detached", "$1,285,467", "−6.9% year over year"],
      ["Semi-detached", "$870,161", "average price"],
      ["Townhouse", "$980,037", "average price"],
      ["Condo apartment", "$500,192", "−11.2% year over year"],
    ],
    summary: "Mississauga prices are below last year across home types, with condo apartments (−11%) softer than detached homes (−7%). Prices ticked up from August, so the slide may be levelling off.",
    buyer: ["Condo buyers have the most leverage — about 11% below last year.", "Detached prices are about 7% lower; target homes that have sat beyond 30 days.", "Lock in a rate hold now; the monthly bump suggests prices may be stabilizing."],
    seller: ["Condo sellers must price sharply against new competing listings.", "Detached and semi homes still draw interest when priced near recent sales.", "Top-end homes are selling under asking — set expectations with clients early."],
    parent: "GTA",
  },
  "Monmouth County": {
    name: "Monmouth County, NJ", assoc: "New Jersey REALTORS® · MLS", period: "August 2026", released: "2026-09-17",
    source: "https://www.newjerseyrealestatenetwork.com/blog/monmouth-county-real-estate-market-update/", board: "https://www.njrealtor.com/",
    tiles: [
      ["Single-family median", "$815,000", "+3.7% year over year"],
      ["Closed sales", "536", "+6.8% year over year"],
      ["Days on market", "28", "unchanged year over year"],
      ["New listings", "633", "−6.9% year over year"],
      ["Year-to-date median", "$806,000", "+5.9% · 102.0% of list price"],
      ["Townhouse-condo median", "$547,250", "+0.4% year over year"],
    ],
    summary: "Monmouth County is still a seller's market: single-family prices are up about 4%, homes sell in about 4 weeks, and buyers are paying about 102% of list price on average this year.",
    buyer: ["Expect competition on well-priced single-family homes; come in strong and pre-approved.", "Townhouse-condo prices are flat — a value angle for first-time buyers.", "Use escalation clauses carefully and set a firm ceiling."],
    seller: ["Prices are still rising; price at market, not above it, to draw multiple offers.", "Homes sell in about 28 days — prep and staging should be done before listing.", "New listings are down 7%, so supply works in sellers' favour."],
  },
  Brampton: {
    name: "Brampton", assoc: "TRREB", period: "September 2026", released: "2026-10-06",
    source: "https://www.insauga.com/home-prices-drop-4-as-sales-stall-in-brampton-report/", board: "https://trreb.ca/",
    tiles: [
      ["Average price", "≈ −4%", "vs August · all home types"],
      ["Detached", "$1,001,613", "234 sales · −1.9% vs August"],
      ["Semi-detached", "$778,223", "+0.5% vs August · sales −25%"],
      ["HPI benchmark (Mar)", "$855,000", "−11.3% year over year"],
    ],
    summary: "Brampton eased into the fall: average prices slipped about 4% from August and semi-detached sales fell by a quarter. Detached homes are hovering right around $1M, well under the GTA average.",
    buyer: ["Detached homes near $1M give move-up buyers a cheaper route than Mississauga or Toronto.", "Semi sales dropped 25% month over month — room to negotiate on listings that have sat.", "Watch the condo segment, which has seen the steepest declines this year."],
    seller: ["Price detached homes under the $1M mark when comparables allow; it widens the buyer pool.", "Slower semi sales mean presentation and pricing decide days on market.", "Use the GTA-wide drop in new listings (−14%) as a selling point for well-priced homes."],
    parent: "GTA",
  },
  "Oakville-Milton": {
    name: "Oakville & Milton", assoc: "Oakville, Milton and District Real Estate Board", period: "August 2026", released: "2026-09",
    source: "https://stats.crea.ca/board/oakv/", board: "https://www.omdreb.ca/",
    tiles: [
      ["Average price", "$1,152,029", "−4.7% year over year"],
      ["HPI benchmark", "$1,044,000", "−5.7% year over year"],
      ["Sales", "382", "−9% year over year"],
      ["New listings", "833", "−30.2% year over year"],
      ["Active listings", "1,766", "−20.5% · 4.6 months of inventory"],
      ["Oakville condo apt (Sep)", "$552,100", "TRREB HPI · −6.2% y/y"],
    ],
    summary: "Oakville-Milton supply is shrinking fast — new listings are down 30% and inventory 20% — while prices sit about 5% below last year. With 4.6 months of inventory, the market is moving toward balanced.",
    buyer: ["Prices are about 5% below last year, but fewer listings means less choice — act on the right home.", "Milton offers detached product well below Oakville prices for commuting families.", "Condo apartments are the softest segment for negotiating."],
    seller: ["With new listings down 30%, a well-prepared listing faces less competition than a year ago.", "Price to the benchmark (~$1.04M), not to 2025 sales.", "Inventory is 4.6 months — plan for a measured, not instant, sale."],
    parent: "GTA",
  },
  Hamilton: {
    name: "Hamilton", assoc: "Cornerstone Association of REALTORS®", period: "September 2026", released: "2026-10",
    source: "https://creastats.crea.ca/board/hami", board: "https://www.cornerstone.inc/",
    tiles: [
      ["HPI benchmark", "$718,600", "−5.1% y/y · −1.3% vs August"],
      ["Sales", "376", "−22.8% year over year"],
      ["New listings", "1,061", "−24.9% year over year"],
      ["Sales-to-new-listings", "35.4%", "buyer's market"],
    ],
    summary: "Hamilton remains a buyer's market: sales are down 23% from a year ago and the benchmark price is about 5% lower, with apartment-style homes seeing the largest adjustment.",
    buyer: ["A 35% sales-to-new-listings ratio gives buyers real leverage — conditions and price reductions are on the table.", "Apartment-style homes have seen the biggest price drops this year.", "Value for GTA commuters: the benchmark is roughly $200K below the GTA composite."],
    seller: ["Price at or slightly below the benchmark to stand out in a buyer's market.", "Expect conditional offers and longer days on market; set timelines with clients.", "New listings are down 25%, so a sharp listing still gets seen."],
  },
  Ottawa: {
    name: "Ottawa", assoc: "Ottawa Real Estate Board", period: "September 2026", released: "2026-10",
    source: "https://www.ctvnews.ca/ottawa/article/ottawa-home-sales-down-7-so-far-this-year/", board: "https://www.oreb.ca/",
    tiles: [
      ["Sales (Sep)", "1,010", "up from 1,002 in August"],
      ["Sales year to date", "−7%", "vs 2025"],
      ["Composite price (Aug)", "$637,700", "+1.0% year over year"],
      ["Single-family (Aug)", "$726,700", "+2.2% year over year"],
      ["Condo (Aug)", "$392,900", "−3.6% year over year"],
      ["Sales-to-new-listings (Aug)", "47.3%", "balanced market"],
    ],
    summary: "Ottawa is balanced and steady: prices are roughly flat to slightly up, while sales are running about 7% behind last year. Single-family homes are holding value better than condos.",
    buyer: ["Balanced conditions mean conditional offers (financing, inspection) are usually accepted.", "Condos are slightly cheaper than last year — the best value segment.", "Federal-workforce news moves this market; watch it when timing a purchase."],
    seller: ["Single-family prices are still up about 2% — price to recent comparables.", "Sales are slower than last year, so expect more showings before an offer.", "Condo sellers should price sharply against competing units."],
  },
  "Kitchener-Waterloo": {
    name: "Kitchener-Waterloo & Cambridge", assoc: "Cornerstone Association of REALTORS®", period: "September 2026", released: "2026-10",
    source: "https://stats.crea.ca/board/wrar", board: "https://www.cornerstone.inc/",
    tiles: [
      ["K-W HPI benchmark", "$630,200", "−5.6% y/y · +0.3% vs August"],
      ["Cambridge HPI", "$662,700", "−4.1% y/y · −0.6% vs August"],
      ["Sales", "−18.9%", "year over year · −14.2% vs August"],
      ["New listings", "−16.7%", "year over year · +38.4% vs August"],
      ["Months of supply", "3.8", "−5.0% year over year"],
    ],
    summary: "Waterloo Region sales dropped about 19% from a year ago while new listings jumped back after summer. Benchmark prices are 4–6% below last year but have stopped falling month to month in Kitchener-Waterloo.",
    buyer: ["Prices are 4–6% below last year and supply rose in September — more choice this fall.", "K-W benchmark ticked up from August; the bottom may be near.", "Cambridge is slightly pricier than K-W on the benchmark but still down 4% y/y."],
    seller: ["The September jump in new listings means more competition; price to the benchmark.", "3.8 months of supply is balanced — expect normal conditions in offers.", "Lead with the home's value versus GTA prices for relocating buyers."],
  },
};
const RE_ALIAS = {
  Toronto: "GTA", "Greater Toronto Area": "GTA", Oakville: "Oakville-Milton", Milton: "Oakville-Milton",
  Kitchener: "Kitchener-Waterloo", Waterloo: "Kitchener-Waterloo", Cambridge: "Kitchener-Waterloo", "Waterloo Region": "Kitchener-Waterloo",
  Manalapan: "Monmouth County",
};
const RE_BOARDS = {
  GTA: ["TRREB", "https://trreb.ca/"], Toronto: ["TRREB", "https://trreb.ca/"], Brampton: ["TRREB", "https://trreb.ca/"], Mississauga: ["TRREB", "https://trreb.ca/"],
  Ontario: ["CREA board statistics", "https://creastats.crea.ca/en-CA/"], Ottawa: ["Ottawa Real Estate Board", "https://www.oreb.ca/"],
  Oakville: ["OMDREB", "https://www.omdreb.ca/"], Milton: ["OMDREB", "https://www.omdreb.ca/"], "Oakville-Milton": ["OMDREB", "https://www.omdreb.ca/"],
  Hamilton: ["Cornerstone Association of REALTORS®", "https://www.cornerstone.inc/"], Burlington: ["Cornerstone Association of REALTORS®", "https://www.cornerstone.inc/"],
  "Kitchener-Waterloo": ["Cornerstone Association of REALTORS®", "https://www.cornerstone.inc/"], Kitchener: ["Cornerstone Association of REALTORS®", "https://www.cornerstone.inc/"], Waterloo: ["Cornerstone Association of REALTORS®", "https://www.cornerstone.inc/"], Cambridge: ["Cornerstone Association of REALTORS®", "https://www.cornerstone.inc/"],
  London: ["London St. Thomas Association of REALTORS", "https://www.lstar.ca/"],
  Vancouver: ["Greater Vancouver Realtors", "https://www.gvrealtors.ca/"], Calgary: ["CREB", "https://www.creb.com/"],
  "New Jersey": ["New Jersey REALTORS®", "https://www.njrealtor.com/"], "Monmouth County": ["New Jersey REALTORS®", "https://www.njrealtor.com/"], Manalapan: ["New Jersey REALTORS®", "https://www.njrealtor.com/"],
  "Middlesex County": ["New Jersey REALTORS®", "https://www.njrealtor.com/"], Hoboken: ["New Jersey REALTORS®", "https://www.njrealtor.com/"], "Jersey City": ["New Jersey REALTORS®", "https://www.njrealtor.com/"], Princeton: ["New Jersey REALTORS®", "https://www.njrealtor.com/"],
  "New York City": ["REBNY", "https://www.rebny.com/"], Florida: ["Florida Realtors", "https://www.floridarealtors.org/"], Miami: ["MIAMI REALTORS", "https://www.miamirealtors.com/"],
  Texas: ["Texas REALTORS", "https://www.texasrealtors.com/"], California: ["California Association of REALTORS", "https://www.car.org/"],
};
const reLocal = (area) => RE_LOCAL[area] || RE_LOCAL[RE_ALIAS[area]] || null;
const RE_MARKETS = {
  CA: {
    label: "Canada", flag: "🇨🇦",
    news: [["Canadian Mortgage Trends", "https://www.canadianmortgagetrends.com/feed/"], ["Canada housing", gnews("Canada housing market")], ["CREA & CMHC", gnews("CREA OR CMHC housing")]],
    suggest: { Ontario: ["GTA", "Toronto", "Mississauga", "Brampton", "Oakville", "Milton", "Hamilton", "Burlington", "Ottawa", "Kitchener-Waterloo", "Cambridge", "London"], "British Columbia": ["Vancouver", "Victoria"], Alberta: ["Calgary", "Edmonton"], Quebec: ["Montreal"], "Nova Scotia": ["Halifax"] },
    board: { Toronto: "https://trreb.ca/market-data/", Mississauga: "https://trreb.ca/market-data/", Brampton: "https://trreb.ca/market-data/", Ontario: "https://trreb.ca/market-data/" },
  },
  US: {
    label: "U.S.", flag: "🇺🇸",
    news: [["HousingWire", "https://www.housingwire.com/feed/"], ["US housing", gnews("US housing market")], ["Mortgage rates", gnews("mortgage rates Freddie Mac")]],
    suggest: { "New Jersey": ["Monmouth County", "Manalapan", "Middlesex County", "Hoboken", "Jersey City", "Princeton"], "New York": ["New York City", "Long Island", "Westchester"], Florida: ["Miami", "Tampa", "Orlando", "Naples"], "North Carolina": ["Charlotte", "Raleigh"], Texas: ["Austin", "Dallas"], California: ["Los Angeles", "San Francisco"] },
    board: {},
  },
};
const HOUSING_WORDS = /hous|home|mortgage|real estate|realtor|condo|rent|listing|propert|apartment|cmhc|crea|trreb|nar\b|zoning|develop|builder|construction|afford|price/i;
const reDefaults = () => {
  const r = (cfg.realestate ||= {});
  r.country ||= "CA";
  r.areas ||= { CA: ["Ontario", "GTA", "Mississauga", "Brampton", "Oakville", "Hamilton", "Ottawa", "Kitchener-Waterloo"], US: ["New Jersey", "Monmouth County"] };
  r.area ||= { CA: "", US: "" };
  return r;
};
let reView = null; // what's on screen; starts at the saved default
const reCur = () => (reView ||= { country: reDefaults().country, area: { ...reDefaults().area } });
let rePicker = false;
data.reSub = {};
const reOpen = new Set(["notes"]);

async function fetchFeedItems(feeds, onlyHousing = true) {
  const res = await Promise.all(feeds.map(async ([name, url]) => {
    try { return parseFeed(await api(`/api/feed?url=${encodeURIComponent(url)}`, true), { name }); } catch { return []; }
  }));
  const seen = new Set();
  return res.flat().filter((i) => i.title && i.link)
    .filter((i) => !onlyHousing || HOUSING_WORDS.test(i.title + " " + (i.desc || "")))
    .filter((i) => { const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60); return !seen.has(k) && seen.add(k); })
    .filter((i) => !i.ts || i.ts > Date.now() - 10 * 86400e3)
    .sort((a, b) => b.ts - a.ts);
}
async function loadRE() {
  const v = reCur();
  const items = await fetchFeedItems(RE_MARKETS[v.country].news);
  const prev = data.news.realestate;
  data.news.realestate = items.length || !prev || prev.country !== v.country ? { items, errors: [], empty: false, country: v.country } : { ...prev, stale: true };
  loadRESub();
}
async function loadRESub() {
  const v = reCur(), area = v.area[v.country];
  if (!area) return;
  const key = `${v.country}|${area}`;
  if (data.reSub[key]?.t > Date.now() - 10 * 60e3) return;
  data.reSub[key] = { loading: true, items: data.reSub[key]?.items || [] };
  if (activeNews === "realestate") renderNews();
  const items = await fetchFeedItems([[`${area} real estate`, gnews(`${area} real estate`)], [`${area} housing`, gnews(`${area} housing market`)]]);
  data.reSub[key] = { items, t: Date.now() };
  if (activeNews === "realestate") renderNews();
}
const RATE_ROWS = { CA: ["ca_overnight", "ca_prime", "ca_5y_posted", "ca_5y_bond"], US: ["us_30y", "us_15y", "us_fedfunds"] };
function rateChip(k) {
  const r = data.rates?.series?.[k];
  if (!r) return "";
  const bp = r.prev != null ? Math.round((r.value - r.prev) * 100) : 0;
  return `<span class="rate-chip" title="${esc(r.source)} · as of ${esc(r.date)}"><small>${esc(r.label)}</small><b>${r.value.toFixed(2)}%</b>${bp ? `<i class="${bp > 0 ? "down" : "up"}">${bp > 0 ? "▲" : "▼"}${Math.abs(bp)}bp</i>` : ""}<em>${esc(r.date)}</em></span>`;
}
// ---------- article pictures: from the feed, else the article's own share image, else the publisher's logo
const OG_KEY = "dailyhq.ogImages";
let ogCache = {};
try { ogCache = JSON.parse(localStorage.getItem(OG_KEY)) || {}; } catch {}
const imgFor = (i) => i.img || ogCache[i.link] || "";
function thumbHTML(i) {
  const img = imgFor(i);
  if (img) return `<img class="thumb" src="${esc(img)}" alt="" loading="lazy" onerror="this.outerHTML=this.dataset.ph" data-ph="${esc(phHTML(i, true))}">`;
  return phHTML(i, ogCache[i.link] === "");
}
function phHTML(i, done) {
  const fav = i.site ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(i.site)}&sz=64` : "";
  return `<span class="thumb ph" ${done ? "" : `data-og="${esc(i.link)}"`} title="${esc(i.source)}">${fav ? `<img src="${esc(fav)}" alt="" loading="lazy" onerror="this.remove()">` : ""}<small>${esc((i.source || "").slice(0, 14))}</small></span>`;
}
let ogBusy = false;
async function fillArticleImages() {
  if (ogBusy) return;
  ogBusy = true;
  try {
    const els = [...document.querySelectorAll("[data-og]")].slice(0, 36);
    const todo = [...new Set(els.map((e) => e.dataset.og))].filter((l) => !(l in ogCache));
    let changed = false;
    const run = async (link) => {
      try {
        const r = await fetch(`/api/ogimage?url=${encodeURIComponent(link)}`);
        const j = await r.json();
        if (!j.img && j.reason === "google") { for (const el of document.querySelectorAll(`[data-og="${CSS.escape(link)}"]`)) el.removeAttribute("data-og"); return; } // try again next visit
        ogCache[link] = j.img && /^https:/.test(j.img) ? j.img.replace(/&#0*38;/g, "&") : "";
      } catch { return; }
      changed = true;
      for (const el of document.querySelectorAll(`[data-og="${CSS.escape(link)}"]`)) {
        if (ogCache[link]) { const im = new Image(); im.className = "thumb"; im.alt = ""; im.onload = () => el.replaceWith(im); im.src = ogCache[link]; }
        else el.removeAttribute("data-og");
      }
    };
    for (let k = 0; k < todo.length; k += 4) await Promise.all(todo.slice(k, k + 4).map(run));
    if (changed) {
      const keys = Object.keys(ogCache);
      if (keys.length > 600) for (const k of keys.slice(0, keys.length - 600)) delete ogCache[k];
      try { localStorage.setItem(OG_KEY, JSON.stringify(ogCache)); } catch {}
    }
  } finally { ogBusy = false; }
}
function newsItemHTML(i, saveBtn, tag = "") {
  return `<div class="item"><div><a class="t" href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a>
    <div class="meta">${i.ts > prevVisit ? `<span class="new"></span>` : ""}${esc(i.source)}${i.ts ? ` · ${ago(i.ts)}` : ""}${tag ? ` · <span class="re-tag">${esc(tag)}</span>` : ""}${saveBtn(i)}</div></div>
    ${thumbHTML(i)}</div>`;
}
function reRead(c) {
  const s = RE_SNAPSHOT[c];
  const bal = c === "CA" ? (s.snlr < 45 ? "buyer-leaning" : s.snlr > 65 ? "seller-leaning" : "broadly balanced") : (s.moi < 4.5 ? "seller-leaning" : s.moi > 6 ? "buyer-leaning" : "broadly balanced");
  const price = s.priceYoY < -0.5 ? "softer prices" : s.priceYoY > 0.5 ? "prices still edging up" : "flat prices";
  const sales = s.salesChg < 0 ? "slower sales" : "firmer sales";
  const summary = `National conditions are ${bal}, with ${sales} and ${price}. Use local comparables before setting a pricing or offer strategy.`;
  const buyer = c === "CA"
    ? [`Benchmark prices are ${Math.abs(-3.4)}% lower than a year ago, so there is room to negotiate on homes that have sat.`, "Get pre-approved at the stress-test rate (contract rate + 2% or 5.25%, whichever is higher).", "In a balanced market, financing and inspection conditions are more likely to be accepted."]
    : [`Months' supply of ${s.moi} is the highest in years, so buyers have more choice and negotiating room.`, "Lock in a rate quote and compare at least three lenders; small rate gaps add up.", "Ask about seller credits toward closing costs or a rate buydown."];
  const seller = c === "CA"
    ? ["Price to today's local benchmark, not last year's peak.", `With about ${s.moi} months of inventory, presentation and pricing decide days on market.`, "Expect buyers to include conditions; plan the timeline around them."]
    : ["Prices are still up slightly year over year, but well-priced homes sell first.", "Homes now take about a month to sell nationally; plan for showings and price checks.", "Consider offering credits instead of cutting the list price."];
  return { summary, buyer, seller };
}
function det(key, title, body) {
  return `<details class="re-det" data-re-det="${key}" ${reOpen.has(key) ? "open" : ""}><summary>${title}</summary><div class="re-det-b">${body}</div></details>`;
}
function qualGuide(c) {
  return c === "CA"
    ? `<ul>
        <li><b>Minimum down:</b> 5% of the first $500,000, 10% of the portion from $500,000 to $1.5M; 20% at $1.5M and above.</li>
        <li><b>Under 20% down:</b> mortgage default insurance (CMHC or private): 4.00% of the loan at 5–9.99% down, 3.10% at 10–14.99%, 2.80% at 15–19.99%.</li>
        <li><b>Stress test:</b> qualify at the higher of 5.25% or your contract rate + 2% (<a href="https://www.osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages" target="_blank" rel="noopener">OSFI</a>).</li>
        <li><b>Debt ratios:</b> housing costs (GDS) up to about 39% of gross income; all debts (TDS) up to about 44%.</li>
        <li><b>Amortization:</b> up to 25 years with insurance; 30 years for first-time buyers and new builds.</li>
      </ul>`
    : `<ul>
        <li><b>Minimum down:</b> conventional loans from 3% (first-time buyers) or 5%; FHA 3.5%; VA and USDA can be 0% for eligible buyers.</li>
        <li><b>Under 20% down:</b> conventional loans usually add private mortgage insurance (PMI) until you reach 20% equity.</li>
        <li><b>Debt-to-income:</b> lenders often look for total debts around 43% of gross income or less; some programs allow up to 50%.</li>
        <li><b>Rate shopping:</b> compare the APR, points and lender credits, not just the headline rate.</li>
      </ul>`;
}
function renderREHTML(saveBtn) {
  const v = reCur(), c = v.country, M = RE_MARKETS[c], area = v.area[c] || "", def = reDefaults();
  const isDef = def.country === c && (def.area[c] || "") === area;
  const snap = RE_SNAPSHOT[c];
  const local = area ? reLocal(area) : null;
  const read = local ? { summary: local.summary, buyer: local.buyer, seller: local.seller } : reRead(c);
  const tiles = (arr) => `<div class="re-tiles">${arr.map(([l, val, s]) => `<div class="re-tile"><small>${esc(l)}</small><b>${esc(val)}</b><span>${esc(s)}</span></div>`).join("")}</div>`;
  const nationalTiles = tiles(snap.tiles) + `<p class="re-src">Official ${esc(snap.source[0])} release ${esc(snap.released)} · next update ${esc(snap.next)} · <a href="${esc(snap.source[1])}" target="_blank" rel="noopener">${esc(snap.source[0])} ${ic("external-link", "xs")}</a></p>`;
  const board = area ? RE_BOARDS[area] : null;
  const parent = local?.parent ? RE_LOCAL[local.parent] : null;
  const localBlock = !area ? "" : local
    ? `<h4 class="re-h local">${ic("map-pin")} ${esc(local.name)} at a glance <small>${esc(local.assoc)} · ${esc(local.period)}${RE_ALIAS[area] ? ` · covers ${esc(area)}` : ""}</small></h4>${tiles(local.tiles)}
       <p class="re-src">Local association data released ${esc(local.released)} · <a href="${esc(local.source)}" target="_blank" rel="noopener">Source ${ic("external-link", "xs")}</a>${local.board ? ` · <a href="${esc(local.board)}" target="_blank" rel="noopener">${esc(local.assoc.split(" · ")[0])} ${ic("external-link", "xs")}</a>` : ""}</p>
       ${parent ? det("parent", `${esc(parent.name)} (${esc(parent.assoc)}) · ${esc(parent.period)}`, tiles(parent.tiles) + `<p class="re-src"><a href="${esc(parent.source)}" target="_blank" rel="noopener">${esc(parent.assoc)} Market Watch ${ic("external-link", "xs")}</a></p>`) : ""}`
    : `<div class="re-noloc">${ic("map-pin")} <div><b>${esc(area)}</b>: local figures aren't loaded yet.${board ? ` See the latest from <a href="${esc(board[1])}" target="_blank" rel="noopener">${esc(board[0])} ${ic("external-link", "xs")}</a>.` : ""} Local headlines are below.</div></div>`;
  const q = newsFilter.toLowerCase();
  const filt = (arr) => (q ? arr.filter((i) => (i.title + " " + i.source).toLowerCase().includes(q)) : arr);
  const nat = data.news.realestate && data.news.realestate.country === c ? data.news.realestate : null;
  const sub = area ? data.reSub[`${c}|${area}`] : null;
  const areas = def.areas[c] || [];
  const allSuggest = Object.entries(M.suggest).flatMap(([r, cs]) => [r, ...cs]).filter((x) => !areas.includes(x));
  const rates = c === "CA"
    ? [rateChip("ca_overnight"), `<span class="rate-chip" title="OSFI minimum qualifying rate"><small>Stress-test floor</small><b>5.25%</b><em>or contract + 2%, whichever is higher</em></span>`, rateChip("ca_5y_posted"), rateChip("ca_prime"), rateChip("ca_5y_bond")]
    : [rateChip("us_30y"), rateChip("us_15y"), rateChip("us_fedfunds")];
  return `<div class="re">
    <div class="re-top">
      <div class="seg re-country">${["CA", "US"].map((k) => `<button data-re-country="${k}" class="${c === k ? "on" : ""}">${RE_MARKETS[k].flag} ${RE_MARKETS[k].label}</button>`).join("")}</div>
      <button class="mini-btn re-def ${isDef ? "on" : ""}" data-re-default title="Open Real Estate here every time">${isDef ? "★ Your default" : "☆ Make this my default"}</button>
    </div>
    <div class="re-areas">
      <div class="re-areas-h"><button class="re-area-btn ${!area ? "on" : ""}" data-re-area="">${M.flag} ${M.label} overview</button><button class="re-add" data-re-add>${ic("plus", "xs")} Add area</button></div>
      <div class="re-chips">${areas.map((a) => `<span class="re-area ${area === a ? "on" : ""}"><button data-re-area="${esc(a)}">${ic(Object.keys(M.suggest).includes(a) ? "map-pin" : "house", "xs")} ${esc(a)}</button><button class="x" data-re-remove="${esc(a)}" aria-label="Remove ${esc(a)}">${ic("x", "xs")}</button></span>`).join("")}</div>
      ${rePicker ? `<div class="re-picker"><div class="inline"><input id="reNewArea" placeholder="Type any city, county, province or state"><button class="btn sm primary" data-re-addtyped>Add</button></div>
        <div class="re-chips wrap">${allSuggest.map((a) => `<button data-re-pick="${esc(a)}">+ ${esc(a)}</button>`).join("")}</div></div>` : `<div class="hint">Tap an area to switch the briefing.</div>`}
    </div>

    ${localBlock}
    ${local ? det("national", `${M.flag} National market at a glance · ${esc(snap.period)}`, nationalTiles) : `<h4 class="re-h">${ic("trending-up")} Market at a glance <small>${esc(snap.period)} · ${snap.currency} · national</small></h4>${nationalTiles}`}

    <div class="re-callout"><h4>What this means for clients${local ? ` <small>· ${esc(local.name)}</small>` : ""}</h4><p>${esc(read.summary)}</p>
      ${det("talk", "Buyer &amp; seller talking points", `<div class="re-two"><div><b>Buyers</b><ul>${read.buyer.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div><div><b>Sellers</b><ul>${read.seller.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div><p class="hint">${local ? `Based on ${esc(local.assoc)} figures for ${esc(local.name)} — confirm with your own comparables.` : "General guidance from national figures — confirm with local data."}</p>`)}
    </div>

    <div class="re-desk"><h4 class="re-h">${ic("briefcase")} Mortgage desk · ${M.label}</h4>
      <p class="hint">National benchmarks, not lender offers.</p>
      <div class="re-rates">${rates.join("") || `<span class="hint">Rates loading…</span>`}</div>
      <p class="re-for"><b>For clients:</b> ${c === "CA" ? "ask the lender about the rate hold, fixed vs variable, prepayment penalties and renewal options. Confirm qualification again before removing financing conditions." : "compare APRs from at least three lenders, ask about points and lender credits, and lock the rate once under contract."}</p>
      ${det("guide", "Down payment &amp; qualification guide", qualGuide(c))}
      ${det("planner", "Payment &amp; rate-change planner", mortgageHTML(c))}
    </div>

    <h4 class="re-h">${ic("newspaper")} News agents need to know <small>${area ? esc(area) : `${M.label} housing, mortgages and development`}</small></h4>
    <div class="news-wrap">${area
      ? (!sub || (sub.loading && !sub.items.length) ? skeleton(4) : filt(sub.items).slice(0, 10).map((i) => newsItemHTML(i, saveBtn, area)).join("") || `<div class="empty">No recent housing headlines for ${esc(area)}.</div>`)
      : (nat ? filt(nat.items).slice(0, 10).map((i) => newsItemHTML(i, saveBtn, `${M.label} coverage`)).join("") || `<div class="empty">No national housing headlines right now.</div>` : skeleton(4))}</div>
  </div>`;
}

// ---------- mortgage calculator (Real Estate planner + Markets)
const ON_LTT = [[55000, 0.005], [250000, 0.01], [400000, 0.015], [2000000, 0.02], [Infinity, 0.025]];
function ontarioLTT(price) {
  let tax = 0, lo = 0;
  for (const [hi, r] of ON_LTT) { if (price > lo) tax += (Math.min(price, hi) - lo) * r; lo = hi; }
  return tax;
}
function cmhcRate(downPct) { return downPct >= 20 ? 0 : downPct >= 15 ? 0.028 : downPct >= 10 ? 0.031 : downPct >= 5 ? 0.04 : null; }
function caMinDown(price) { return price >= 1500000 ? price * 0.2 : Math.min(price, 500000) * 0.05 + Math.max(0, price - 500000) * 0.1; }
function mortgageDefaults() {
  const c = reDefaults().country;
  return (cfg.mortgage ||= { country: c, price: c === "CA" ? 1000000 : 650000, downPct: 20, rate: "", years: c === "CA" ? 25 : 30, freq: "monthly", extra: 0, ontario: true });
}
function payFor(principal, rate, years, freq, country) {
  const perYear = freq === "monthly" ? 12 : 26;
  if (freq === "accel") {
    const rm = country === "CA" ? Math.pow(1 + rate / 200, 1 / 6) - 1 : rate / 1200, nm = years * 12;
    return { pay: (rm ? principal * rm / (1 - Math.pow(1 + rm, -nm)) : principal / nm) / 2, perYear };
  }
  const n = years * perYear, r = country === "CA" ? Math.pow(1 + rate / 200, 2 / perYear) - 1 : rate / 100 / perYear;
  return { pay: r ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n, perYear };
}
function calcMortgage(m) {
  const price = +m.price || 0, down = price * (+m.downPct || 0) / 100;
  const rateDefault = m.country === "CA" ? data.rates?.series?.ca_5y_posted?.value : data.rates?.series?.us_30y?.value;
  const rate = m.rate === "" || m.rate == null ? rateDefault ?? 5 : +m.rate;
  const years = +m.years || 25;
  let principal = price - down, insurance = 0;
  const warn = [];
  if (m.country === "CA") {
    const cr = cmhcRate(+m.downPct);
    if (price >= 1500000 && +m.downPct < 20) warn.push("Homes $1.5M+ need 20% down in Canada.");
    else if (cr === null || down < caMinDown(price) - 1) warn.push(`Minimum down payment on this price is about $${fmtNum(caMinDown(price), 0)} (${fmtNum(caMinDown(price) / price * 100, 1)}%).`);
    else if (cr > 0) { insurance = principal * cr; principal += insurance; }
  } else if (+m.downPct < 20) warn.push("Under 20% down usually adds private mortgage insurance (PMI).");
  const { pay, perYear } = payFor(principal, rate, years, m.freq, m.country);
  const r = m.country === "CA" ? Math.pow(1 + rate / 200, 2 / perYear) - 1 : rate / 100 / perYear;
  let bal = principal, interest = 0, k = 0;
  while (bal > 0.01 && k < 2400) { const i = bal * r; interest += i; bal = bal + i - pay; k++; }
  const monthly = (p) => p * perYear / 12;
  const shock = [1, 2, -1].map((d) => ({ d, pay: payFor(principal, Math.max(0, rate + d), years, m.freq, m.country).pay }));
  const qualRate = m.country === "CA" ? Math.max(rate + 2, 5.25) : null;
  const qualPay = qualRate ? payFor(principal, qualRate, years, "monthly", "CA").pay : null;
  return { price, down, rate, principal, insurance, pay, monthlyEq: monthly(pay) + (+m.extra || 0), interest, years: k / perYear, ltt: m.country === "CA" && m.ontario ? ontarioLTT(price) : 0, warn, rateDefault, shock, qualRate, qualPay };
}
function mortgageOutHTML(m, c) {
  const money = (v) => `$${fmtNum(v, 0)}`;
  const per = m.freq === "monthly" ? "Monthly" : m.freq === "accel" ? "Accelerated bi-weekly" : "Bi-weekly";
  return `<div class="mort-out">
      <div><small>${per} payment</small><b>${money(c.pay)}</b><small>at ${c.rate.toFixed(2)}%</small></div>
      <div><small>About per month, all-in</small><b>${money(c.monthlyEq)}</b></div>
      <div><small>Mortgage amount</small><b>${money(c.principal)}</b>${c.insurance ? `<small>incl. CMHC ${money(c.insurance)}</small>` : ""}</div>
      <div><small>Total interest</small><b>${money(c.interest)}</b><small>paid off in ${fmtNum(c.years, 1)} yrs</small></div>
      ${m.country === "CA" ? `<div><small><label class="inl"><input type="checkbox" data-mort="ontario" ${m.ontario ? "checked" : ""}> Ontario land transfer tax</label></small><b>${m.ontario ? money(c.ltt) : "—"}</b>${m.ontario ? `<small>Toronto adds a municipal tax</small>` : ""}</div>` : ""}
    </div>
    <div class="mort-shock"><b>If rates change</b>${c.shock.map((s) => `<span>${s.d > 0 ? "+" : ""}${s.d}% → ${money(s.pay)} <i class="${s.pay > c.pay ? "down" : "up"}">${s.pay > c.pay ? "+" : "−"}${money(Math.abs(s.pay - c.pay))}</i></span>`).join("")}
      ${c.qualRate ? `<span class="q">Stress test: qualify at ${c.qualRate.toFixed(2)}% → ${money(c.qualPay)}/mo</span>` : ""}</div>
    ${c.warn.length ? `<div class="mort-warn">${c.warn.map(esc).join(" ")}</div>` : ""}`;
}
function mortgageHTML(forceCountry) {
  const m = mortgageDefaults();
  if (forceCountry && m.country !== forceCountry) { m.country = forceCountry; m.rate = ""; m.years = forceCountry === "CA" ? 25 : 30; if (forceCountry === "US" && m.freq === "accel") m.freq = "monthly"; }
  const c = calcMortgage(m);
  const freqs = m.country === "CA" ? [["monthly", "Monthly"], ["biweekly", "Bi-weekly"], ["accel", "Accelerated bi-weekly"]] : [["monthly", "Monthly"], ["biweekly", "Bi-weekly"]];
  return `<div class="mort" data-mort-box>
    <div class="mort-h">${ic("house")}<b>Mortgage calculator</b>
      <span class="seg" ${forceCountry ? "hidden" : ""}>${["CA", "US"].map((k) => `<button data-mort-country="${k}" class="${m.country === k ? "on" : ""}">${RE_MARKETS[k].flag} ${k === "CA" ? "Canada" : "U.S."}</button>`).join("")}</span></div>
    <div class="mort-grid">
      <label>Home price<input data-mort="price" type="number" inputmode="numeric" value="${m.price}"></label>
      <label>Down payment %<input data-mort="downPct" type="number" inputmode="decimal" step="0.5" value="${m.downPct}"><small data-mort-hint="down">$${fmtNum(c.down, 0)}</small></label>
      <label>Interest rate %<input data-mort="rate" type="number" inputmode="decimal" step="0.01" value="${m.rate}" placeholder="${c.rateDefault != null ? c.rateDefault.toFixed(2) : "5.00"}"><small>${m.rate === "" ? (m.country === "CA" ? "Posted 5-yr rate; most buyers get lower" : "Freddie Mac 30-yr average") : "Your rate"}</small></label>
      <label>Amortization<select data-mort="years">${(m.country === "CA" ? [15, 20, 25, 30] : [10, 15, 20, 25, 30]).map((y) => `<option ${+m.years === y ? "selected" : ""}>${y}</option>`).join("")}</select><small>years</small></label>
      <label>Payments<select data-mort="freq">${freqs.map(([v, l]) => `<option value="${v}" ${m.freq === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <label>Taxes, insurance, fees / mo<input data-mort="extra" type="number" inputmode="numeric" value="${m.extra}"></label>
    </div>
    <div data-mort-out>${mortgageOutHTML(m, c)}</div>
    <p class="mort-note">Estimates only${m.country === "CA" ? " · Canadian rates compound semi-annually; CMHC premium is added to the mortgage under 20% down" : ""}. Rates: ${m.country === "CA" ? "Bank of Canada" : "Freddie Mac"}.</p>
  </div>`;
}
function realEstateMarketsHTML() {
  if (!cfg.markets.realestate) return "";
  const order = reDefaults().country === "US" ? ["US", "CA"] : ["CA", "US"];
  const col = cfg.markets.collapsed?.["Real estate & rates"];
  return `<div class="mk-group ${col ? "collapsed" : ""}"><h3><button data-grp-toggle="Real estate &amp; rates">${ic("chevron-down", "chev")}Real estate &amp; rates</button></h3>
    <div class="mk-list re-board">${order.map((c) => `<div class="re-col"><b>${RE_MARKETS[c].flag} ${RE_MARKETS[c].label}</b><div class="re-rates">${RATE_ROWS[c].map(rateChip).join("") || `<span class="hint">Rates loading…</span>`}</div></div>`).join("")}
    ${mortgageHTML()}</div></div>`;
}
async function loadRates() {
  if (!cfg.markets.realestate && !(sectionOn("news") && cfg.news.categories.some((c) => c.id === "realestate" && c.on))) return;
  if (data.rates?.t > Date.now() - 3 * 3600e3) return;
  try { data.rates = { ...(await api("/api/rates")), t: Date.now() }; } catch {}
}

// ============================================================ apps, More page, mobile views
const appIcon = (a) => {
  const host = hostName(a.url);
  const fav = host ? `<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128" alt="" loading="lazy" onload="if(this.naturalWidth>16)this.parentNode.classList.add('has-img');else this.remove()" onerror="this.remove()">` : "";
  return `<span class="app-ico" style="--h:${hashStr(a.name) % 360}">${fav}<em>${esc(a.icon || a.name.slice(0, 1).toUpperCase())}</em></span>`;
};
function renderApps() {
  const bar = $("#appsBar");
  const apps = cfg.apps || [];
  bar.hidden = !cfg.showApps || !apps.length;
  bar.innerHTML = apps.map((a) => `<a class="app" href="${esc(a.url)}" target="_blank" rel="noopener">${appIcon(a)}<span>${esc(a.name)}</span></a>`).join("") +
    `<button class="app app-edit" data-config="apps" title="Edit apps"><span class="app-ico plus">${ic("plus")}</span><span>Edit</span></button>`;
  renderMore();
  if (!$("#appsPop").hidden) renderAppsPop();
}

function renderMore() {
  const seg = (key, opts, cur) => `<span class="seg">${opts.map(([v, l]) => `<button data-quick="${key}" data-v="${v}" class="${cur === v ? "on" : ""}">${l}</button>`).join("")}</span>`;
  const sp = data.quotes?.["^GSPC"];
  $("#more").innerHTML = `
    <h3>Sections</h3>
    <div class="more-secs">
      <button class="more-sec" data-more-view="markets"><span class="ms-ic" style="--c:#22c27a">${ic("trending-up")}</span><span><b>Markets</b><small>${sp && !sp.error ? `S&amp;P ${sp.pct >= 0 ? "▲" : "▼"} ${fmtNum(Math.abs(sp.pct), 2)}%` : "Indexes, boards, real estate, mortgage"}</small></span>${ic("chevron-right", "xs")}</button>
    </div>
    <h3>Your apps</h3>
    <div class="apps-grid">${(cfg.apps || []).map((a) => `<a class="app-tile" href="${esc(a.url)}" target="_blank" rel="noopener">${appIcon(a)}<span>${esc(a.name)}</span></a>`).join("")}
      <button class="app-tile" data-config="apps"><span class="app-ico plus">${ic("plus")}</span><span>Add / edit</span></button></div>
    <h3>Track a flight</h3>
    <div class="inline flight"><input id="flightNo" placeholder="Flight number, e.g. UA 1234" autocapitalize="characters"><button class="btn" data-quick="flight">${ic("plane")} Track</button></div>
    ${alertLogHTML()}
    <h3>Who's using Daily HQ</h3>
    ${profilesHTML()}
    <h3>Quick settings</h3>
    <div class="quick">
      <div class="row"><span class="grow">Theme</span>${seg("theme", [["dark", "Dark"], ["light", "Light"], ["auto", "Auto"]], cfg.theme)}</div>
      <div class="row"><span class="grow">Temperature</span>${seg("units", [["F", "°F"], ["C", "°C"]], cfg.units)}</div>
      <div class="row"><span class="grow">Text size</span>${seg("textSize", [["standard", "Standard"], ["large", "Larger"]], cfg.textSize)}</div>
      <div class="row"><span class="grow">Markets</span>${seg("mkview", [["tiles", "Tiles"], ["list", "List"]], cfg.markets.view)}</div>
    </div>
    <button class="btn primary wide" data-config="general">Customize layout, teams, feeds & cities</button>
    <button class="btn wide" data-quick="refresh">${ic("refresh-cw")} Refresh everything</button>
    <p class="more-foot">Scores: ESPN · Weather: Open-Meteo · Alerts: NWS & Environment Canada · Quotes: Yahoo Finance (may be delayed) · News: publisher RSS feeds.</p>`;
  // every group in More collapses / expands (remembered)
  const more = $("#more");
  more.querySelectorAll(":scope > h3").forEach((h) => {
    const name = h.textContent.trim();
    const d = document.createElement("details");
    d.className = "more-grp";
    d.dataset.moreGrp = name;
    d.open = !cfg.moreClosed?.[name];
    const sum = document.createElement("summary");
    sum.innerHTML = `${ic("chevron-down", "chev")}<span>${esc(name)}</span>`;
    d.append(sum);
    let n = h.nextSibling;
    while (n && !(n.nodeType === 1 && n.tagName === "H3")) { const nx = n.nextSibling; d.append(n); n = nx; }
    h.replaceWith(d);
  });
  more.insertAdjacentHTML("afterbegin", `<button class="mini-btn back-home more-back" data-back-home>${ic("chevron-left")} Home</button>`);
}

function renderAppsPop() {
  $("#appsPop").innerHTML = `<div class="apps-pop-h"><span>Your apps</span><button class="pop-x" data-pop-close aria-label="Close">${ic("x")}</button></div><div class="apps-grid">${(cfg.apps || []).map((a) => `<a class="app-tile" href="${esc(a.url)}" target="_blank" rel="noopener">${appIcon(a)}<span>${esc(a.name)}</span></a>`).join("")}
    <button class="app-tile" data-config="apps"><span class="app-ico plus">${ic("plus")}</span><span>Add / edit</span></button></div>`;
}
function toggleAppsPop(force) {
  const pop = $("#appsPop");
  const open = force ?? pop.hidden;
  if (open) renderAppsPop();
  pop.hidden = !open;
}

function alertLogHTML() {
  let log = [];
  try { log = JSON.parse(store.get(LOG_KEY)) || []; } catch {}
  if (!log.length) return "";
  return `<h3>Recent alerts</h3><div class="quick alog">${log.slice(0, 6).map((a) => `<div class="row">${ic("bell")}<span class="grow"><b>${esc(a.title)}</b>${a.body ? ` · <span class="host">${esc(a.body)}</span>` : ""}</span><span class="host">${ago(a.t)}</span></div>`).join("")}</div>`;
}
function profilesHTML() {
  const list = listProfiles();
  return `<div class="quick">${list.map((p) => `<div class="row">${ic(p.id === profileId ? "circle-check" : "users")}<span class="grow">${esc(p.name || "Unnamed")}${p.id === profileId ? ` <span class="host">· you're here</span>` : ""}</span>${p.id === profileId ? "" : `<button class="btn sm" data-profile="${p.id}">Switch</button>`}${p.id !== "main" && p.id !== profileId ? `<button class="btn sm" data-profile-del="${p.id}" aria-label="Remove">${ic("x", "xs")}</button>` : ""}</div>`).join("")}
    <div class="inline"><input id="newProfile" placeholder="Add a person, e.g. Sam"><button class="btn sm" data-quick="addprofile">${ic("user-plus")} Add</button></div></div>`;
}

function setView(v) {
  if (v !== "home" && cfg.collapsed?.[v]) {
    delete cfg.collapsed[v]; save();
    const el = $(`#sec-${v}`);
    if (el) { el.classList.remove("collapsed"); el.querySelector("[data-sec-toggle]")?.setAttribute("aria-expanded", "true"); }
  }
  if (v === "home") hideBackPill();
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
  const now = new Date(), left = (data.calendar?.events || []).filter((e) => !e.allDay && e.end > now && sameDay(e.start, now)).length;
  const b4 = $("#tb-calendar"); if (b4) { b4.hidden = !left; b4.textContent = left || ""; }
}

// ============================================================ refresh orchestration
const loaders = { sports: loadSports, news: loadNews, weather: loadWeather, markets: loadMarkets, calendar: loadCalendar, brief: async () => renderBrief() };

async function refresh(ids) {
  const btn = $("#refreshAll");
  btn.classList.add("spin");
  let list = ids || ["sports", "news", "weather", "markets", "calendar"];
  if (list.includes("brief")) list = ["sports", "news", "weather", "markets", "calendar"];
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
    if ((cfg.calendars || []).length && due("calendar", 15 * 60e3)) todo.push("calendar");
    if ($("#calendar-body")) { refreshCalData(); renderCalendar(); }
    if (+cfg.alerts?.eventMins || cfg.alerts?.pregame) checkAlerts();
    if (todo.length) refresh(todo);
    tickClock();
  }, 15e3);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - Math.min(...Object.values(data.updated), Date.now()) > 5 * 60e3) refresh();
  });
}

function toggleFlag(obj, key, id, box, btn) {
  const next = !obj[key]?.[id];
  obj[key] = { ...(obj[key] || {}) };
  if (next) obj[key][id] = true; else delete obj[key][id];
  save();
  box.classList.toggle("collapsed", next);
  btn.setAttribute("aria-expanded", String(!next));
}

// ============================================================ main page events
document.addEventListener("click", async (e) => {
  const t = e.target;
  if (t.closest("#bellPop [data-game], #bellPop [data-goto], #bellPop [data-open-url]")) $("#bellPop").hidden = true;
  const ou = t.closest("[data-open-url]");
  if (ou) { window.open(ou.dataset.openUrl, "_blank", "noopener"); return; }
  if (t.closest("[data-modal-close]") || t.id === "modal") { closeModal(); return; }
  const bev = t.closest("[data-brief-ev]");
  if (bev) { const ev = briefEvents[+bev.dataset.briefEv]; if (ev) { calUI.sel = sod(new Date()); calUI.month = new Date(calUI.sel.getFullYear(), calUI.sel.getMonth(), 1); renderCalendar(); showEvent(ev); } return; }
  const gto = t.closest("[data-goto]");
  if (gto) { goToSection(gto.dataset.goto); return; }
  if (t.closest("[data-brief-cal]")) { calUI.sel = sod(new Date()); calUI.month = new Date(calUI.sel.getFullYear(), calUI.sel.getMonth(), 1); renderCalendar(); goToSection("calendar"); return; }
  const gf = t.closest("[data-golf-full]");
  if (gf) { cfg.sports.golfFull = { [gf.dataset.golfFull]: !cfg.sports.golfFull?.[gf.dataset.golfFull] }; save(); renderSports(); return; }
  if (t.closest("[data-back-pill]")) { goBack(); return; }
  if (t.closest("[data-back-home]")) { setView("home"); return; }
  if (t.closest("[data-cal-scores]")) { closeModal(); if (matchMedia("(max-width: 680px)").matches) setView("sports"); else $("#sec-sports")?.scrollIntoView({ behavior: "smooth" }); return; }
  const cd = t.closest("[data-cal-day]");
  if (cd) {
    const [y, m, d] = cd.dataset.calDay.split("-").map(Number);
    calUI.sel = new Date(y, m - 1, d);
    if (calUI.month && calUI.sel.getMonth() !== calUI.month.getMonth()) calUI.month = new Date(y, m - 1, 1);
    renderCalendar(); return;
  }
  const cn = t.closest("[data-cal-nav]");
  if (cn) {
    const k = +cn.dataset.calNav;
    if (calMonthView()) { calUI.month = new Date(calUI.month.getFullYear(), calUI.month.getMonth() + k, 1); const td = sod(new Date()); calUI.sel = calUI.month.getMonth() === td.getMonth() && calUI.month.getFullYear() === td.getFullYear() ? td : calUI.month; }
    else { calUI.sel = plusDays(calUI.sel, 7 * k); calUI.month = new Date(calUI.sel.getFullYear(), calUI.sel.getMonth(), 1); }
    renderCalendar(); return;
  }
  if (t.closest("[data-cal-today]")) { calUI.sel = sod(new Date()); calUI.month = new Date(calUI.sel.getFullYear(), calUI.sel.getMonth(), 1); renderCalendar(); return; }
  if (t.closest("[data-cal-view]")) { store.set(pkey("dhq-cal-view"), calMonthView() ? "week" : "month"); calUI.month = new Date(calUI.sel.getFullYear(), calUI.sel.getMonth(), 1); renderCalendar(); return; }
  const cf = t.closest("[data-cal-filter]");
  if (cf) { const n = cf.dataset.calFilter, h = new Set(cfg.calHidden || []); h.has(n) ? h.delete(n) : h.add(n); cfg.calHidden = [...h]; save(); refreshCalData(); renderCalendar(); renderBrief(); return; }
  const cadd = t.closest("[data-cal-add]");
  if (cadd) { const v = cadd.dataset.calAdd; if (v) { const [y, m, d] = v.split("-").map(Number); calUI.sel = new Date(y, m - 1, d); } eventForm(); return; }
  const ce = t.closest("[data-cal-ev]");
  if (ce) { const ev = calUI.list[+ce.dataset.calEv]; if (ev) showEvent(ev); return; }
  const ee = t.closest("[data-ev-edit]");
  if (ee) { const ev = (cfg.events || []).find((x) => x.id === ee.dataset.evEdit); if (ev) eventForm(ev); return; }
  const ed = t.closest("[data-ev-del]");
  if (ed) {
    const ev = (cfg.events || []).find((x) => x.id === ed.dataset.evDel);
    askConfirm({ title: `Delete "${ev?.title || "this event"}"?`, body: "It will be removed from Daily HQ on all your synced devices. Copies you added to Outlook, Google or iPhone aren't affected." }).then((ok) => {
      if (!ok) return;
      cfg.events = (cfg.events || []).filter((x) => x.id !== ed.dataset.evDel);
      save(); closeModal(); refreshCalData(); renderCalendar(); renderBrief();
      undoToast("Event deleted", () => { cfg.events = [...(cfg.events || []), ev]; save(); refreshCalData(); renderCalendar(); renderBrief(); });
    });
    return;
  }
  const wa = t.closest("[data-w]");
  if (wa) { welcomeAction(wa); return; }
  const sv = t.closest("[data-save]");
  if (sv) {
    const link = sv.dataset.save;
    const i = (cfg.saved || []).findIndex((x) => x.link === link);
    if (i >= 0) {
      const [gone] = cfg.saved.splice(i, 1);
      undoToast("Removed from Saved", () => { cfg.saved.splice(Math.min(i, cfg.saved.length), 0, gone); save(); renderNews(); });
    } else {
      const item = [...Object.values(data.news).filter(Boolean).flatMap((d) => d.items), ...Object.values(data.reSub).flatMap((d) => d.items || [])].find((x) => x.link === link);
      if (item) cfg.saved.unshift({ title: item.title, link: item.link, source: item.source, site: item.site, ts: item.ts, img: imgFor(item), desc: (item.desc || "").slice(0, 160), feed: item.feed });
      cfg.saved = cfg.saved.slice(0, 100);
      toast("Saved for later");
    }
    save(); renderNews(); return;
  }
  const stb = t.closest("[data-standings]");
  if (stb) { showStandings(stb.dataset.standings); return; }
  const gm = t.closest("[data-game]");
  if (gm && !t.closest("a")) { showGame(gm.dataset.path, gm.dataset.game); return; }
  const pf = t.closest("[data-profile]");
  if (pf) { switchProfile(pf.dataset.profile); return; }
  const pd = t.closest("[data-profile-del]");
  if (pd) {
    const name = listProfiles().find((p) => p.id === pd.dataset.profileDel)?.name || "this person";
    askConfirm({ title: `Remove ${name} from Daily HQ?`, body: `All of ${esc(name)}'s teams, cities, news, calendars and saved items on this device will be erased. <b>This can't be undone</b> unless they have a sync code.`, ok: "Remove" })
      .then((ok) => { if (ok) { removeProfile(pd.dataset.profileDel); renderMore(); toast("Removed"); } });
    return;
  }
  if (t.closest("[data-pop-close]")) { $("#bellPop").hidden = true; $("#appsPop").hidden = true; return; }
  if (t.closest("#bellBtn")) { toggleBell(); return; }
  if (!t.closest("#bellPop")) $("#bellPop").hidden = true;
  if (t.closest("#appsBtn")) { toggleAppsPop(); return; }
  if (!t.closest("#appsPop")) $("#appsPop").hidden = true;
  const vl = t.closest("[data-view-link]");
  if (vl && matchMedia("(max-width: 680px)").matches) { e.preventDefault(); setView(vl.dataset.viewLink); return; }
  const mv2 = t.closest("[data-more-view]");
  if (mv2) { hideBackPill(); setView(mv2.dataset.moreView); $$("#tabbar button").forEach((b) => b.classList.toggle("on", b.dataset.view === "more")); return; }
  const tabBtn = t.closest("#tabbar [data-view]");
  if (tabBtn) { hideBackPill(); setView(tabBtn.dataset.view); return; }
  const stg = t.closest("[data-sec-toggle]");
  if (stg) { toggleFlag(cfg, "collapsed", stg.dataset.secToggle, stg.closest(".card"), stg); return; }
  const ut = t.closest("[data-up-toggle]");
  if (ut) { cfg.sports.upCollapsed = !cfg.sports.upCollapsed; save(); ut.closest(".upnext").classList.toggle("collapsed", cfg.sports.upCollapsed); ut.setAttribute("aria-expanded", String(!cfg.sports.upCollapsed)); return; }
  const gt = t.closest("[data-grp-toggle]");
  if (gt) { toggleFlag(cfg.markets, "collapsed", gt.dataset.grpToggle, gt.closest(".mk-group"), gt); return; }
  const ca = t.closest("[data-collapse-all]");
  if (ca) {
    const close = ca.dataset.collapseAll === "1";
    cfg.collapsed = close ? Object.fromEntries(cfg.sections.map((x) => [x.id, true])) : {};
    save();
    $$(".grid > .card").forEach((c) => { c.classList.toggle("collapsed", close); c.querySelector("[data-sec-toggle]")?.setAttribute("aria-expanded", String(!close)); });
    return;
  }
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
  const rc = t.closest("[data-re-country]");
  if (rc) { const v = reCur(); v.country = rc.dataset.reCountry; rePicker = false; delete data.news.realestate; renderNews(); loadRE().then(renderNews); return; }
  const ra = t.closest("[data-re-area]");
  if (ra) { const v = reCur(); v.area[v.country] = ra.dataset.reArea; renderNews(); loadRESub(); return; }
  if (t.closest("[data-re-add]")) { rePicker = !rePicker; renderNews(); if (rePicker) setTimeout(() => $("#reNewArea")?.focus(), 0); return; }
  const rpick = t.closest("[data-re-pick]") || (t.closest("[data-re-addtyped]") && { dataset: { rePick: ($("#reNewArea")?.value || "").trim() } });
  if (rpick) {
    const a = rpick.dataset.rePick; if (!a) { toast("Type an area first"); return; }
    const v = reCur(), d = reDefaults();
    if (!d.areas[v.country].includes(a)) d.areas[v.country].push(a);
    v.area[v.country] = a; rePicker = false; save(); renderNews(); loadRESub(); return;
  }
  const rrm = t.closest("[data-re-remove]");
  if (rrm) {
    const a = rrm.dataset.reRemove, v = reCur(), d = reDefaults();
    const before = JSON.stringify(cfg.realestate || {}), c0 = v.country;
    undoToast(`Removed ${a}`, () => { cfg.realestate = JSON.parse(before); save(); renderNews(); renderMarkets(true); });
    d.areas[c0] = d.areas[c0].filter((x) => x !== a);
    if (v.area[v.country] === a) v.area[v.country] = "";
    if (d.area[v.country] === a) d.area[v.country] = "";
    save(); renderNews(); return;
  }
  if (t.closest("[data-re-default]")) { const v = reCur(), d = reDefaults(); d.country = v.country; d.area = { ...d.area, [v.country]: v.area[v.country] || "" }; save(); renderNews(); toast(`Real Estate will open on ${v.area[v.country] || RE_MARKETS[v.country].label + " overview"}`); return; }
  if (t.closest("[data-goto-calc]")) { reOpen.add("planner"); renderNews(); return; }
  const mc = t.closest("[data-mort-country]");
  if (mc) {
    const m = mortgageDefaults(), k = mc.dataset.mortCountry;
    if (m.country !== k) { m.country = k; m.rate = ""; m.years = k === "CA" ? 25 : 30; if (k === "US" && m.freq === "accel") m.freq = "monthly"; save(); }
    const inRE = !!mc.closest(".re");
    if (inRE) { const v = reCur(); if (v.country !== k) { v.country = k; delete data.news.realestate; renderNews(); loadRE().then(renderNews); } else renderNews(); }
    renderMarkets(true); if (!inRE) renderNews();
    return;
  }
  const sp = t.closest("[data-spmode]");
  if (sp) { cfg.sports.mode = sp.dataset.spmode; save(); renderSports(); return; }
  const src = t.closest("[data-src]");
  if (src) { newsSource[activeNews] = src.dataset.src; newsLimit[activeNews] = 0; renderNews(); return; }
  const mv = t.closest("[data-mkview]");
  if (mv) { cfg.markets.view = mv.dataset.mkview; save(); renderMarkets(); renderMore(); return; }
  const mt = t.closest("[data-mktab]");
  if (mt) { cfg.markets.tab = mt.dataset.mktab; save(); if (mt.dataset.mktab.startsWith("re:")) loadRates().then(() => renderMarkets(true)); renderMarkets(true); mt.parentNode && $(`[data-mktab="${CSS.escape(cfg.markets.tab)}"]`)?.scrollIntoView({ block: "nearest", inline: "center" }); return; }
  const mra = t.closest("[data-mk-rearea]");
  if (mra) { const [c, a] = mra.dataset.mkRearea.split("|"); marketREArea[c] = a; renderMarkets(true); return; }
  const mrn = t.closest("[data-mk-renews]");
  if (mrn) {
    const c = mrn.dataset.mkRenews, rc = cfg.news.categories.find((x) => x.id === "realestate");
    if (rc) { rc.on = true; reCur().country = c; activeNews = "realestate"; save(); loadCategory(rc).then(renderNews); renderNews(); if (matchMedia("(max-width: 680px)").matches) setView("news"); else $("#sec-news")?.scrollIntoView({ behavior: "smooth" }); }
    return;
  }
  const qk = t.closest("[data-quick]");
  if (qk) {
    const k = qk.dataset.quick, v = qk.dataset.v;
    if (k === "refresh") { refresh(); toast("Refreshing…"); return; }
    if (k === "feedback") { closeSettings?.(); openFeedback(); return; }
    if (k === "installtip") { closeSettings?.(); maybeInstallTip(true); return; }
    if (k === "notif") {
      try { const r = await Notification.requestPermission(); toast(r === "granted" ? "Alerts will also show on this device" : "Notifications weren't allowed"); setUnread(unreadCount()); } catch { toast("Notifications aren't available here"); }
      renderBellPop(); return;
    }
    if (k === "flight") {
      const f = ($("#flightNo").value || "").toUpperCase().replace(/\s+/g, "");
      if (!/^[A-Z0-9]{2,3}\d{1,4}$/.test(f)) { toast("Enter a flight like UA1234"); return; }
      window.open(`https://www.flightaware.com/live/flight/${f}`, "_blank", "noopener");
      return;
    }
    if (k === "addprofile") { const n = $("#newProfile").value.trim(); if (!n) { toast("Type a name first"); return; } addProfile(n); return; }
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
  if (wx && !t.closest("a")) {
    const open = wx.classList.toggle("open");
    wx.setAttribute("aria-expanded", open);
    cfg.wxOpen = { ...(cfg.wxOpen || {}) };
    if (open) cfg.wxOpen[wx.dataset.wxName] = true; else delete cfg.wxOpen[wx.dataset.wxName];
    save(); return;
  }
});
function updateMortgageOut() {
  const m = mortgageDefaults(), c = calcMortgage(m);
  $$("[data-mort-box]").forEach((box) => {
    box.querySelector("[data-mort-out]").innerHTML = mortgageOutHTML(m, c);
    const h = box.querySelector('[data-mort-hint="down"]'); if (h) h.textContent = `$${fmtNum(c.down, 0)}`;
    box.querySelectorAll("[data-mort]").forEach((inp) => { if (inp !== document.activeElement && inp.type !== "checkbox" && inp.value !== String(m[inp.dataset.mort])) inp.value = m[inp.dataset.mort]; });
  });
}
document.addEventListener("toggle", (e) => {
  const k = e.target.dataset?.reDet; if (!k) return;
  if (e.target.open) reOpen.add(k); else reOpen.delete(k);
}, true);
document.addEventListener("focusout", (e) => {
  if (e.target.closest?.("[data-mort-box]") && renderMarkets.pending) setTimeout(() => { if (!document.activeElement?.closest?.("[data-mort-box]")) { renderMarkets.pending = false; renderMarkets(); } }, 50);
});
document.addEventListener("toggle", (e) => {
  const d = e.target;
  if (d.dataset?.alCat) { cfg.alertsOpen = { ...(cfg.alertsOpen || {}), [d.dataset.alCat]: d.open }; save(); return; }
  if (!d.dataset?.moreGrp) return;
  cfg.moreClosed = { ...(cfg.moreClosed || {}) };
  if (d.open) delete cfg.moreClosed[d.dataset.moreGrp]; else cfg.moreClosed[d.dataset.moreGrp] = true;
  save();
}, true);
document.addEventListener("submit", (e) => {
  const q = e.target.closest("[data-cal-quick]");
  if (q) {
    e.preventDefault();
    const text = q.q.value.trim();
    if (!text) return eventForm();
    const p = parseQuick(text, calUI.sel);
    const ev = { id: `l${Date.now().toString(36)}`, title: p.title, start: p.start.toISOString(), end: p.end.toISOString(), allDay: p.allDay, location: "", notes: "" };
    addLocalEvent(ev);
    showEvent(ev, true);
    return;
  }
  const f = e.target.closest("[data-ev-form]");
  if (f) { e.preventDefault(); saveEventForm(f); }
});
document.addEventListener("change", (e) => {
  if (e.target.name === "allDay" && e.target.closest("[data-ev-form]")) {
    const form = e.target.closest("form"), ad = e.target.checked;
    for (const n of ["start", "end"]) {
      const inp = form[n], v = inp.value;
      inp.type = ad ? "date" : "datetime-local";
      inp.value = ad ? v.slice(0, 10) : v ? `${v.slice(0, 10)}T${n === "start" ? "09:00" : "10:00"}` : "";
    }
    return;
  }
  const f = e.target.dataset?.mort; if (!f) return;
  const m = mortgageDefaults();
  m[f] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
  save();
  if (f === "freq" || f === "years" || f === "ontario") updateMortgageOut();
});
document.addEventListener("input", (e) => {
  if (e.target.dataset?.mort && e.target.tagName === "INPUT" && e.target.type !== "checkbox") { mortgageDefaults()[e.target.dataset.mort] = e.target.value; save(); updateMortgageOut(); }
  if (e.target.id === "newsFilter") { newsFilter = e.target.value; renderNews(); }
  if (e.target.id === "convUsd" || e.target.id === "convCad") {
    const q = data.quotes["CAD=X"]; if (!q || q.error) return;
    if (e.target.id === "convUsd") { converterHTML.usd = +e.target.value || 0; $("#convCad").value = (converterHTML.usd * q.price).toFixed(2); }
    else { converterHTML.usd = +((+e.target.value || 0) / q.price).toFixed(2); $("#convUsd").value = converterHTML.usd; }
  }
});
$("#refreshAll").onclick = () => refresh();
$("#openSettings").onclick = () => openSettings();
$("#footSettings").onclick = (e) => { e.preventDefault(); openSettings("general"); };

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "reNewArea") { $("[data-re-addtyped]")?.click(); return; }
  if (e.key === "Escape" && !$("#modal").hidden) { closeModal(); return; }
  if (e.key === "Escape" && (!$("#bellPop").hidden || !$("#appsPop").hidden)) { $("#bellPop").hidden = true; $("#appsPop").hidden = true; return; }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("[data-game]")) { e.preventDefault(); e.target.click(); return; }
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
  $("#bellPop").hidden = true;
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
  const reg = { general: setGeneral, sports: setSports, news: setNews, weather: setWeather, markets: setMarkets, calendar: setCalendar, alerts: setAlerts, apps: setApps };
  if (!reg[tab]) tab = "general";
  $$("#drawerTabs button").forEach((x) => x.classList.toggle("on", x.dataset.tab === tab));
  b.innerHTML = reg[tab]();
  b.scrollTop = scroll;
}

function setGeneral() {
  const n = cfg.sections.length;
  return `
  ${BETA ? `<div class="set beta-set"><h4>${ic("sparkles")} Daily HQ beta</h4><p class="hint">${esc(BETA.version)}${BETA.name ? ` · invite for ${esc(BETA.name)}` : ""}${BETA.expires ? ` · access until ${new Date(BETA.expires).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}` : ""}</p><div class="inline"><button class="btn primary" data-quick="feedback">${ic("send")} Send feedback</button><button class="btn" data-quick="installtip">${ic("smartphone")} Add to home screen</button></div></div>` : ""}
  <div class="set"><h4>Your name</h4><p class="hint">Used in the greeting.</p><input data-bind="name" value="${esc(cfg.name)}"></div>
  ${setExtrasHTML()}
  ${setCommuteHTML()}
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
        (s, i) => `<div class="row">${ord("sec-move", i, n)}<span class="grow">${ic(SECTION_META[s.id].icon)} ${SECTION_META[s.id].title}</span>
        <select data-act="sec-w" data-i="${i}" style="width:auto">${[[12, "Full"], [8, "Wide"], [6, "Half"], [4, "Narrow"]].map(([v, l]) => `<option value="${v}" ${s.w == v ? "selected" : ""}>${l}</option>`).join("")}</select>
        ${sw("sec-on", s.on, `data-i="${i}"`)}</div>`
      )
      .join("")}
  </div>
  <div class="set"><h4>${ic("refresh-cw")} Sync across your devices</h4>
    ${cfg.sync?.code
      ? `<p class="hint">Sync is on. Open the restore link on a new phone or computer — or enter this code in Customize → General — to bring over all your settings. Changes on any device update the others. Keep the code private.</p>
         <div class="sync-code">${fmtCode(cfg.sync.code)}</div>
         <div class="inline"><button class="btn" data-act="sync-copy">${ic("copy")} Copy code</button><button class="btn" data-act="sync-link">${ic("link")} Copy restore link</button><button class="btn danger" data-act="sync-off">Turn off on this device</button></div>`
      : `<p class="hint">Keep your phone and computers in step. Your settings are stored privately under a random code that only you know.</p>
         <div class="inline"><button class="btn primary" data-act="sync-on">Turn on sync</button></div>
         <div class="inline"><input id="syncCode" placeholder="Have a code? XXXX-XXXX-XXXX"><button class="btn" data-act="sync-join">Use code</button></div>`}
  </div>
  <div class="set"><h4>${ic("users")} People on this device</h4><p class="hint">Each person gets their own teams, feeds, cities and apps. Switching doesn't change anyone else's setup.</p>${profilesHTML()}</div>
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
  <div class="set"><h4>Game details</h4><div class="row"><span class="grow">Show betting lines (spread and over/under) on upcoming games</span>${sw("odds-on", cfg.sports.odds !== false)}</div><p class="hint">Injury reports show in each game's details. Team news for every team you follow is added to your Sports news tab automatically.</p></div>
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
      return `<div class="box"><div class="box-h">${ord("league-move", i, cfg.sports.leagues.length)}<b class="grow lg-set" style="flex:1">${leagueBadge(L.key)} ${m.name}</b>
          <button class="btn sm danger" data-act="league-del" data-i="${i}">Remove</button></div>
        ${m.kind === "golf" ? `<p class="hint">Shows this week's tournament leaderboard — no teams to pick.</p>` : `${m.kind === "cricket" ? `<p class="hint">Shows internationals and major leagues (IPL, Big Bash, The Hundred…). Add teams to always see their matches.</p>` : `<div class="row"><span class="grow">All of today's games</span>${sw("league-all", L.showAll, `data-i="${i}"`)}</div>`}
        <div class="chips">${(L.teams || [])
          .map((ab) => `<span class="chip">${byAbbr[ab]?.logo ? `<img src="${esc(byAbbr[ab].logo)}" alt="">` : ""}${esc(byAbbr[ab]?.short || ab)}<button data-act="team-del" data-i="${i}" data-v="${esc(ab)}" aria-label="Remove">${ic("x", "xs")}</button></span>`)
          .join("")}<span class="chip add" data-act="team-pick" data-i="${i}">${openPicker === L.key ? "Done" : "+ Teams"}</span></div>
        ${picker}`}</div>`;
    })
    .join("")}
  </div>
  ${avail.length ? `<div class="set"><h4>Add a league</h4><div class="inline"><select id="leagueAdd">${avail.map(([k, m]) => `<option value="${k}">${m.name}</option>`).join("")}</select><button class="btn primary" data-act="league-add">Add</button></div></div>` : ""}`;
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
      const base = c.id === "local" ? cfg.weather.cities.map((x) => { const nm = x.name.split(",")[0].trim(); return [nm, gnewsCC(`"${nm}"`, cfg.homeCC)]; }) : SUGGESTED_FEEDS[c.id] || [];
      const sugg = base.filter(([n, url]) => !c.feeds.some((f) => f.url === url || f.name === n));
      return `<div class="box">
        <div class="box-h">${ord("cat-move", i, cats.length)}<input data-act="cat-name" data-i="${i}" value="${esc(c.name)}">${sw("cat-on", c.on, `data-i="${i}"`)}</div>
        ${c.feeds
          .map(
            (f, j) => `<div class="row">${sw("feed-on", f.on, `data-i="${i}" data-j="${j}"`)}<span class="grow">${esc(f.name)} <span class="host">${f.auto === "team" ? "your team" : esc(hostOf(f.url))}</span></span>
            <button class="btn sm" data-act="feed-del" data-i="${i}" data-j="${j}" aria-label="Remove">${ic("x", "xs")}</button></div>`
          )
          .join("") || `<div class="hint" style="color:var(--muted);font-size:12.5px;padding:6px 0">No feeds yet.</div>`}
        ${sugg.length ? `<div class="chips">${sugg.map(([n, u]) => `<span class="chip add" data-act="feed-sugg" data-i="${i}" data-name="${esc(n)}" data-url="${esc(u)}">+ ${esc(n)}</span>`).join("")}</div>` : ""}
        <div class="inline"><input id="topic-${i}" placeholder="Track a topic, e.g. Fed rate decision"><button class="btn sm" data-act="topic-add" data-i="${i}">+ Topic</button></div>
        <div class="inline"><input id="fname-${i}" placeholder="Feed name" style="flex:.6"><input id="furl-${i}" placeholder="RSS URL https://…"><button class="btn sm" data-act="feed-add" data-i="${i}">+ Feed</button></div>
        <div style="text-align:right;margin-top:8px"><button class="btn sm danger" data-act="cat-del" data-i="${i}">Delete category</button></div>
      </div>`;
    })
    .join("")}
  </div>
  <div class="set"><h4>Add a category</h4><div class="inline"><input id="catName" placeholder="e.g. Hockey, Toronto, Real Estate"><button class="btn primary" data-act="cat-add">Add</button></div></div>
  <div class="set"><h4>Headlines per tab</h4><select data-act="per-cat" style="width:auto">${[12, 24, 36, 50].map((n) => `<option ${cfg.news.perCategory == n ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
}

function setCalendar() {
  const C = cfg.calendars || [];
  return `
  <div class="set"><h4>Your calendars</h4><p class="hint">Shows today's and tomorrow's events, and your next meeting in the brief. Uses a private, read-only calendar link — Daily HQ can't change your calendar.</p>
  ${C.map((c, i) => `<div class="row"><span class="ev-dot" style="background:${esc(c.color || CAL_COLORS[i % CAL_COLORS.length])}"></span><span class="grow">${esc(c.name)} <span class="host">${esc(hostOf(c.url.replace(/^webcal/, "https")))}</span></span><button class="btn sm" data-act="cal-del" data-i="${i}" aria-label="Remove">${ic("x", "xs")}</button></div>`).join("") || `<p class="hint">No calendars yet.</p>`}
  </div>
  <div class="set"><h4>Add a calendar</h4>
    <div class="inline"><input id="calName" placeholder="Name, e.g. Work"></div>
    <div class="inline"><input id="calUrl" placeholder="Private calendar link (.ics)"><button class="btn primary" data-act="cal-add">Add</button></div>
  </div>
  <div class="set"><h4>Where to find the link</h4>
    <p class="hint"><b>Google Calendar</b> (on a computer): Settings → click your calendar on the left → <i>Integrate calendar</i> → copy <i>Secret address in iCal format</i>.</p>
    <p class="hint"><b>Outlook / Microsoft 365</b>: Settings → Calendar → Shared calendars → <i>Publish a calendar</i> → choose "Can view all details" → copy the <i>ICS</i> link.</p>
    <p class="hint"><b>iCloud</b>: Calendar app → share icon next to the calendar → turn on <i>Public Calendar</i> → copy the link.</p>
    <p class="hint">Treat this link like a password: anyone with it can see your events. It's kept on this device (and in your sync, if on).</p>
  </div>`;
}

function setAlerts() {
  const A = cfg.alerts;
  const perm = "Notification" in window ? Notification.permission : "unsupported";
  return `
  <div class="set"><h4>${ic("bell")} Alerts</h4><p class="hint">Alerts pop up in Daily HQ, collect under the bell at the top, and add a number to the Daily HQ icon on your home screen. If you allow it, they also appear as notifications on this device while Daily HQ is open or recently used.</p>
    ${perm === "granted" ? `<p class="hint ok">${ic("circle-check")} Notifications are on for this device.</p>`
      : perm === "unsupported" ? `<p class="hint">This browser doesn't support notifications. On iPhone, add Daily HQ to your Home Screen first.</p>`
      : `<button class="btn primary" data-act="notif-on">${ic("bell-ring")} Allow notifications on this device</button>`}
  </div>
  ${alertCat("sports", "trophy", "Sports", "Your teams' games", A.gameStart || A.finals || A.pregame, `
    <div class="row"><span class="grow">30 minutes before a game</span>${sw("al-pregame", A.pregame)}</div>
    <div class="row"><span class="grow">When a game starts</span>${sw("al-gameStart", A.gameStart)}</div>
    <div class="row"><span class="grow">Final scores</span>${sw("al-finals", A.finals)}</div>
    ${cfg.sports.leagues.filter((L) => (L.teams || []).length && !LEAGUES[L.key]?.kind).length ? `<p class="hint al-sub">Tap to turn alerts off for a league or team</p>
    ${cfg.sports.leagues.filter((L) => (L.teams || []).length && !LEAGUES[L.key]?.kind).map((L) => `<div class="al-group">${muteChip(`lg:${L.key}`, `${LEAGUES[L.key].icon} ${LEAGUES[L.key].name}`, true)}${L.teams.map((t) => muteChip(`tm:${L.key}:${t}`, t, false, isMutedK(`lg:${L.key}`))).join("")}</div>`).join("")}` : ""}`)}
  ${alertCat("calendar", "calendar-days", "Calendar", "Reminders before your events", +A.eventMins > 0, `
    <div class="row"><span class="grow">Remind me before events</span><select data-act="al-eventMins" style="width:auto">${[[0, "Off"], [5, "5 min before"], [10, "10 min before"], [15, "15 min before"], [30, "30 min before"], [60, "1 hour before"]].map(([v, l]) => `<option value="${v}" ${+A.eventMins === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    ${[...(cfg.calendars || []).map((c) => c.name), LOCAL_CAL].length > 1 ? `<p class="hint al-sub">Tap to turn reminders off for a calendar</p><div class="al-group">${[...(cfg.calendars || []).map((c) => c.name), LOCAL_CAL].map((n) => muteChip(`cal:${n}`, n)).join("")}</div>` : ""}
    <p class="hint">Daily HQ needs to be open (or recently used) to remind you. All-day events aren't included.</p>`)}
  ${alertCat("weather", "cloud-sun", "Weather", "Warnings and rain or snow heads-up", A.weather || A.rainToday, `
    <div class="row"><span class="grow">Official weather warnings</span>${sw("al-weather", A.weather)}</div>
    <div class="row"><span class="grow">Morning heads-up when rain or snow is likely</span>${sw("al-rainToday", A.rainToday)}</div>
    ${cfg.weather.cities.length > 1 ? `<p class="hint al-sub">Tap to turn alerts off for a city</p><div class="al-group">${cfg.weather.cities.map((c) => muteChip(`city:${c.name}`, c.name.split(",")[0])).join("")}</div>` : ""}`)}
  ${alertCat("markets", "trending-up", "Markets", "Big moves and price targets", +A.movePct > 0 || (A.prices || []).length, `
    <div class="row"><span class="grow">When a stock on your boards moves</span><select data-act="al-move" style="width:auto">${[[0, "Off"], [2, "2% or more"], [3, "3% or more"], [5, "5% or more"]].map(([v, l]) => `<option value="${v}" ${+A.movePct === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    ${cfg.markets.groups.length > 1 ? `<p class="hint al-sub">Tap to turn big-move alerts off for a board</p><div class="al-group">${cfg.markets.groups.map((g) => muteChip(`board:${g.name}`, g.name)).join("")}</div>` : ""}
    <p class="hint" style="margin-top:10px">Price targets</p>
    ${(A.prices || []).map((p, i) => `<div class="row"><span class="grow"><b>${esc(label(p.symbol))}</b> ${p.above ? `above ${esc(p.above)}` : ""}${p.above && p.below ? " · " : ""}${p.below ? `below ${esc(p.below)}` : ""}</span><button class="btn sm" data-act="pt-del" data-i="${i}" aria-label="Remove">${ic("x", "xs")}</button></div>`).join("")}
    <div class="inline"><input id="ptSym" placeholder="Symbol, e.g. NVDA" autocapitalize="characters"><select id="ptDir" style="flex:0 0 96px"><option value="above">above</option><option value="below">below</option></select><input id="ptVal" type="number" inputmode="decimal" placeholder="Price"><button class="btn sm" data-act="pt-add">Add</button></div>`)}
  <div class="set"><h4>${ic("moon")} Quiet hours</h4>
    <div class="row"><span class="grow">Don't pop up or notify during quiet hours</span>${sw("al-quiet", A.quiet?.on)}</div>
    ${A.quiet?.on ? `<div class="row"><span class="grow">From</span><select data-act="al-qfrom" style="width:auto">${hourOpts(A.quiet.from)}</select><span>to</span><select data-act="al-qto" style="width:auto">${hourOpts(A.quiet.to)}</select></div>` : ""}
    <p class="hint">Alerts during quiet hours still collect under the bell — you just won't be interrupted.</p>
  </div>`;
}
const isMutedK = (k) => (cfg.alerts.mute || []).includes(k);
const muteChip = (k, label2, strong = false, parentOff = false) => `<button class="chip al-chip ${isMutedK(k) || parentOff ? "off" : "on"} ${strong ? "strong" : ""}" data-act="al-mute" data-k="${esc(k)}" ${parentOff ? "disabled" : ""} aria-pressed="${!isMutedK(k)}">${isMutedK(k) || parentOff ? ic("bell-off", "xs") : ic("bell", "xs")} ${esc(label2)}</button>`;
const hourOpts = (v) => Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${+v === h ? "selected" : ""}>${new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: "numeric" })}</option>`).join("");
function alertCat(id, icon, title, sub, on, body) {
  return `<details class="set al-cat" ${cfg.alertsOpen?.[id] === false ? "" : "open"} data-al-cat="${id}"><summary><span class="al-ico ${on ? "on" : ""}">${ic(icon)}</span><span class="al-t"><b>${title}</b><small>${on ? sub : "Off"}</small></span>${ic("chevron-down", "chev")}</summary><div class="al-body">${body}</div></details>`;
}

function setApps() {
  const A = cfg.apps;
  return `
  <div class="set"><h4>Your apps</h4><p class="hint">Shortcuts to the sites you use every day. Open them from the apps button at the top (computer) or the More tab (phone). Each shows the site's own icon.</p>
  ${A.map((a, i) => `<div class="row">${ord("app-move", i, A.length)}${appIcon(a)}<span class="grow">${esc(a.name)} <span class="host">${esc(hostOf(a.url))}</span></span><button class="btn sm" data-act="app-del" data-i="${i}" aria-label="Remove">${ic("x", "xs")}</button></div>`).join("") || `<p class="hint">No apps yet.</p>`}
  </div>
  <div class="set"><h4>Add an app</h4>
    <div class="inline"><input id="appIcon" placeholder="🙂" maxlength="2" title="Fallback icon if the site has none" style="flex:0 0 56px;text-align:center"><input id="appName" placeholder="Name, e.g. LinkedIn"></div>
    <div class="inline"><input id="appUrl" placeholder="https://…"><button class="btn primary" data-act="app-add">Add</button></div>
    <div class="chips">${[["LinkedIn", "https://www.linkedin.com", "💼"], ["Gmail", "https://mail.google.com", "✉️"], ["Google Calendar", "https://calendar.google.com", "📅"], ["NJ Transit", "https://www.njtransit.com", "🚆"], ["Netlify", "https://app.netlify.com", "🌐"], ["GitHub", "https://github.com", "🐙"], ...RIDE_APPS.map((a) => [a.name, a.url, a.icon]), ["Instacart", "https://www.instacart.com", "🛒"], ["OpenTable", "https://www.opentable.com", "🍽️"]]
      .filter(([n, u]) => !A.some((a) => a.name === n || a.url === u))
      .map(([n, u, em]) => `<span class="chip add" data-act="app-sugg" data-name="${esc(n)}" data-url="${esc(u)}" data-icon="${em}">+ ${esc(n)}</span>`).join("")}</div>
  </div>`;
}

function setWeather() {
  const cs = cfg.weather.cities;
  return `
  <div class="set"><h4>Your cities</h4><p class="hint">The first city shows in the header "at a glance" bar.</p>
  ${cs.map((c, i) => `<div class="row">${ord("city-move", i, cs.length)}<span class="grow">${esc(c.name)}</span><button class="btn sm" data-act="city-del" data-i="${i}">${ic("x", "xs")}</button></div>`).join("") || `<p class="hint">No cities yet.</p>`}
  </div>
  <div class="set"><h4>Add a city</h4>
    <div class="inline"><input id="cityQ" placeholder="Search a city… e.g. Tampa"><button class="btn primary" data-act="city-search">Search</button></div>
    <div class="inline"><button class="btn" data-act="city-here">${ic("map-pin")} Use my current location</button></div>
    ${citySearch.length ? `<div class="sugg">${citySearch.map((r, k) => `<button data-act="city-add" data-k="${k}">${esc(r.name)}<small>${esc([r.admin1, r.country].filter(Boolean).join(", "))}</small></button>`).join("")}</div>` : ""}
  </div>`;
}

function symChips(list, act, gi = "") {
  return list
    .map((s, k) => `<span class="chip">${esc(label(s))}${label(s) !== s ? ` <span class="host">${esc(s)}</span>` : ""}<button data-act="${act}" data-g="${gi}" data-k="${k}" aria-label="Remove">${ic("x", "xs")}</button></span>`)
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
  <div class="set"><div class="row"><span class="grow">USD ⇄ CAD converter</span>${sw("conv-on", cfg.markets.converter)}</div>
    <div class="row"><span class="grow">Real estate rates & mortgage calculator</span>${sw("re-on", cfg.markets.realestate)}</div></div>
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
  const CONFIRM = {
    "league-del": () => ({ title: `Remove ${LEAGUES[L[i]?.key]?.name || "this league"}?`, body: (L[i]?.teams || []).length ? `Your ${L[i].teams.length} picked team${L[i].teams.length > 1 ? "s" : ""} (${esc(L[i].teams.join(", "))}) will be removed too.` : "", ok: "Remove" }),
    "cat-del": () => ({ title: `Delete the "${C[i]?.name}" news tab?`, body: `Its ${C[i]?.feeds?.length || 0} sources will be removed. Saved headlines stay saved.` }),
    "feed-del": () => ({ title: `Remove ${C[i]?.feeds?.[+a.dataset.j]?.name || "this source"}?`, body: `It will no longer appear in ${esc(C[i]?.name || "this tab")}.`, ok: "Remove" }),
    "city-del": () => ({ title: `Remove ${cfg.weather.cities[i]?.name || "this city"}?`, body: "Its forecast and weather alerts will stop.", ok: "Remove" }),
    "grp-del": () => ({ title: `Delete the "${G[i]?.name}" board?`, body: `All ${G[i]?.symbols?.length || 0} symbols on it will be removed.` }),
    "cal-del": () => ({ title: `Disconnect ${cfg.calendars[i]?.name || "this calendar"}?`, body: "Its events disappear from Daily HQ. To add it back you'll need the calendar link again.", ok: "Disconnect" }),
    "app-del": () => ({ title: `Remove ${cfg.apps[i]?.name || "this app"}?`, body: "", ok: "Remove" }),
    "pt-del": () => ({ title: "Delete this price alert?", body: "" }),
    "sync-off": () => ({ title: "Turn off sync on this device?", body: "Changes here will stop reaching your other devices. <b>Save your code or restore link first</b> — you'll need it to turn sync back on.", ok: "Turn off" }),
    "sync-join": () => ({ title: "Replace this device's settings?", body: "Everything on this device will be replaced by the settings saved under that code. This can't be undone.", ok: "Replace", danger: false }),
    "import": () => ({ title: "Replace all your settings?", body: "Your current teams, cities, news tabs, boards and calendars will be replaced by the pasted settings. This can't be undone.", ok: "Replace", danger: false }),
    "reset": () => ({ title: "Reset everything to defaults?", body: "All your teams, cities, news tabs, market boards, calendars, apps and saved events will be erased. <b>This can't be undone.</b>", ok: "Reset" }),
  };
  if (CONFIRM[act]) {
    if (!(await askConfirm(CONFIRM[act]()))) return;
    a.dataset.confirm = 1;
  }
  const UNDO = { "team-del": `Removed ${a.dataset.v}`, "tick-del": "Removed from ticker", "grp-sym-del": "Removed symbol" };
  if (UNDO[act]) {
    const before = JSON.stringify(cfg);
    queueMicrotask(() => undoToast(UNDO[act], () => { cfg = JSON.parse(before); save(); dirty.add("sports"); dirty.add("markets"); renderSettings(); }));
  }
  switch (act) {
    case "theme": cfg.theme = a.dataset.v; applyTheme(); commit(); renderMore(); break;
    case "sync-on": {
      cfg.sync = { code: newCode(), updatedAt: Date.now() };
      store.set(KEY, JSON.stringify(cfg)); await syncPush(); renderSettings(); toast("Sync is on — use this code on your other devices"); break;
    }
    case "sync-join": {
      const code = cleanCode($("#syncCode").value);
      if (code.length !== 12) { toast("Codes are 12 letters and numbers"); return; }
      try { await syncPull(code, true); afterConfigReplaced(); renderSettings(); toast("Settings synced from your other device"); } catch (e) { toast(e.message); }
      break;
    }
    case "sync-copy": try { await navigator.clipboard.writeText(fmtCode(cfg.sync.code)); toast("Code copied"); } catch { toast(fmtCode(cfg.sync.code)); } break;
    case "sync-link": {
      const link = `${location.origin}/?restore=${fmtCode(cfg.sync.code)}`;
      try { if (navigator.share) await navigator.share({ title: "Restore Daily HQ", url: link }); else { await navigator.clipboard.writeText(link); toast("Restore link copied — open it on your new device"); } } catch { toast(link); }
      break;
    }
    case "sync-off": delete cfg.sync; store.set(KEY, JSON.stringify(cfg)); renderSettings(); toast("Sync turned off on this device"); break;
    case "cal-add": {
      const url = $("#calUrl").value.trim();
      if (!/^(https|webcals?):\/\//i.test(url)) { toast("Paste the private calendar link (starts with https or webcal)"); return; }
      cfg.calendars.push({ name: $("#calName").value.trim() || "Calendar", url, color: CAL_COLORS[cfg.calendars.length % CAL_COLORS.length] });
      commit("calendar"); break;
    }
    case "cal-del": cfg.calendars.splice(i, 1); commit("calendar"); break;
    case "notif-on":
      try { const r = await Notification.requestPermission(); toast(r === "granted" ? "Notifications are on" : "Notifications weren't allowed"); setUnread(unreadCount()); } catch { toast("Notifications aren't available here"); }
      renderSettings(); break;
    case "pt-add": {
      const sym = $("#ptSym").value.trim().toUpperCase(), v = $("#ptVal").value.trim(), dir = $("#ptDir").value;
      if (!sym || !v) { toast("Add a symbol and a price"); return; }
      cfg.alerts.prices.push({ symbol: sym, [dir]: v }); commit("markets"); break;
    }
    case "pt-del": cfg.alerts.prices.splice(i, 1); commit(); break;
    case "textSize": cfg.textSize = a.dataset.v; applyTheme(); commit(); renderMore(); break;
    case "mkview": cfg.markets.view = a.dataset.v; commit(); renderMarkets(); renderMore(); break;
    case "app-move": move(cfg.apps, i, d); commit(); renderApps(); break;
    case "al-mute": { const k = a.dataset.k, m = new Set(cfg.alerts.mute || []); m.has(k) ? m.delete(k) : m.add(k); cfg.alerts.mute = [...m]; commit(); break; }
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
      cfg = clone(DEFAULTS); save(); applyTheme(); dirty.add("layout"); toast("Reset to defaults"); renderSettings();
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
      save(); dirty.add("sports"); queueTeamFeeds();
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
      delete data.news[C[i].id]; C.splice(i, 1); commit("news");
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
      G.splice(i, 1); commit("markets");
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
    case "odds-on": cfg.sports.odds = a.checked; commit("sports"); renderSports(); break;
    case "ex-otd": cfg.extras.onThisDay = a.checked; commit(); renderBrief(); break;
    case "ex-hol": cfg.extras.holidays = a.checked; commit(); renderBrief(); break;
    case "ex-ev": cfg.extras.events = a.checked; commit(); renderBrief(); break;
    case "ex-rad": cfg.extras.radius = +a.value; data.extras.ev = null; commit(); loadExtras(true); break;
    case "cm-on": cfg.commute.on = a.checked; commit(); renderBrief(); break;
    case "cm-arrive": cfg.commute.arrive = a.value || "09:00"; commit(); renderBrief(); break;
    case "al-gameStart": case "al-finals": case "al-weather": case "al-pregame": case "al-rainToday": cfg.alerts[act.slice(3)] = a.checked; commit(); break;
    case "al-eventMins": cfg.alerts.eventMins = +a.value; commit(); break;
    case "al-quiet": cfg.alerts.quiet = { from: 22, to: 7, ...(cfg.alerts.quiet || {}), on: a.checked }; commit(); break;
    case "al-qfrom": cfg.alerts.quiet.from = +a.value; commit(); break;
    case "al-qto": cfg.alerts.quiet.to = +a.value; commit(); break;
    case "al-move": cfg.alerts.movePct = +a.value; commit(); break;
    case "conv-on": cfg.markets.converter = a.checked; commit("markets"); break;
    case "re-on": cfg.markets.realestate = a.checked; commit("markets"); break;
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
  if (a.dataset.bind === "name") { cfg.name = a.value; save(); tickClock(); renameProfileEntry(); }
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
  else if (a.id === "calUrl") $('[data-act="cal-add"]').click();
  else if (a.id === "syncCode") $('[data-act="sync-join"]').click();
  else if (a.id === "ptVal") $('[data-act="pt-add"]').click();
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
const restoreCode = cleanCode(new URLSearchParams(location.search).get("restore"));
if (restoreCode) {
  history.replaceState(null, "", "/");
  syncPull(restoreCode, true)
    .then(() => { closeModal(); afterConfigReplaced(); toast("Welcome back — your settings are restored"); })
    .catch((e) => { toast(`${e.message}. Check the link or enter your code in Customize → General.`); if (cfg.needsSetup) showWelcome(); });
} else if (cfg.needsSetup) showWelcome();
setUnread(unreadCount());
if (location.search.includes("alerts")) { history.replaceState(null, "", "/"); setTimeout(() => toggleBell(true), 300); }
syncPull().then((changed) => { if (changed) { afterConfigReplaced(); toast("Synced your latest settings"); } }).catch(() => {});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPull().then((changed) => changed && afterConfigReplaced()).catch(() => {});
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

// ============================================================ HQ Assistant (free — runs on this device, no AI service)
// Like Alex in Executive Search: launcher bubble, chat, suggestions, task cards and confirm-before-change.
// It understands everyday phrasing for the things Daily HQ knows about and answers from the data on screen.
const AS = { open: false, msgs: [], pending: null, speak: store.get(pkey("dhq-as-speak")) === "1", rec: null, listening: false, teamIdx: null };
const AS_SUGGEST = ["Brief me", "What's on my calendar today?", "Will it rain tomorrow?", "When do my teams play next?", "How are the markets?", "Price of NVDA", "Add lunch with Alex Tue 12:30", "Toronto market", "Mortgage rates", "News about AI", "Follow the Raptors", "Alert me if TSLA drops below 300", "100 USD to CAD", "What can you do?"];

function asInit() {
  if ($("#asLauncher")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <button id="asLauncher" class="as-launcher" aria-label="Open HQ Assistant" title="Ask HQ"><span class="as-av">${ic("sparkles")}</span><span class="as-lbl">Ask HQ</span></button>
    <section id="asPanel" class="as-panel" role="dialog" aria-label="HQ Assistant" hidden>
      <header class="as-head">
        <span class="as-av big">${ic("sparkles")}</span>
        <div class="as-id"><b>HQ Assistant</b><small>Free · runs on your device · type or talk</small></div>
        <div class="as-acts">
          <button class="icon-btn sm" data-as="speak" title="Read answers aloud" aria-pressed="${AS.speak}">${ic(AS.speak ? "volume-2" : "volume-x")}</button>
          <button class="icon-btn sm" data-as="new" title="New chat">${ic("rotate-ccw")}</button>
          <button class="icon-btn sm" data-as="close" aria-label="Close">${ic("x")}</button>
        </div>
      </header>
      <div class="as-msgs" id="asMsgs" aria-live="polite"></div>
      <details class="as-sugg" id="asSugg" open><summary>Try asking</summary><div class="as-chips">${AS_SUGGEST.map((s) => `<button data-as-q="${esc(s)}">${esc(s)}</button>`).join("")}</div></details>
      <form class="as-compose" id="asForm">
        <button type="button" class="as-mic" data-as="mic" aria-label="Speak">${ic("mic")}</button>
        <input id="asInput" placeholder="Ask or tell me to do something…" autocomplete="off" enterkeyhint="send">
        <button class="as-send" aria-label="Send">${ic("send")}</button>
      </form>
    </section>`);
  $("#asLauncher").onclick = () => asToggle(true);
  $("#asForm").onsubmit = (e) => { e.preventDefault(); const v = $("#asInput").value.trim(); if (v) { $("#asInput").value = ""; asAsk(v); } };
  $("#asPanel").addEventListener("click", asClick);
  $("#asPanel").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); asToggle(false); } });
}
function asToggle(open) {
  AS.open = open;
  $("#asPanel").hidden = !open;
  $("#asLauncher").hidden = open;
  if (open) {
    if (!AS.msgs.length) asGreet();
    asRender();
    setTimeout(() => $("#asInput")?.focus(), 50);
  } else { asStopMic(); try { speechSynthesis.cancel(); } catch {} }
}
function asGreet() {
  const h = new Date().getHours();
  const part = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  asSay(`Good ${part}${cfg.name ? `, ${esc(cfg.name.split(" ")[0])}` : ""}. I can brief you, answer questions about your scores, calendar, weather, markets, news and real estate, and make changes for you — I'll always check before changing anything.`, { quiet: true });
}
function asSay(html, opts = {}) {
  AS.msgs.push({ who: "hq", html, cards: opts.cards || "", actions: opts.actions || [] });
  asRender();
  if (AS.speak && !opts.quiet) asSpeak(opts.spoken || html);
}
function asRender() {
  const box = $("#asMsgs");
  if (!box) return;
  box.innerHTML = AS.msgs.map((m, i) => m.who === "me"
    ? `<div class="as-msg me">${esc(m.text)}</div>`
    : `<div class="as-msg hq"><div>${m.html}</div>${m.cards ? `<div class="as-cards">${m.cards}</div>` : ""}${m.actions.length ? `<div class="as-btns">${m.actions.map((a, k) => `<button class="btn sm ${a.primary ? "primary" : ""}" data-as-act="${i}:${k}" ${m.done ? "disabled" : ""}>${a.icon ? ic(a.icon) + " " : ""}${esc(a.label)}</button>`).join("")}</div>` : ""}</div>`).join("");
  box.scrollTop = box.scrollHeight;
}
function asClick(e) {
  const t = e.target;
  const q = t.closest("[data-as-q]");
  if (q) { $("#asSugg").open = false; asAsk(q.dataset.asQ); return; }
  const a = t.closest("[data-as-act]");
  if (a) {
    const [i, k] = a.dataset.asAct.split(":").map(Number);
    const m = AS.msgs[i], act = m?.actions[k];
    if (!act || m.done) return;
    if (act.once !== false) m.done = true;
    if (act.confirm) AS.pending = null;
    act.run();
    asRender();
    return;
  }
  const b = t.closest("[data-as]");
  if (!b) return;
  if (b.dataset.as === "close") asToggle(false);
  else if (b.dataset.as === "new") { AS.msgs = []; AS.pending = null; asGreet(); asRender(); $("#asSugg").open = true; }
  else if (b.dataset.as === "speak") {
    AS.speak = !AS.speak; store.set(pkey("dhq-as-speak"), AS.speak ? "1" : "0");
    b.innerHTML = ic(AS.speak ? "volume-2" : "volume-x"); b.setAttribute("aria-pressed", AS.speak);
    if (!AS.speak) try { speechSynthesis.cancel(); } catch {}
    toast(AS.speak ? "I'll read answers aloud" : "Read-aloud off");
  } else if (b.dataset.as === "mic") asMic();
}

// ---------- voice: speech-to-text and read-aloud (built into the browser, free)
function asMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { $("#asInput").focus(); toast("Tap the 🎤 on your keyboard to dictate"); return; }
  if (AS.listening) { asStopMic(); return; }
  try {
    const r = new SR();
    r.lang = navigator.language || "en-US"; r.interimResults = true; r.continuous = false;
    let final = "";
    r.onresult = (ev) => { let txt = ""; for (const res of ev.results) txt += res[0].transcript; $("#asInput").value = txt; if (ev.results[ev.results.length - 1].isFinal) final = txt; };
    r.onerror = (ev) => { asStopMic(); if (ev.error === "not-allowed" || ev.error === "service-not-allowed") toast("Microphone blocked — allow it in Settings, or use the keyboard 🎤"); };
    r.onend = () => { const v = (final || $("#asInput").value).trim(); asStopMic(); if (v) { $("#asInput").value = ""; asAsk(v); } };
    AS.rec = r; AS.listening = true; $("#asPanel").classList.add("listening");
    $("#asInput").placeholder = "Listening…";
    r.start();
  } catch { asStopMic(); $("#asInput").focus(); toast("Tap the 🎤 on your keyboard to dictate"); }
}
function asStopMic() {
  AS.listening = false; $("#asPanel")?.classList.remove("listening");
  if ($("#asInput")) $("#asInput").placeholder = "Ask or tell me to do something…";
  try { AS.rec?.stop(); } catch {} AS.rec = null;
}
function asSpeak(html) {
  try {
    const d = document.createElement("div"); d.innerHTML = html;
    const text = (d.textContent || "").replace(/\s+/g, " ").replace(/·/g, ",").trim();
    if (!text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 900));
    u.rate = 1.03;
    speechSynthesis.speak(u);
  } catch {}
}

// ---------- understanding
const AS_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
function asDay(q) {
  const t = sod(new Date());
  if (/\btomorrow\b/.test(q)) return plusDays(t, 1);
  if (/\byesterday\b/.test(q)) return plusDays(t, -1);
  const m = q.match(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/);
  if (m) { const k = AS_DAYS.findIndex((d) => d.startsWith(m[1])); let add = (k - t.getDay() + 7) % 7; if (/\bnext\b/.test(q) && add === 0) add = 7; return plusDays(t, add); }
  return t;
}
const asYes = (q) => /^(yes|yeah|yep|sure|ok|okay|do it|go ahead|confirm|please do)\b/.test(q);
const asNo = (q) => /^(no|nope|cancel|stop|never ?mind|don'?t)\b/.test(q);

async function asAsk(text) {
  AS.msgs.forEach((m) => { if (m.actions?.some((a) => a.confirm) && !(asYes(text.toLowerCase()) || asNo(text.toLowerCase()))) m.done = true; });
  AS.msgs.push({ who: "me", text });
  asRender();
  const q = text.toLowerCase().replace(/[’']/g, "'").replace(/[?!.]+$/g, "").trim();
  try {
    if (AS.pending && asYes(q)) { const p = AS.pending; AS.pending = null; AS.msgs.forEach((m) => (m.done = true)); p(); return; }
    if (AS.pending && asNo(q)) { AS.pending = null; AS.msgs.forEach((m) => (m.done = true)); asSay("Okay, cancelled — nothing changed."); return; }
    AS.pending = null;
    for (const [re, fn, opt] of AS_INTENTS) { const m = q.match(re); if (m) { await fn(q, m, text); if (opt?.news) await asRelatedNews(q); return; } }
    await asFallback(q, text);
  } catch (e) { asSay(`Sorry, that didn't work: ${esc(e.message || "please try again")}.`); }
}
function asConfirm(html, label, run, icon = "check") {
  AS.pending = run;
  asSay(`${html}<br><small class="as-hint">Say or tap <b>Yes</b> to go ahead, or <b>Cancel</b>.</small>`, { actions: [{ label, icon, primary: true, confirm: true, run }, { label: "Cancel", confirm: true, run: () => asSay("Okay, nothing changed.") }] });
}
const asOpen = (id, label) => ({ label: label || `Open ${id[0].toUpperCase() + id.slice(1)}`, icon: "arrow-right", once: false, run: () => { asToggle(false); goToSection(id, "HQ Assistant"); } });

// ---------- intents (order matters: specific first)
const AS_INTENTS = [
  [/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b(?!.*\b(brief|weather|game|score)\b)/, () => asSay(`Hi${cfg.name ? ` ${esc(cfg.name.split(" ")[0])}` : ""}! Ask me for your brief, a score, the weather, a stock price — or tell me to add an event.`)],
  [/^(help|what can you do|what do you do|commands|how do (i|you) use)/, () => asHelp()],
  [/\b(brief|briefing|catch me up|what('s| is) (my day|happening|up today)|morning report|summary of (today|my day))\b/, () => asBrief()],
  [/^(open|show|go to|take me to)( the| my)? (scores|sports|weather|news|markets?|calendar|brief|settings|customize|alerts|apps)\b/, (q, m) => asNavigate(m[3])],
  [/\b(\d+(?:[.,]\d+)?)\s*(usd|us dollars?|cad|canadian dollars?|dollars?)\s*(to|in|into)\s*(usd|us dollars?|cad|canadian)\b/, (q, m) => asConvert(m)],
  [/\b(alert|notify|tell) me (if|when) ([a-z.^=-]{1,10}) (goes |drops |falls |rises |gets |is )?(above|over|below|under) \$?(\d+(?:\.\d+)?)/, (q, m) => asPriceAlert(m)],
  [/^(add|put|schedule|book|remind me|create|new event)\b(?!.*\b(to|on) (my )?(weather|watchlist|ticker|board|markets?)\b)(?!.*\bcity\b)/, (q, m, t) => asAddEvent(t)],
  [/\b(add|follow|track|watch)( the)? (.+?)( to (my )?(teams|sports))?$/, async (q, m) => { if (/\b(weather|city)\b/.test(q)) return asAddCity(q); if (/\b(watchlist|ticker|stock|board|markets?)\b/.test(q)) return asAddStock(q); if (!(await asFollow(m[3]))) await asFallback(q); }],
  [/\b(unfollow|stop following)( the)? (.+)$/, (q, m) => asUnfollow(m[3])],
  [/\b(calendar|schedule|agenda|meetings?|events?|appointments?|busy|free)\b|\bwhat('s| is| do i have) (on )?(today|tomorrow|this|next)\b/, (q) => asCalendar(q)],
  [/\b(weather|rain|snow|umbrella|jacket|cold|hot|warm|temperature|forecast|sunny|storm|wind|aqi|air quality|uv)\b/, (q) => asWeather(q)],
  [/\b(mortgage|rates?|prime rate|bank of canada|fed rate|stress test)\b(?!.*\bstock\b)/, (q) => asRates(q), { news: true }],
  [/\b(housing|real estate|home prices?|market report|benchmark|listings)\b|\b(\w+) (housing )?market$/, (q, m) => asRealEstate(q), { news: true }],
  [/\bstandings?\b|\btable\b/, (q) => asStandings(q), { news: true }],
  [/\b(score|play|playing|game|games|won|win|lose|lost|beat|match|next game|tonight|schedule)\b/, (q) => asSports(q), { news: true }],
  [/\b(markets?|stocks?|dow|nasdaq|s&p|tsx|price of|how('s| is) [a-z.]+ (doing|trading)|quote)\b|^[a-z.^=-]{1,6} (price|stock|quote)$|^\$?[a-z]{1,5}$/, (q) => asMarkets(q), { news: true }],
  [/\b(news|headlines?|stories|articles?|latest on|what's new with)\b/, (q) => asNews(q)],
  [/\b(time|date|day is it)\b/, () => asSay(`It's ${new Date().toLocaleString([], { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}.`)],
  [/\b(thank|thanks|cheers)\b/, () => asSay("Anytime! 👍")],
];

function asHelp() {
  asSay(`Here's what I can do — just type or tap the mic:
    <ul class="as-list">
      <li><b>Brief me</b> — weather, today's events, your games and markets</li>
      <li><b>Calendar</b> — "What's on tomorrow?", "Next meeting", "Add dentist Nov 12 3pm"</li>
      <li><b>Sports</b> — "Did my team win?", "When does Toronto play next?", "NHL standings", "Follow the Yankees"</li>
      <li><b>Weather</b> — "Will it rain tomorrow?", "Weather in Toronto", "Add Ottawa to weather"</li>
      <li><b>Markets</b> — "How are the markets?", "Price of NVDA", "Add AAPL to my watchlist", "Alert me if TSLA drops below 300", "100 USD to CAD"</li>
      <li><b>Real estate</b> — "Toronto market", "Mortgage rates", "Payment on 900k with 20% down"</li>
      <li><b>News</b> — "Headlines", "News about the Fed", or just ask about anything ("What's going on with Nvidia?") — I search every news tab for matching stories</li>
      <li><b>Go places</b> — "Open markets", "Open settings"</li>
    </ul>I'll always ask before I change anything.`);
}
function asNavigate(where) {
  const map = { scores: "sports", sports: "sports", weather: "weather", news: "news", market: "markets", markets: "markets", calendar: "calendar", brief: "brief" };
  if (/settings|customize/.test(where)) { asToggle(false); openSettings(); return; }
  if (/alerts/.test(where)) { asToggle(false); toggleBell(true); return; }
  if (/apps/.test(where)) { asToggle(false); matchMedia("(max-width: 680px)").matches ? setView("more") : $("#appsBtn")?.click(); return; }
  const id = map[where];
  asSay(`Opening ${esc(where)}…`, { quiet: true });
  setTimeout(() => { asToggle(false); goToSection(id, "HQ Assistant"); }, 250);
}

// brief
function asBrief() {
  const parts = [];
  const w = data.weather?.find((x) => x.d);
  if (w) { const c = w.d.current, d = w.d.daily; parts.push(`It's <b>${Math.round(c.temperature_2m)}°</b> and ${esc(wmo(c.weather_code)[1].toLowerCase())} in ${esc(w.c.name.split(",")[0])}, with a high of ${Math.round(d.temperature_2m_max[0])}° and low of ${Math.round(d.temperature_2m_min[0])}°${d.precipitation_probability_max?.[0] >= 40 ? ` — <b>${d.precipitation_probability_max[0]}% chance of rain</b>, bring an umbrella` : ""}.`); }
  const al = (data.weather || []).flatMap((x) => (x.alerts || []).map((a) => `${a.event} for ${x.c.name.split(",")[0]}`));
  if (al.length) parts.push(`⚠️ ${esc(al.slice(0, 2).join("; "))}.`);
  const now = new Date(), end = sod(plusDays(now, 1));
  const evs = calEventsBetween(now, end, false).filter((e) => e.end > now);
  if (evs.length) { const n = evs.find((e) => !e.allDay); parts.push(`You have <b>${evs.length} event${evs.length > 1 ? "s" : ""}</b> left today${n ? ` — next is <b>${esc(n.title || "Busy")}</b> at ${hm(n.start)}` : ""}.`); }
  else if ((cfg.calendars || []).length || (cfg.events || []).length) parts.push("Nothing else on your calendar today.");
  const games = asMyGames();
  const live = games.filter((x) => x.e.state === "in"), recent = games.filter((x) => x.e.state === "post" && Date.now() - new Date(x.e.date) < 30 * 3600e3), tonight = games.filter((x) => x.e.state === "pre" && sameDay(new Date(x.e.date), now));
  const gl = [...live, ...recent, ...tonight].slice(0, 4);
  if (gl.length) parts.push(gl.map(({ e }) => asGameLine(e)).join(" "));
  const sp = data.quotes?.["^GSPC"], tsx = data.quotes?.["^GSPTSE"];
  if (sp && !sp.error) parts.push(`The S&amp;P 500 is ${sp.pct >= 0 ? "up" : "down"} <b>${fmtNum(Math.abs(sp.pct), 2)}%</b>${tsx && !tsx.error ? ` and the TSX is ${tsx.pct >= 0 ? "up" : "down"} ${fmtNum(Math.abs(tsx.pct), 2)}%` : ""}${marketOpen() ? "" : " (markets closed)"}.`);
  asSay(parts.length ? parts.join("<br><br>") : "I don't have much loaded yet — give it a few seconds and ask again.", { cards: gl.map(({ e, L }) => asGameCard(e, L)).join(""), actions: [asOpen("brief", "Open Your brief")] });
}

// calendar
function asCalendar(q) {
  const now = new Date();
  if (/\bnext (meeting|event|appointment)\b|\bwhen is my next\b/.test(q)) {
    const n = calEventsBetween(now, plusDays(now, 30)).find((e) => !e.allDay && e.start > now && !e.game);
    if (!n) return asSay("I don't see anything coming up in the next 30 days.");
    calUI.list = [n];
    return asSay(`Your next event is <b>${esc(n.title || "Busy")}</b> — ${esc(calDayLabel(n.start))} at ${hm(n.start)} (${untilText(n.start - now)})${placeOf(n) ? `, at ${esc(placeOf(n))}` : ""}.`, { actions: [{ label: "Details", icon: "calendar-days", once: false, run: () => showEvent(n) }, ...(joinLink(n) ? [{ label: "Join", icon: "video", once: false, run: () => window.open(joinLink(n), "_blank") }] : [])] });
  }
  const day = asDay(q), evs = calEventsBetween(day, plusDays(day, 1), false);
  const lbl = calDayLabel(day);
  if (!(cfg.calendars || []).length && !(cfg.events || []).length) return asSay(`Your calendar is empty. Say "Add lunch with Alex Tuesday 12:30", or connect Outlook/Google in Customize → Calendar.`, { actions: [{ label: "Connect a calendar", icon: "link", run: () => { asToggle(false); openSettings("calendar"); } }] });
  if (!evs.length) return asSay(`Nothing on your calendar ${lbl === "Today" || lbl === "Tomorrow" ? lbl.toLowerCase() : `on ${esc(lbl)}`}. 🎉`);
  const list = evs.map((e) => `<li><b>${e.allDay ? "All day" : hm(e.start)}</b> — ${esc(e.title || "Busy")}${placeOf(e) ? ` <small>· ${esc(placeOf(e))}</small>` : ""}</li>`).join("");
  asSay(`${esc(lbl)} you have <b>${evs.length}</b> event${evs.length > 1 ? "s" : ""}:<ul class="as-list">${list}</ul>`, { actions: [{ label: "Open Calendar", icon: "calendar-days", once: false, run: () => { calUI.sel = day; calUI.month = new Date(day.getFullYear(), day.getMonth(), 1); renderCalendar(); asToggle(false); goToSection("calendar", "HQ Assistant"); } }] });
}
function asAddEvent(text) {
  const clean = text.replace(/^(please )?(add|put|schedule|book|create|new event|remind me( to| about)?)\s+(an? )?(event |meeting |appointment )?(called |for )?/i, "").replace(/\s+(to|on|in) my calendar\b/i, "").trim();
  if (!clean) return asSay(`What should I add? For example: "Add dentist Nov 12 3pm".`);
  const p = parseQuick(clean, sod(new Date()));
  p.title = p.title.charAt(0).toUpperCase() + p.title.slice(1);
  const when = p.allDay ? `${calDayLabel(p.start)} (all day)` : `${calDayLabel(p.start)} at ${hm(p.start)}–${hm(p.end)}`;
  asConfirm(`Add <b>${esc(p.title)}</b> on ${esc(when)} to your Daily HQ calendar?`, "Add event", () => {
    const ev = { id: `l${Date.now().toString(36)}`, title: p.title, start: p.start.toISOString(), end: p.end.toISOString(), allDay: p.allDay, location: "", notes: "" };
    addLocalEvent(ev);
    asSay(`Added <b>${esc(ev.title)}</b>. Want it in Outlook, Google or your iPhone calendar too?`, { actions: [{ label: "Send to my calendar", icon: "calendar-plus", once: false, run: () => showEvent(ev, true) }] });
  }, "calendar-plus");
}

// weather
function asWeather(q) {
  const ws = (data.weather || []).filter((x) => x.d);
  if (/\badd\b/.test(q) && /\b(weather|city)\b/.test(q)) return asAddCity(q);
  if (!ws.length) return asSay(`You don't have a weather city yet. Say "Add Chicago to weather", or add your city in Customize → Weather.`);
  const w = ws.find((x) => q.includes(x.c.name.split(",")[0].toLowerCase())) || ws[0];
  const day = asDay(q), i = Math.max(0, Math.round((day - sod(new Date())) / 864e5));
  const d = w.d.daily, c = w.d.current, city = esc(w.c.name.split(",")[0]);
  if (/\b(aqi|air quality)\b/.test(q)) return asSay(w.aqi != null ? `Air quality in ${city} is <b>${w.aqi}</b> — ${esc(aqiLabel(w.aqi))}.` : `I don't have air quality for ${city} right now.`);
  if (/\buv\b/.test(q)) return asSay(d.uv_index_max ? `Today's UV index in ${city} peaks at <b>${Math.round(d.uv_index_max[0])}</b> (${esc(uvLabel(d.uv_index_max[0]))}).` : "UV isn't available right now.");
  if (/\b(this week|week|7 day|next few days|weekend)\b/.test(q)) {
    const rows = d.time.slice(0, 7).map((t, k) => `<li><b>${k ? new Date(t + "T12:00").toLocaleDateString([], { weekday: "short" }) : "Today"}</b> ${wmo(d.weather_code[k])[0]} ${Math.round(d.temperature_2m_max[k])}° / ${Math.round(d.temperature_2m_min[k])}°${d.precipitation_probability_max?.[k] >= 30 ? ` · ${d.precipitation_probability_max[k]}% rain` : ""}</li>`).join("");
    return asSay(`The week ahead in ${city}:<ul class="as-list as-wx">${rows}</ul>`, { actions: [asOpen("weather")] });
  }
  if (i >= d.time.length) return asSay(`I only have the forecast for the next ${d.time.length} days.`);
  const pop = d.precipitation_probability_max?.[i] ?? 0, hi = Math.round(d.temperature_2m_max[i]), lo = Math.round(d.temperature_2m_min[i]);
  const desc = wmo(d.weather_code[i])[1].toLowerCase();
  let ans = i === 0 ? `Right now it's <b>${Math.round(c.temperature_2m)}°</b> and ${esc(wmo(c.weather_code)[1].toLowerCase())} in ${city} (feels like ${Math.round(c.apparent_temperature)}°). Today: high ${hi}°, low ${lo}°.` : `${esc(calDayLabel(day))} in ${city}: ${esc(desc)}, high <b>${hi}°</b>, low ${lo}°.`;
  if (/\b(rain|umbrella|wet|shower)\b/.test(q)) ans += pop >= 50 ? ` <b>Yes — ${pop}% chance of rain</b>, take an umbrella. ☔` : pop >= 25 ? ` Maybe — ${pop}% chance of rain.` : ` Rain is unlikely (${pop}%).`;
  else if (/\bsnow\b/.test(q)) ans += /snow/.test(desc) ? " ❄️ Snow is in the forecast." : " No snow in the forecast.";
  else if (/\b(jacket|coat|cold|warm|hot)\b/.test(q)) { const f = cfg.units === "C" ? lo : (lo - 32) * 5 / 9; ans += f < 5 ? " 🧥 Bundle up — it's cold." : f < 14 ? " A jacket is a good idea." : " No jacket needed."; }
  else if (pop >= 40) ans += ` ${pop}% chance of rain.`;
  if (w.alerts?.length) ans += `<br>⚠️ <b>${esc(w.alerts[0].event)}</b> in effect.`;
  asSay(ans, { actions: [asOpen("weather")] });
}
async function asAddCity(q) {
  const name = q.replace(/\b(please|add|put|track|follow|watch|the|city|of|to|my|weather|forecast|for|in)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!name) return asSay(`Which city? For example: "Add Ottawa to weather".`);
  const d = await api(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=3&language=en`);
  const r = (d.results || [])[0];
  if (!r) return asSay(`I couldn't find a city called "${esc(name)}".`);
  const region = r.country_code === "US" || r.country_code === "CA" ? abbrevRegion(r.admin1) : r.country;
  const label2 = [r.name, region].filter(Boolean).join(", ");
  if (cfg.weather.cities.some((c) => c.name === label2)) return asSay(`${esc(label2)} is already in your weather.`);
  asConfirm(`Add <b>${esc(label2)}</b> to your weather?`, "Add city", () => {
    cfg.weather.cities.push({ name: label2, lat: r.latitude, lon: r.longitude }); save(); data.weather = []; refresh(["weather"]);
    asSay(`Added ${esc(label2)}. The forecast will appear in Weather in a moment.`, { actions: [asOpen("weather")] });
  }, "map-pin");
}

// sports
function asMyGames() { return (data.sports || []).flatMap(({ L, events }) => (events || []).filter((e) => e.teams && isMine(L, e)).map((e) => ({ e, L }))); }
function asGameLine(e) {
  const [a, b] = [e.teams.find((t) => t.homeAway === "away"), e.teams.find((t) => t.homeAway === "home")];
  if (!a || !b) return "";
  if (e.state === "in") return `🔴 <b>${esc(a.name)} ${esc(a.score)}, ${esc(b.name)} ${esc(b.score)}</b> (${esc(e.detail)}).`;
  if (e.state === "post") { const [W, Lo] = +a.score > +b.score ? [a, b] : [b, a]; return `The <b>${esc(W.name)}</b> beat the ${esc(Lo.name)} ${esc(W.score)}–${esc(Lo.score)}${/OT|SO/.test(e.detail) ? ` (${esc(e.detail.replace(/^Final\/?/, ""))})` : ""}.`; }
  return `${esc(a.name)} at ${esc(b.name)} ${esc(when(e.date))}${e.broadcasts?.length ? ` on ${esc(e.broadcasts[0])}` : ""}.`;
}
function asGameCard(e, L) { return e.golf || e.cricket ? "" : gameHTML(e, L.teams || []).replace('class="game', `data-game="${esc(e.id)}" data-path="${esc(LEAGUES[L.key]?.path || "")}" class="game`); }
function asFindTeams(q) {
  const words = q.replace(/\b(the|did|do|does|when|what|is|are|was|were|score|play|playing|game|games|next|tonight|today|tomorrow|win|won|lose|lost|beat|match|of|in|my|team|teams|how|last|night|yesterday|time|at|vs|versus|and|against|who)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!words) return [];
  const hits = [];
  for (const { L, events } of data.sports || []) for (const e of events || []) for (const t of e.teams || []) {
    const names = [t.name, t.abbr, t.full].filter(Boolean).map((x) => x.toLowerCase());
    if (names.some((n) => n === words || (words.length > 3 && (n.includes(words) || words.includes(n) && n.length > 3)))) hits.push({ e, L, t });
  }
  return hits;
}
function asSports(q) {
  const hits = asFindTeams(q);
  const myQ = /\b(my teams?|our)\b/.test(q) || !hits.length;
  const now = Date.now();
  let pool = myQ ? asMyGames() : hits.map(({ e, L }) => ({ e, L }));
  pool = pool.filter((x, i, arr) => arr.findIndex((y) => y.e.id === x.e.id) === i);
  if (!pool.length) {
    if (!myQ) return;
    return asSay(`I don't see games for your teams in the past or next week. You can follow teams with "Follow the Raptors".`);
  }
  let pick;
  if (/\b(next|when|tonight|tomorrow|play)\b/.test(q) && !/\b(won|win|lose|lost|beat|score)\b/.test(q)) pick = pool.filter((x) => x.e.state !== "post").sort((a, b) => new Date(a.e.date) - new Date(b.e.date));
  else if (/\b(won|win|lose|lost|beat|last|yesterday|score|result)\b/.test(q)) pick = [...pool.filter((x) => x.e.state === "in"), ...pool.filter((x) => x.e.state === "post").sort((a, b) => new Date(b.e.date) - new Date(a.e.date))];
  else pick = [...pool.filter((x) => x.e.state === "in"), ...pool.filter((x) => x.e.state === "post" && now - new Date(x.e.date) < 36e5 * 36), ...pool.filter((x) => x.e.state === "pre").sort((a, b) => new Date(a.e.date) - new Date(b.e.date))];
  if (!myQ) { const seen = new Set(); pick = pick.filter((x) => { const k = x.e.teams.find((t) => hits.some((h) => h.t.abbr === t.abbr && h.e.id === x.e.id))?.abbr; if (seen.has(k)) return false; seen.add(k); return true; }); }
  pick = pick.slice(0, myQ ? 4 : 2);
  if (!pick.length) return asSay("No games found for that.");
  asSay(pick.map(({ e }) => asGameLine(e)).join(" "), { cards: pick.map(({ e, L }) => asGameCard(e, L)).join(""), actions: [asOpen("sports", "Open Scores")] });
}
function asStandings(q) {
  const key = Object.keys(LEAGUES).find((k) => q.includes(k) || q.includes(LEAGUES[k].name.toLowerCase())) || cfg.sports.leagues.find((l) => !LEAGUES[l.key]?.kind)?.key;
  if (!key || LEAGUES[key].kind) return asSay(`Which league? For example "NHL standings".`);
  asSay(`Opening ${esc(LEAGUES[key].name)} standings…`, { quiet: true });
  showStandings(key);
}
async function asTeamIndex() {
  if (AS.teamIdx) return AS.teamIdx;
  const keys = Object.keys(LEAGUES).filter((k) => !LEAGUES[k].kind);
  const lists = await Promise.all(keys.map(async (k) => { try { return (await fetchTeams(LEAGUES[k].path)).map((t) => ({ ...t, key: k })); } catch { return []; } }));
  return (AS.teamIdx = lists.flat());
}
async function asFollow(name) {
  name = name.replace(/\b(team|please|to my teams|the)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length < 2) return false;
  const idx = await asTeamIndex();
  const n = name.toLowerCase();
  const cands = idx.filter((t) => [t.name, t.short, t.abbr].filter(Boolean).some((x) => x.toLowerCase() === n || (n.length > 3 && x.toLowerCase().includes(n))));
  if (!cands.length) return false;
  const leagueHint = Object.keys(LEAGUES).find((k) => n.includes(k));
  const t = cands.find((c) => c.key === leagueHint) || cands.find((c) => cfg.sports.leagues.some((l) => l.key === c.key)) || cands[0];
  const L = cfg.sports.leagues.find((l) => l.key === t.key);
  if (L?.teams?.includes(t.abbr)) { asSay(`You already follow the ${esc(t.name)}.`); return true; }
  asConfirm(`Follow the <b>${esc(t.name)}</b> (${esc(LEAGUES[t.key].name)})?${L ? "" : ` I'll add ${esc(LEAGUES[t.key].name)} to your leagues too.`}`, "Follow", () => {
    let lg = cfg.sports.leagues.find((l) => l.key === t.key);
    if (!lg) { lg = { key: t.key, teams: [], showAll: false }; cfg.sports.leagues.push(lg); }
    lg.teams = [...(lg.teams || []), t.abbr];
    save(); refresh(["sports"]); queueTeamFeeds();
    asSay(`Done — you're following the ${esc(t.name)}. Their games will show in Scores and Your brief.`, { actions: [asOpen("sports", "Open Scores")] });
  }, "plus");
  return true;
}
function asUnfollow(name) {
  const n = name.toLowerCase().replace(/^the /, "");
  for (const L of cfg.sports.leagues) {
    const ab = (L.teams || []).find((a) => a.toLowerCase() === n) || (L.teams || []).find((a) => (data.sports || []).some(({ events }) => (events || []).some((e) => (e.teams || []).some((t) => t.abbr === a && (t.name || "").toLowerCase().includes(n)))));
    if (ab) return asConfirm(`Stop following <b>${esc(ab)}</b> in ${esc(LEAGUES[L.key].name)}?`, "Unfollow", () => { L.teams = L.teams.filter((x) => x !== ab); save(); refresh(["sports"]); asSay(`Unfollowed ${esc(ab)}.`); }, "x");
  }
  asSay(`I couldn't find "${esc(name)}" among the teams you follow.`);
}

// markets
const AS_INDEX = { "s&p": "^GSPC", "s&p 500": "^GSPC", sp500: "^GSPC", dow: "^DJI", "dow jones": "^DJI", nasdaq: "^IXIC", tsx: "^GSPTSE", "russell": "^RUT", vix: "^VIX", gold: "GC=F", oil: "CL=F", bitcoin: "BTC-USD", btc: "BTC-USD", ethereum: "ETH-USD", "loonie": "CAD=X", "canadian dollar": "CAD=X" };
async function asQuote(sym) {
  if (data.quotes?.[sym] && !data.quotes[sym].error) return data.quotes[sym];
  const d = await api(`/api/quotes?s=${encodeURIComponent(sym)}`);
  const q = d.quotes?.[0];
  if (q && !q.error) { data.quotes[q.symbol] = q; return q; }
  return null;
}
async function asSymbolFrom(q) {
  for (const [k, v] of Object.entries(AS_INDEX)) if (new RegExp(`\\b${k.replace(/[&^$.]/g, "\\$&")}\\b`).test(q)) return v;
  const m = q.match(/\$([a-z.]{1,8})\b/) || q.match(/\b(?:price of|quote for|quote|how(?:'s| is)|is)\s+([a-z.^=-]{1,10})\b/) || q.match(/^([a-z.^=-]{1,6})(?: (?:price|stock|quote))?$/) || q.match(/\b([a-z.]{1,6}) (?:price|stock|shares|quote)\b/);
  if (m && !/^(the|a|my|stock|market|markets|doing|it)$/.test(m[1])) return m[1].toUpperCase();
  const name = q.replace(/\b(price|of|quote|stock|shares|how|is|doing|trading|today|the|what's|whats|what|for)\b/g, " ").trim();
  if (name.length > 2) { try { const s = await api(`/api/quotes?search=${encodeURIComponent(name)}`); return s.results?.[0]?.symbol || s.quotes?.[0]?.symbol || null; } catch {} }
  return null;
}
async function asMarkets(q) {
  if (/\b(markets?|stocks?) (today|doing)\b|^how (are|is) (the )?(markets?|stocks?)|^markets?$|\bmarket (update|summary)\b/.test(q)) {
    const syms = ["^GSPC", "^DJI", "^IXIC", "^GSPTSE"];
    const qs = (await Promise.all(syms.map((s) => asQuote(s).catch(() => null)))).filter(Boolean);
    if (!qs.length) return asSay("Market data isn't loaded yet — try again in a moment.");
    const line = qs.map((x) => `${esc(label(x.symbol))} <b class="${x.pct >= 0 ? "up" : "down"}">${x.pct >= 0 ? "▲" : "▼"} ${fmtNum(Math.abs(x.pct), 2)}%</b>`).join(" · ");
    const movers = cfg.markets.groups.flatMap((g) => g.symbols).map((s) => data.quotes[s]).filter((x) => x && !x.error && x.pct != null && !/^\^/.test(x.symbol)).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 3);
    return asSay(`${marketOpen() ? "Markets right now" : "At the last close"}: ${line}.${movers.length ? `<br>Biggest movers on your boards: ${movers.map((x) => `${esc(label(x.symbol))} ${x.pct >= 0 ? "+" : "−"}${fmtNum(Math.abs(x.pct), 1)}%`).join(", ")}.` : ""}`, { actions: [asOpen("markets")] });
  }
  const sym = await asSymbolFrom(q);
  if (!sym) return asFallback(q);
  const x = await asQuote(sym);
  if (!x) return asSay(`I couldn't find a quote for "${esc(sym)}".`);
  const onBoard = cfg.markets.groups.some((g) => g.symbols.includes(x.symbol));
  asSay(`<b>${esc(x.name || label(x.symbol))}</b> (${esc(label(x.symbol))}) is at <b>${fmtNum(x.price, priceDigits(x.price))}</b>, ${x.pct >= 0 ? "up" : "down"} <b class="${x.pct >= 0 ? "up" : "down"}">${fmtNum(Math.abs(x.pct), 2)}%</b> today${marketOpen() ? "" : " (last close)"}.`, { cards: quoteTile(x.symbol), actions: [...(onBoard ? [] : [{ label: "Add to my board", icon: "plus", run: () => asAddStock(`add ${x.symbol}`) }]), { label: "Set a price alert", icon: "bell", once: false, run: () => { $("#asInput").value = `Alert me if ${label(x.symbol)} drops below ${Math.round(x.price * 0.95)}`; $("#asInput").focus(); } }] });
}
async function asAddStock(q) {
  const sym = await asSymbolFrom(q.replace(/\b(add|to|my|watchlist|ticker|board|markets?|please|put|on)\b/g, " ").replace(/\s+/g, " ").trim());
  if (!sym) return asSay(`Which stock? For example "Add AAPL to my watchlist".`);
  const x = await asQuote(sym);
  if (!x) return asSay(`I couldn't find "${esc(sym)}".`);
  const G = cfg.markets.groups;
  const g = G.find((gr) => /watch|stocks|compan/i.test(gr.name)) || G[G.length - 1];
  if (!g) return asSay("You don't have a market board yet — create one in Customize → Markets.");
  if (g.symbols.includes(x.symbol)) return asSay(`${esc(label(x.symbol))} is already on your ${esc(g.name)} board.`);
  asConfirm(`Add <b>${esc(x.name || x.symbol)}</b> (${esc(x.symbol)}) to your <b>${esc(g.name)}</b> board?`, "Add", () => { g.symbols.push(x.symbol); save(); refresh(["markets"]); asSay(`Added ${esc(label(x.symbol))} to ${esc(g.name)}.`, { actions: [asOpen("markets")] }); }, "plus");
}
async function asPriceAlert(m) {
  const sym = (await asSymbolFrom(m[3])) || m[3].toUpperCase();
  const x = await asQuote(sym);
  if (!x) return asSay(`I couldn't find "${esc(m[3])}".`);
  const dir = /above|over/.test(m[5]) ? "above" : "below", v = +m[6];
  asConfirm(`Alert you when <b>${esc(label(x.symbol))}</b> goes <b>${dir} ${fmtNum(v, 2)}</b>? It's at ${fmtNum(x.price, priceDigits(x.price))} now.`, "Set alert", () => {
    cfg.alerts ||= {}; cfg.alerts.prices ||= [];
    cfg.alerts.prices.push({ symbol: x.symbol, [dir]: v }); save();
    if (!cfg.markets.groups.some((g) => g.symbols.includes(x.symbol))) asSay(`Alert set. Note: I check prices for symbols on your boards — say "Add ${esc(label(x.symbol))} to my watchlist" so I can watch it.`);
    else asSay(`Alert set — I'll notify you when ${esc(label(x.symbol))} goes ${dir} ${fmtNum(v, 2)}.`);
  }, "bell");
}
async function asConvert(m) {
  const amt = +m[1].replace(",", "."), from = /cad|canad/.test(m[2]) ? "CAD" : "USD", to = /cad|canad/.test(m[4]) ? "CAD" : "USD";
  if (from === to) return asSay("Those are the same currency 🙂");
  const fx = await asQuote("CAD=X");
  if (!fx) return asSay("I couldn't get the exchange rate right now.");
  const out = from === "USD" ? amt * fx.price : amt / fx.price;
  asSay(`<b>${fmtNum(amt, 2)} ${from}</b> ≈ <b>${fmtNum(out, 2)} ${to}</b> <small>(1 USD = ${fmtNum(fx.price, 4)} CAD)</small>.`);
}

// real estate
function asRates(q) {
  const S = data.rates?.series;
  const go = { label: "Open mortgage desk", icon: "calculator", once: false, run: () => { cfg.markets.tab = `re:${reDefaults().country}`; save(); renderMarkets(true); asToggle(false); goToSection("markets", "HQ Assistant"); } };
  const pay = q.match(/(?:payment|afford|mortgage)\D*?\$?(\d+(?:\.\d+)?)\s*(k|m|thousand|million)?\b(?:.*?(\d{1,2})\s*%\s*down)?/);
  if (pay && /payment|monthly|cost/.test(q)) {
    let price = +pay[1] * (/^m|million/.test(pay[2] || "") ? 1e6 : /^k|thousand/.test(pay[2] || "") ? 1e3 : 1);
    if (price < 1000) price *= 1000;
    const md = { ...mortgageDefaults(), price, downPct: pay[3] ? +pay[3] : mortgageDefaults().downPct, rate: "" };
    const r = calcMortgage(md);
    return asSay(`On a <b>$${fmtNum(price, 0)}</b> home with ${md.downPct}% down at ${fmtNum(r.rate, 2)}% over ${md.years} years: about <b>$${fmtNum(r.monthlyEq, 0)}/month</b>${r.insurance ? ` (includes $${fmtNum(r.insurance, 0)} mortgage insurance)` : ""}. ${md.country === "CA" ? `To qualify you'd be tested at ${fmtNum(r.qualRate, 2)}%.` : ""}${r.ltt ? ` Ontario land transfer tax ≈ $${fmtNum(r.ltt, 0)}.` : ""}`, { actions: [go] });
  }
  if (!S) { loadRates().then(() => data.rates?.series && asRates(q)); return asSay("Getting the latest rates…", { quiet: true }); }
  const f = (k) => S[k] ? `${esc(S[k].label)} <b>${S[k].value.toFixed(2)}%</b>` : "";
  const ca = ["ca_overnight", "ca_prime", "ca_5y_posted"].map(f).filter(Boolean).join(" · ");
  const us = ["us_30y", "us_15y", "us_fedfunds"].map(f).filter(Boolean).join(" · ");
  asSay(`${ca ? `🇨🇦 ${ca}.<br>Stress test: the higher of 5.25% or your rate + 2%.<br>` : ""}${us ? `🇺🇸 ${us}.` : ""}<br><small class="as-hint">Try "Payment on 900k with 20% down".</small>`, { actions: [go] });
}
function asRealEstate(q) {
  const areas = [...Object.keys(RE_LOCAL), ...Object.keys(RE_ALIAS)];
  const hit = areas.sort((a, b) => b.length - a.length).find((a) => q.includes(a.toLowerCase()));
  const loc = hit ? reLocal(hit) : null;
  if (loc) {
    const tiles = loc.tiles.slice(0, 4).map(([l, v, s]) => `<li><b>${esc(l)}:</b> ${esc(v)} <small>${esc(s)}</small></li>`).join("");
    return asSay(`<b>${esc(loc.name)}</b> — ${esc(loc.assoc)}, ${esc(loc.period)}:<ul class="as-list">${tiles}</ul>${esc(loc.summary)}`, { actions: [{ label: "Open real estate", icon: "building-2", once: false, run: () => { cfg.markets.tab = `re:${/new jersey|realtors® \(nj|monmouth/i.test(loc.assoc + loc.name) ? "US" : "CA"}`; marketREArea[/new jersey|monmouth/i.test(loc.assoc + loc.name) ? "US" : "CA"] = hit; save(); renderMarkets(true); asToggle(false); goToSection("markets", "HQ Assistant"); } }, { label: "Source", icon: "external-link", once: false, run: () => window.open(loc.source, "_blank") }] });
  }
  const c = /\b(us|u\.s\.|usa|america|american|nar)\b/.test(q) ? "US" : /\b(canada|canadian|crea)\b/.test(q) ? "CA" : reDefaults().country;
  const s = RE_SNAPSHOT[c];
  asSay(`${RE_MARKETS[c].flag} National (${esc(s.source[0])}, ${esc(s.period)}):<ul class="as-list">${s.tiles.slice(0, 4).map(([l, v, sub]) => `<li><b>${esc(l)}:</b> ${esc(v)} <small>${esc(sub)}</small></li>`).join("")}</ul><small class="as-hint">Ask about a local market, e.g. "Mississauga market" or "Hamilton market".</small>`);
}

// news — searches every headline Daily HQ has: all news tabs (loading any not fetched yet), saved stories and real-estate feeds
const AS_STOP = new Set(("a an and any are about after again all also am anything as at be been before being but by can could did do does doing done for from get got had has have how i if in into is it its just know latest let like me more most my new news newest no not now of off on or our out over please read recent recently say see show should so some stories story tell than that the their them then there these they this those to today todays tonight up us was we were what whats when where which while who whom why will with would you your yesterday week weekend happened happening happen going on update updates headline headlines article articles info information find look search anything something everything give " +
  "score scores game games play playing played win won lose lost beat match last night next tonight price prices stock stocks doing trading quote markets market how's what's").split(" "));
const asStem = (w) => w.replace(/'s$/, "").replace(/(?<=[a-z]{2})ies$/, "y").replace(/(?<=[a-z]{3})(ing|ed)$/, "").replace(/(?<=[a-z]{3})s$/, "");
function asKeywords(q) {
  return [...new Set(q.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9&.' -]/g, " ").split(/\s+/).map((w) => w.replace(/^[.'-]+|[.'-]+$/g, "")).filter((w) => w && (w.length > 1 || /\d/.test(w)) && !AS_STOP.has(w)).map(asStem).filter(Boolean))];
}
function asNewsPool() {
  const pool = [], seen = new Set();
  const add = (i, tab, tabId) => { if (!i?.title) return; const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60); if (seen.has(k)) return; seen.add(k); pool.push({ ...i, tab, tabId }); };
  for (const c of cfg.news.categories) for (const i of data.news?.[c.id]?.items || []) add(i, c.name, c.id);
  for (const i of cfg.saved || []) add(i, "Saved", "__saved");
  for (const [k, d] of Object.entries(data.reSub || {})) for (const i of d.items || []) add(i, `Real estate · ${k.split("|")[1] || ""}`.trim(), "realestate");
  return pool;
}
async function asEnsureNews() {
  const missing = cfg.news.categories.filter((c) => c.on && c.id !== "realestate" && !data.news?.[c.id]?.items?.length);
  if (!missing.length) return;
  await Promise.race([Promise.all(missing.map((c) => loadCategory(c).catch(() => {}))), new Promise((r) => setTimeout(r, 6000))]);
}
function asNewsSearch(q, { limit = 5, strict = false } = {}) {
  const kws = asKeywords(q);
  if (!kws.length) return { kws, items: [] };
  const phrase = kws.join(" ");
  const need = strict ? Math.max(1, Math.ceil(kws.length * 0.6)) : Math.max(1, Math.ceil(kws.length / 2));
  const wordsOf = (s) => (s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9&.' -]/g, " ").split(/\s+/).map((w) => asStem(w.replace(/^[.'-]+|[.'-]+$/g, "")));
  const scored = asNewsPool().map((i) => {
    const tw = new Set(wordsOf(i.title)), dw = new Set(wordsOf(i.desc)), tl = i.title.toLowerCase();
    let score = 0, hits = 0, titleHits = 0;
    for (const k of kws) {
      const inT = tw.has(k) || (k.length > 3 && tl.includes(k)), inD = dw.has(k);
      if (inT) { score += 3; titleHits++; } else if (inD) score += 1;
      if (inT || inD) hits++;
    }
    if (kws.length > 1 && tl.includes(phrase)) score += 4;
    return { i, score, hits, titleHits };
  }).filter((x) => x.titleHits > 0 && x.hits >= need);
  scored.sort((a, b) => b.score - a.score || (b.i.ts || 0) - (a.i.ts || 0));
  return { kws, items: scored.slice(0, limit).map((x) => x.i) };
}
function asNewsCards(items) {
  return `<div class="as-news">${items.map((i) => `<a href="${esc(i.link)}" target="_blank" rel="noopener">${thumbHTML(i)}<span><b>${esc(i.title)}</b><small>${i.tab ? `${esc(i.tab)} · ` : ""}${esc(i.source || "")}${i.ts ? ` · ${ago(i.ts)}` : ""}</small></span></a>`).join("")}</div>`;
}
function asOpenNewsAction(items, kws) {
  const tabId = items[0]?.tabId;
  if (!tabId) return [];
  return [{ label: `Open in News${items[0].tab ? ` · ${items[0].tab.split(" · ")[0]}` : ""}`, icon: "newspaper", once: false, run: () => {
    activeNews = tabId; newsFilter = tabId === "__saved" || tabId === "realestate" ? "" : (kws.slice().sort((a, b) => b.length - a.length)[0] || ""); newsSource[tabId] = "";
    renderNews(); asToggle(false); goToSection("news", "HQ Assistant");
  } }];
}
async function asNews(q) {
  await asEnsureNews();
  const { kws, items: hits } = asNewsSearch(q);
  const topic = kws.join(" ");
  let items = hits, fromWeb = false;
  if (topic && !items.length) {
    try { items = parseFeed(await api(`/api/feed?url=${encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`)}`, true), { name: "Google News" }).slice(0, 5); fromWeb = true; } catch { items = []; }
  }
  if (!topic) { const c = cfg.news.categories.find((c) => c.on && data.news?.[c.id]?.items?.length); items = (c ? data.news[c.id].items : []).slice(0, 5).map((i) => ({ ...i, tab: c.name, tabId: c.id })); }
  if (!items.length) return asSay(`I couldn't find news${topic ? ` about "${esc(topic)}"` : ""}.`);
  const head = !topic ? "Top headlines" : fromWeb ? `Nothing in your news tabs mentions <b>${esc(topic)}</b>, so here's the latest from Google News` : `From your news tabs — <b>${esc(topic)}</b>`;
  asSay(`${head}:`, { spoken: items.slice(0, 3).map((i) => i.title).join(". "), cards: asNewsCards(items), actions: fromWeb ? [] : asOpenNewsAction(items, kws) });
  setTimeout(fillArticleImages, 50);
}
// after answering a sports / markets / real-estate question, show matching headlines from the news tabs
async function asRelatedNews(q) {
  const { kws, items } = asNewsSearch(q, { limit: 3, strict: true });
  if (!kws.length || !items.length) return;
  asSay(`Related in your news:`, { quiet: true, cards: asNewsCards(items), actions: asOpenNewsAction(items, kws) });
  setTimeout(fillArticleImages, 50);
}

// fallback: try teams / stocks, then point to help
async function asFallback(q) {
  const hits = asFindTeams(q);
  if (hits.length) { await asSports(q); return asRelatedNews(q); }
  await asEnsureNews();
  const found = asNewsSearch(q);
  if (found.items.length) {
    asSay(`I found this in your news${found.kws.length ? ` for <b>${esc(found.kws.join(" "))}</b>` : ""}:`, { spoken: found.items.slice(0, 3).map((i) => i.title).join(". "), cards: asNewsCards(found.items), actions: asOpenNewsAction(found.items, found.kws) });
    setTimeout(fillArticleImages, 50);
    return;
  }
  if (/^[a-z.]{1,6}$/.test(q)) { const x = await asQuote(q.toUpperCase()).catch(() => null); if (x) return asMarkets(q); }
  if (/^(follow|add) /.test(q) && (await asFollow(q.replace(/^(follow|add) /, "")))) return;
  asSay(`I'm not sure how to help with that yet. I work best with things Daily HQ knows about — your brief, calendar, scores, weather, markets, real estate and news.`, { actions: [{ label: "What can you do?", icon: "sparkles", run: () => asHelp() }] });
}

asInit();

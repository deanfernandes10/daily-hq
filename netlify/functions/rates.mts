import { UA, json } from "../lib/shared.mts";

// Housing-related interest rates.
// US: Freddie Mac weekly mortgage rates + effective fed funds, via FRED's public CSV download.
// Canada: Bank of Canada Valet API (policy rate, prime, 5-year posted mortgage, 5-year bond yield).
// GET /api/rates

const FRED: Record<string, { id: string; label: string; source: string }> = {
  us_30y: { id: "MORTGAGE30US", label: "30-yr fixed mortgage", source: "Freddie Mac via FRED" },
  us_15y: { id: "MORTGAGE15US", label: "15-yr fixed mortgage", source: "Freddie Mac via FRED" },
  us_fedfunds: { id: "DFF", label: "Fed funds (effective)", source: "Federal Reserve via FRED" },
};
const BOC: Record<string, { id: string; label: string }> = {
  ca_overnight: { id: "V39079", label: "BoC policy rate" },
  ca_prime: { id: "V80691311", label: "Prime rate" },
  ca_5y_posted: { id: "V80691335", label: "5-yr posted mortgage" },
  ca_5y_bond: { id: "BD.CDN.5YR.DQ.YLD", label: "5-yr Canada bond" },
};

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function fred(key: string) {
  const s = FRED[key];
  try {
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${s.id}&cosd=${daysAgo(120)}`, {
      headers: { "user-agent": UA, accept: "text/csv" },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) { console.log("FRED", s.id, r.status); return null; }
    const rows = (await r.text())
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((l) => l.split(","))
      .filter(([, v]) => v && v !== "." && !isNaN(Number(v)));
    if (!rows.length) return null;
    const last = rows.at(-1)!, prev = rows.at(-2);
    return { label: s.label, source: s.source, value: Number(last[1]), prev: prev ? Number(prev[1]) : null, date: last[0] };
  } catch (e: any) {
    console.log("FRED", s.id, e?.message);
    return null;
  }
}

async function boc() {
  const ids = Object.values(BOC).map((s) => s.id).join(",");
  try {
    const r = await fetch(`https://www.bankofcanada.ca/valet/observations/${ids}/json?start_date=${daysAgo(120)}`, {
      headers: { "user-agent": UA, accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { console.log("BoC", r.status); return {}; }
    const d = await r.json();
    const obs: any[] = d.observations || [];
    const out: Record<string, any> = {};
    for (const [key, s] of Object.entries(BOC)) {
      const pts = obs.filter((o) => o[s.id]?.v != null && o[s.id].v !== "").map((o) => ({ date: o.d, v: Number(o[s.id].v) }));
      if (!pts.length) continue;
      const last = pts.at(-1)!, prev = pts.at(-2);
      out[key] = { label: s.label, source: "Bank of Canada", value: last.v, prev: prev ? prev.v : null, date: last.date };
    }
    return out;
  } catch (e: any) {
    console.log("BoC", e?.message);
    return {};
  }
}

// Freddie Mac's own weekly survey file (primary for US mortgage rates)
async function freddie() {
  try {
    const r = await fetch("https://www.freddiemac.com/pmms/docs/PMMS_history.csv", {
      headers: { "user-agent": UA, accept: "text/csv" },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) { console.log("Freddie", r.status); return {}; }
    const lines = (await r.text()).trim().split(/\r?\n/);
    const head = lines[0].toLowerCase().split(",");
    const iD = head.findIndex((h) => h.includes("date")), i30 = head.indexOf("pmms30"), i15 = head.indexOf("pmms15");
    const rows = lines.slice(1).map((l) => l.split(",")).filter((c) => c[i30] && !isNaN(Number(c[i30])));
    if (!rows.length || i30 < 0) return {};
    const iso = (d: string) => { const m = d.match(/(\d+)\/(\d+)\/(\d{4})/); return m ? `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}` : d; };
    const last = rows.at(-1)!, prev = rows.at(-2);
    const out: Record<string, any> = {
      us_30y: { label: "30-yr fixed mortgage", source: "Freddie Mac PMMS", value: Number(last[i30]), prev: prev ? Number(prev[i30]) : null, date: iso(last[iD]) },
    };
    if (i15 >= 0 && last[i15]) out.us_15y = { label: "15-yr fixed mortgage", source: "Freddie Mac PMMS", value: Number(last[i15]), prev: prev ? Number(prev[i15]) : null, date: iso(last[iD]) };
    return out;
  } catch (e: any) {
    console.log("Freddie", e?.message);
    return {};
  }
}
// New York Fed effective fed funds rate
async function nyfed() {
  try {
    const r = await fetch("https://markets.newyorkfed.org/api/rates/unsecured/effr/last/2.json", {
      headers: { "user-agent": UA, accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) { console.log("NYFed", r.status); return null; }
    const d = await r.json();
    const rows = (d.refRates || []).filter((x: any) => x.percentRate != null).sort((a: any, b: any) => String(a.effectiveDate).localeCompare(String(b.effectiveDate)));
    if (!rows.length) return null;
    const last = rows.at(-1), prev = rows.at(-2);
    return { label: "Fed funds (effective)", source: "Federal Reserve Bank of New York", value: Number(last.percentRate), prev: prev ? Number(prev.percentRate) : null, date: last.effectiveDate };
  } catch (e: any) {
    console.log("NYFed", e?.message);
    return null;
  }
}

export default async () => {
  const [fm, ny, ca] = await Promise.all([freddie(), nyfed(), boc()]);
  // FRED only as a backup for anything still missing
  const [us30, us15, ff] = await Promise.all([
    fm.us_30y ? null : fred("us_30y"),
    fm.us_15y ? null : fred("us_15y"),
    ny ? null : fred("us_fedfunds"),
  ]);
  const series: Record<string, any> = { ...ca, ...fm };
  if (ny) series.us_fedfunds = ny;
  if (!series.us_30y && us30) series.us_30y = us30;
  if (!series.us_15y && us15) series.us_15y = us15;
  if (!series.us_fedfunds && ff) series.us_fedfunds = ff;
  if (!Object.keys(series).length) return json({ error: "Rates unavailable" }, 502);
  return json({ series }, 200, 6 * 3600);
};

export const config = { path: "/api/rates" };

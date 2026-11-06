import { UA, json } from "../lib/shared.mts";

// Market quotes + intraday sparkline from Yahoo Finance's public chart API.
// GET /api/quotes?s=AAPL,^GSPC,BTC-USD
// GET /api/quotes?search=nvidia

function downsample(arr: number[], n: number) {
  if (arr.length <= n) return arr;
  const out: number[] = [];
  const step = (arr.length - 1) / (n - 1);
  for (let i = 0; i < n; i++) out.push(arr[Math.round(i * step)]);
  return out;
}

async function yahoo(path: string) {
  for (const host of ["query1", "query2"]) {
    try {
      const r = await fetch(`https://${host}.finance.yahoo.com${path}`, {
        headers: { "user-agent": UA, accept: "application/json" },
        signal: AbortSignal.timeout(7000),
      });
      if (r.ok) return await r.json();
    } catch {}
  }
  return null;
}

async function quote(sym: string) {
  const d = await yahoo(`/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=5m`);
  const res = d?.chart?.result?.[0];
  if (!res) return { symbol: sym, error: true };
  const m = res.meta || {};
  const closes: number[] = (res.indicators?.quote?.[0]?.close || []).filter((v: any) => v != null);
  const price = m.regularMarketPrice ?? closes.at(-1);
  const prev = m.chartPreviousClose ?? m.previousClose;
  const change = price != null && prev != null ? price - prev : null;
  return {
    symbol: sym,
    name: m.shortName || m.longName || sym,
    price,
    prev,
    change,
    pct: change != null && prev ? (change / prev) * 100 : null,
    currency: m.currency,
    exchange: m.fullExchangeName || m.exchangeName,
    time: m.regularMarketTime,
    spark: downsample(closes, 48),
  };
}

export default async (req: Request) => {
  const p = new URL(req.url).searchParams;

  const q = p.get("search");
  if (q) {
    const d = await yahoo(
      `/v1/finance/search?q=${encodeURIComponent(q.slice(0, 40))}&quotesCount=8&newsCount=0&listsCount=0`
    );
    const results = (d?.quotes || [])
      .filter((x: any) => x.symbol)
      .map((x: any) => ({
        symbol: x.symbol,
        name: x.shortname || x.longname || x.symbol,
        exch: x.exchDisp || x.exchange,
        type: x.quoteType,
      }));
    return json({ results }, 200, 3600);
  }

  const syms = (p.get("s") || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z0-9^=.\-]{1,20}$/.test(s))
    .slice(0, 60);
  if (!syms.length) return json({ error: "No symbols" }, 400);
  const quotes = await Promise.all(syms.map(quote));
  return json({ quotes }, 200, 60);
};

export const config = { path: "/api/quotes" };

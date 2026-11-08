import { UA } from "../lib/shared.mts";

// Finds the lead picture for a news article: its og:image / twitter:image.
// GET /api/ogimage?url=<article link>
// Google News links are wrapped, so they're first turned back into the publisher's own link.

const blocked = (host: string) =>
  host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || /^(\d+\.){3}\d+$/.test(host) || host.includes(":");

const out = (body: object, ttl = 86400) =>
  new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${ttl}`,
      "Netlify-CDN-Cache-Control": `public, s-maxage=${ttl * 3}, stale-while-revalidate=${ttl}`,
      "Netlify-Vary": "query",
    },
  });

async function get(url: string, ms = 7000, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9", ...(init.headers || {}) },
    redirect: "follow",
    signal: AbortSignal.timeout(ms),
  });
}

// Google News article ids → publisher URL
let why = "";
async function decodeGoogle(u: URL): Promise<string | null> {
  const id = u.pathname.split("/").pop() || "";
  if (!id) return null;
  // Older ids carry the URL inside the base64 payload
  try {
    const bin = atob(id.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((id.length + 3) % 4));
    const m = bin.match(/https?:\/\/[\x21-\x7e]+/);
    if (m && !m[0].includes("news.google.com")) return m[0].replace(/[\x00-\x1f\u0080-￿].*$/, "");
  } catch {}
  // Newer ids: read the signature from the article page, then ask Google for the link
  try {
    let page = "", sg: string | undefined, ts: string | undefined;
    for (const pre of ["https://news.google.com/rss/articles/", "https://news.google.com/articles/"]) {
      const r0 = await get(`${pre}${id}?hl=en-US&gl=US&ceid=US:en`, 5000);
      page = await r0.text();
      sg = page.match(/data-n-a-sg="([^"]+)"/)?.[1];
      ts = page.match(/data-n-a-ts="([^"]+)"/)?.[1];
      if (sg && ts) break;
    }
    if (!sg || !ts) { why = "nosig " + page.length + " " + page.slice(0, 200).replace(/\s+/g, " "); return null; }
    const req = [[["Fbv4je", JSON.stringify(["garturlreq", [["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, null, null, null, null, null, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0], id, Number(ts), sg]), null, "generic"]]];
    const r = await get("https://news.google.com/_/DotsSplashUi/data/batchexecute", 6000, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: "f.req=" + encodeURIComponent(JSON.stringify(req)),
    });
    const text = await r.text();
    const m = text.match(/\\"garturlres\\",\\"(https?:[^\\"]+)\\"/) || text.match(/"garturlres","(https?:[^"]+)"/);
    if (!m) why = "nores " + r.status + " " + text.slice(0, 300);
    return m ? m[1].replace(/\\\\u003d/g, "=").replace(/\\u003d/g, "=").replace(/\\u0026/g, "&") : null;
  } catch (e: any) {
    why = "err " + e?.message;
    return null;
  }
}

const decode = (s: string) => s.replace(/&#0*38;/g, "&").replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&#47;/g, "/").replace(/&quot;/g, '"');

function findImage(html: string, base: string): string | null {
  const head = html.slice(0, 400_000);
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];
  const pick = (keys: string[]) => {
    for (const k of keys)
      for (const t of metas) {
        const key = (attr(t, "property") || attr(t, "name") || attr(t, "itemprop") || "").toLowerCase();
        if (key === k) { const c = attr(t, "content"); if (c) return c; }
      }
    return null;
  };
  let img = pick(["og:image:secure_url", "og:image", "og:image:url", "twitter:image", "twitter:image:src", "image", "thumbnailurl"]);
  if (!img) img = head.match(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)/i)?.[1] || null;
  if (!img) {
    const ld = head.match(/"image"\s*:\s*(?:\[\s*)?(?:\{[^}]*?"url"\s*:\s*)?"(https?:[^"]+)"/i);
    if (ld) img = ld[1].replace(/\\\//g, "/");
  }
  if (!img) return null;
  try {
    const abs = new URL(decode(img), base);
    if (abs.protocol === "http:") abs.protocol = "https:";
    return abs.protocol === "https:" ? abs.toString() : null;
  } catch { return null; }
}

export default async (req: Request) => {
  const raw = new URL(req.url).searchParams.get("url") || "";
  let target: URL;
  try { target = new URL(raw); } catch { return out({ error: "Bad url" }, 60); }
  if (!/^https?:$/.test(target.protocol) || blocked(target.hostname)) return out({ error: "URL not allowed" }, 60);

  let article = target.toString();
  if (target.hostname === "news.google.com") {
    const real = await decodeGoogle(target);
    if (!real) { console.log("ogimage: couldn't decode Google News link", why.slice(0, 200)); return out({ img: null, reason: "google", ...(new URL(req.url).searchParams.get("debug") ? { why } : {}) }, 600); }
    article = real;
  }
  try {
    const host = new URL(article).hostname;
    if (blocked(host)) return out({ img: null }, 3600);
    const r = await get(article, 7000, { headers: { accept: "text/html,application/xhtml+xml" } });
    if (!r.ok) return out({ img: null, url: article, status: r.status }, 3600);
    const reader = r.body?.getReader();
    let html = "";
    if (reader) {
      const dec = new TextDecoder();
      while (html.length < 400_000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += dec.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
      }
      reader.cancel().catch(() => {});
    }
    return out({ img: findImage(html, r.url || article), url: article });
  } catch (e: any) {
    return out({ img: null, url: article }, 3600);
  }
};

export const config = { path: "/api/ogimage" };

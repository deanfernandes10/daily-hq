import { UA } from "../lib/shared.mts";

// Fetches an RSS/Atom feed server-side (browsers can't, because of CORS) and returns the raw XML.
// GET /api/feed?url=https://feeds.npr.org/1001/rss.xml

function blocked(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(\d+\.){3}\d+$/.test(host) || // raw IPv4
    host.includes(":") // raw IPv6
  );
}

export default async (req: Request) => {
  const raw = new URL(req.url).searchParams.get("url") || "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Bad url", { status: 400 });
  }
  if (!/^https?:$/.test(target.protocol) || blocked(target.hostname)) {
    return new Response("URL not allowed", { status: 400 });
  }

  try {
    const r = await fetch(target, {
      headers: {
        "user-agent": UA,
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
    });
    if (!r.ok) { console.log("Feed failed:", target.hostname, r.status); return new Response(`Feed returned ${r.status}`, { status: 502 }); }
    const text = await r.text();
    if (text.length > 4_000_000) return new Response("Feed too large", { status: 502 });
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(text.slice(0, 5000)))
      return new Response("Not an RSS/Atom feed", { status: 502 });
    return new Response(text, {
      headers: {
        "content-type": "text/xml; charset=utf-8",
        "cache-control": "public, max-age=120",
        "Netlify-CDN-Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        "Netlify-Vary": "query",
      },
    });
  } catch {
    return new Response("Could not reach feed", { status: 502 });
  }
};

export const config = { path: "/api/feed" };

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

export function json(body: unknown, status = 200, ttl = 60) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? `public, max-age=${Math.min(ttl, 60)}` : "no-store",
      ...(status === 200
        ? {
            "Netlify-CDN-Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
            "Netlify-Vary": "query",
          }
        : {}),
    },
  });
}

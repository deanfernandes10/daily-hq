// Fetches a private calendar feed (.ics) server-side so the browser can read it.
// The link is passed through and never stored.
// GET /api/ics?url=https://calendar.google.com/calendar/ical/.../basic.ics

function blocked(host: string) {
  return host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || /^(\d+\.){3}\d+$/.test(host) || host.includes(":");
}

export default async (req: Request) => {
  let raw = new URL(req.url).searchParams.get("url") || "";
  raw = raw.replace(/^webcals?:\/\//i, "https://");
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Bad calendar link", { status: 400 });
  }
  if (target.protocol !== "https:" || blocked(target.hostname)) return new Response("Calendar link must start with https://", { status: 400 });
  try {
    const r = await fetch(target, {
      headers: { "user-agent": "DailyHQ calendar reader", accept: "text/calendar, */*;q=0.5" },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) {
      console.log("ICS failed:", target.hostname, r.status);
      return new Response(`Calendar returned ${r.status}`, { status: 502 });
    }
    const text = await r.text();
    if (!text.includes("BEGIN:VCALENDAR")) return new Response("That link isn't a calendar (.ics) feed", { status: 502 });
    if (text.length > 8_000_000) return new Response("Calendar too large", { status: 502 });
    return new Response(text, {
      headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, no-store" },
    });
  } catch {
    return new Response("Could not reach the calendar", { status: 502 });
  }
};

export const config = { path: "/api/ics" };

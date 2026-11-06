// Builds a one-event .ics file so iPhone / Mac / Outlook desktop can "Add to Calendar".
// GET /api/event.ics?title=&start=20261110T173000Z&end=...&location=&notes=
// All-day events pass start/end as YYYYMMDD.
export default async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const clean = (v: string | null, max = 500) =>
    (v || "").slice(0, max).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const start = q.get("start") || "";
  const end = q.get("end") || "";
  const allDay = /^\d{8}$/.test(start);
  const okTime = (v: string) => /^\d{8}(T\d{6}Z)?$/.test(v);
  if (!okTime(start) || (end && !okTime(end))) return new Response("Bad date", { status: 400 });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const fold = (line: string) => line.match(/.{1,74}/g)!.join("\r\n ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Daily HQ//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@dailyhq`,
    `DTSTAMP:${stamp}`,
    allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    end ? (allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`) : "",
    `SUMMARY:${clean(q.get("title"), 200) || "Event"}`,
    q.get("location") ? `LOCATION:${clean(q.get("location"))}` : "",
    q.get("notes") ? `DESCRIPTION:${clean(q.get("notes"), 1500)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).map(fold);
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="event.ics"',
      "cache-control": "no-store",
    },
  });
};

export const config = { path: "/api/event.ics" };

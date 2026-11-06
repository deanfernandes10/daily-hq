# Daily HQ

Personal daily dashboard: scores and where to watch, news feeds, weather with official alerts, and markets — all configurable from the Customize panel.

- `public/` — the site (plain HTML/CSS/JS, no build step)
- `netlify/functions/` — small server endpoints for sports (ESPN), news feeds (RSS), quotes (Yahoo Finance) and weather alerts (NWS / Environment Canada)
- `netlify.toml` — Netlify settings (publish `public`, functions in `netlify/functions`)

Hosted on Netlify; every push to `main` deploys automatically.

## Features
- **Your brief**: one-glance summary of weather/alerts, meetings, your teams, markets and top headlines
- **Today**: events from private calendar links (Google / Outlook / iCloud .ics), incl. recurring meetings
- **Sports**: your teams' live/latest games + Coming up, day picker, tap a game for details, league standings
- **Weather**: forecast, official alerts (NWS / Environment Canada), air quality, UV
- **News**: tabs incl. Politics, Real Estate, Industry & Moves, Local; per-source filter; Save for later
- **Markets**: tiles or list, USD⇄CAD converter
- **Alerts**: game start / finals, weather alerts, stock moves and price targets (in-app + device notifications)
- **People & sync**: several people per device (separate setups) and private sync codes across devices (`/api/sync`, Netlify Blobs)

Icons: Lucide (ISC), Meteocons by Bas Milius (MIT, `public/wx`), league/team logos from ESPN data.

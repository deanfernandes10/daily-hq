# Daily HQ

Personal daily dashboard: scores and where to watch, news feeds, weather with official alerts, and markets — all configurable from the Customize panel.

- `public/` — the site (plain HTML/CSS/JS, no build step)
- `netlify/functions/` — small server endpoints for sports (ESPN), news feeds (RSS), quotes (Yahoo Finance) and weather alerts (NWS / Environment Canada)
- `netlify.toml` — Netlify settings (publish `public`, functions in `netlify/functions`)

Hosted on Netlify; every push to `main` deploys automatically.

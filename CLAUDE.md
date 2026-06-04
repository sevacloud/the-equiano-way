# The Equiano Way — Project Instructions

## What This Is
A vanilla HTML/CSS/JS Progressive Web App for an 80-mile heritage walking route
from Wincobank Chapel, Sheffield to Wilberforce House, Hull.

## Core Rules — Never Break These
- No frameworks. No React, Vue, Next.js, or bundlers. Plain HTML, CSS, JS only.
- No npm dependencies in /public. CDN links only (cdnjs.cloudflare.com).
- All JS files use ES modules (type="module") or plain scripts — no CommonJS.
- No user accounts. No login. No backend database.
- Session progress in localStorage only — key: "equiano-session".
- WCAG 2.2 AA required on every page. Minimum contrast 4.5:1. Touch targets 44×44px minimum.
- All interactive elements need aria-label or aria-labelledby.
- focus-visible must be visible on every interactive element. Never use outline: none.

## Colours (brand — use exactly these)
- --teal: #1A6B5F        (7.2:1 on white — primary brand)
- --teal-dark: #0F3F37
- --teal-light: #E8F4F2
- --gold: #C49A2E        (use on dark backgrounds only)
- --gold-dark: #7A5C0A   (use on light backgrounds — AA compliant)
- --parchment: #F2EDE3   (page background)
- --ink: #1C1813         (body text)

## Fonts (Google Fonts — already loaded in index.html and map.html)
- Cinzel — display headings
- Cormorant Garamond — body text
- Crimson Pro — labels, navigation, UI text

## File Roles
- public/index.html — landing page (DO NOT rewrite — extend only)
- public/map.html — map screen (DO NOT rewrite — extend only)
- public/js/session.js — localStorage session management
- public/js/start-prompt.js — daily starting position prompt
- public/js/map.js — Leaflet map, GPX, markers
- public/js/gps.js — geolocation, GPS dot
- public/js/drawer.js — bottom drawer swipe + tap
- public/js/story.js — story panel, Web Speech audio
- public/js/report.js — report form, POST to /api/report
- public/sw.js — Service Worker, offline cache
- public/manifest.json — PWA manifest
- functions/report.js — Cloudflare Pages Function (server-side, handles Resend email)
- public/_headers — Cloudflare security and cache headers
- wrangler.toml — Cloudflare configuration

## Session Shape (localStorage)
```json
{
  "startSectionSlug": "day-1-wincobank-whiston",
  "startLat": 53.4285,
  "startLng": -1.3920,
  "visitedWaypoints": [],
  "sessionDate": "2026-05-01",
  "savedAt": "2026-05-01T09:00:00Z"
}
```

## Reporting Flow
Form in report.html → POST to /api/report → functions/report.js →
Resend API (env: RESEND_API_KEY) → email to manager@epwortholdrectory.org.uk
No database. No auth. Rate limit: 10 submissions per IP per hour.

## Map Libraries
- Leaflet 1.9.4 from cdnjs.cloudflare.com
- OpenStreetMap tiles: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
- Route drawn from public/data/route.gpx

## Commands
- `wrangler pages dev public` — start local dev server at http://localhost:8788
- No build step — deploy public/ folder as-is

## Verify Before Completing Any Task
- HTML validates (no unclosed tags)
- All new interactive elements have aria-label
- All new colours checked against WCAG AA
- JS added to map.html or index.html uses script tags, not import — these pages
  use inline scripts, not modules
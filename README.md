# YatraAI

**Find an Indian destination that fits your mood, budget, and travel plans.**

[Live website](https://yatra-vibe-finder.onrender.com/) · [Repository](https://github.com/Ayushkumar2552/yatra-vibe-finder)

YatraAI is an explainable, rule-based travel recommendation application. It ranks destinations using your preferences and shows why each place fits. It does not use a generative language model or promise live booking prices.

## Features

- Explore Indian destinations by travel interests, with destination galleries and detail pages.
- Plan around your starting location, budget, group size, duration, season, climate, and transport preferences.
- Compare weighted fit scores, estimated cost breakdowns, and suggested itineraries.
- View Open-Meteo weather and forecasts, with explicit unavailable states when data cannot be fetched.
- Discover photo spots and enjoy cinematic travel media.
- Create an email/password account, save destinations, and sync trip reminders through Supabase.
- Receive in-app departure alerts and optional browser notifications while the website is open.

## Technology

React 19, TypeScript, TanStack Start/Router/Query, Vite, Tailwind CSS, Radix UI, Nitro, and Supabase Auth/PostgreSQL. The production Node server runs on Render. Vitest and Testing Library cover core behavior.

The application builds with standard Vite plugins. A Lovable account, subscription, or build wrapper is not required to run it. Historical commits and original media provenance may still mention the original editor.

## Local development

Use Node.js 22.12 or later within Node 22, and npm.

```sh
git clone https://github.com/Ayushkumar2552/yatra-vibe-finder.git
cd yatra-vibe-finder
npm ci
cp .env.example .env
# Fill in your Supabase project URL and publishable key.
npm run dev
```

Open the address printed by Vite. Apply `supabase/migrations/202610230001_user_travel_data.sql` once to a new Supabase project before using saved destinations and reminders. It creates both tables and per-user row-level security policies.

The development environment needs these variables:

| Variable | Purpose |
| --- | --- |
| `AUTH_PROVIDER=supabase` | Verify accounts with Supabase on the server |
| `VITE_AUTH_PROVIDER=supabase` | Use the application's email/password account screen |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Your project's publishable key; no service-role key is needed |
| `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET` | Optional server-side travel integration credentials |

Keep credentials out of Git. Open-Meteo weather does not require an API key in the current integration. Vite loads `.env` for development; production server variables must be supplied by the hosting environment.

## Build and deploy on Render

```sh
npm run build:render
npm run start:render
```

Render build command: `npm ci --include=dev && npm run build:render`.
Start command: `npm run start:render`.

Set the Supabase server variables above, `NODE_VERSION=22`, `NODE_ENV=production`, and `HOST=0.0.0.0`. The build command selects the Supabase client flow and Nitro Node server output. See `render.yaml` and [deployment notes](RENDER_DEPLOYMENT.md).

The live service tracks `deploy/render-supabase`. Changes made only on `main` do not deploy automatically to that service. The legacy `npm run build` command retains the separate Sites/Cloudflare artifact layout; use `build:render` for this deployment.

## Authentication status

Email/password signup is enabled. **Email confirmation is temporarily disabled for the demo**, so new accounts can sign in immediately and email ownership is not verified. Configure a mail provider and a complete confirmation flow before re-enabling confirmation. The Supabase Site URL is the Render website, with `/account` allowed as a redirect.

## How recommendations work

The engine scores budget, interests, weather, climate, season, travel practicality, duration, and group fit. Unavailable or inapplicable factors are excluded and weights are normalized. Feasible destinations rank first; rule explanations describe the recommendation without adding the same benefit twice. Scores express preference fit, not a probability or guarantee.

| Area | Source |
| --- | --- |
| Destination knowledge base | `src/data/destinations.ts` |
| Scoring and explanations | `src/lib/engine/recommend.ts` |
| Budget estimates and itinerary | `src/lib/engine/estimate.ts`, `itinerary.ts` |
| Weather integration | `src/lib/weather/` |
| Accounts and sessions | `src/lib/auth/` |
| Saved trips and reminder sync | `src/lib/trips/` |
| Database schema and policies | `supabase/migrations/` |
| Shared destination galleries | `src/components/DestinationGallery.tsx` |

## Validation

```sh
npm test
npx tsc --noEmit
npm run build:render
```

## Demo limitations and media

- Budgets and itineraries are estimates, not booking quotations or availability guarantees.
- Departure reminders require an open website; browser sleep can delay alerts. Database synchronization is not a background notification scheduler.
- Weather, routing, and photo sources depend on external services and their terms/availability.
- Keep image/video source credits and licensing information when replacing media. Generated photo-story illustrations are documented in `public/images/photo-stories/README.md`.
- No repository-wide license is granted by this README; third-party media and packages retain their own terms.

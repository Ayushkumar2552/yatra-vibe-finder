# YatraAI

### Travel recommendations shaped around you

YatraAI helps travellers discover Indian destinations that match their interests, budget, season, and travel plans. Its rule-based recommendation engine explains why each destination fits, making comparisons clear and practical.

**[Explore the live application](https://yatra-vibe-finder.onrender.com/)**

## Features

- **Personalised recommendations** based on budget, interests, climate, season, trip duration, group size, and travel practicality.
- **Explainable rankings** with match scores and reasons for each recommendation.
- **Trip planning** with estimated cost breakdowns and suggested itineraries.
- **Destination discovery** through galleries, destination details, and photo spots.
- **Weather information** powered by Open-Meteo, with clear availability states.
- **Personal accounts** to save destinations and synchronise trip reminders.
- **Departure reminders** through in-app alerts and optional browser notifications.

## How recommendations work

1. Collect the traveller's preferences and trip constraints.
2. Evaluate destinations against rules in the recommendation engine.
3. Combine applicable factors into a weighted score, normalising weights when a factor is unavailable.
4. Rank feasible destinations first and explain the results.

YatraAI uses a rule-based approach rather than a trained machine-learning model or generative language model. Scores indicate preference fit; costs and itineraries are estimates, not booking quotations.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Interface | React, TypeScript, Tailwind CSS, Radix UI |
| Application | TanStack Start, Router, and Query |
| Build and server | Vite, Nitro, Node.js |
| Accounts and persistence | Supabase Auth and PostgreSQL |
| Testing | Vitest and Testing Library |

Destination information is maintained in the application data layer. Account data, saved destinations, and synchronised reminders use Supabase, with per-user database access policies.

## Getting started

**Requirements:** Node.js 22.12+ within Node 22, npm, and a Supabase project.

```sh
git clone https://github.com/Ayushkumar2552/yatra-vibe-finder.git
cd yatra-vibe-finder
npm ci
cp .env.example .env
```

Fill in the environment placeholders with your own project configuration. Apply the SQL migration in `supabase/migrations/` to your database, then start the development server:

```sh
npm run dev
```

Never commit local environment files or secret keys. Production environment values belong in the hosting provider's configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production Node.js build |
| `npm start` | Run the production server |
| `npm test` | Run automated tests |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run lint` | Run code quality checks |

`render.yaml` provides the hosting configuration. The `build:render` and `start:render` aliases support the existing deployment.

## Project structure

```text
src/
  components/    Shared interface components
  data/          Destination knowledge base
  lib/           Recommendation engine and integrations
  routes/        Application pages
  test/          Automated tests
public/          Static images and videos
supabase/
  migrations/    Database schema and access policies
```

## Usage notes

Weather and travel integrations depend on external service availability. Departure alerts require the website to remain open; browser sleep can delay notifications. Generated illustrations are identified in the media documentation, and third-party assets retain their original terms and credits.

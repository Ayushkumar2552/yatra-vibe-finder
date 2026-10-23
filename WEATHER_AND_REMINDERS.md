# Weather and pre-trip reminders

## Run locally

Use Node.js 22.12+ (or a newer supported LTS). Extract the ZIP, open the project folder in VS Code, then run:

```sh
npm install
npm run dev
```

Open the local address printed by Vite. Go to Explore, open a destination, and find “Be ready for [destination]”. Set the departure date/time, save reminders, and use Test ping. No weather API key is required for this Open-Meteo integration. Production deployments must support the existing TanStack Start server functions; do not serve only the static client files.

## Added behavior

- Current destination weather with temperature, feels-like, humidity, precipitation, wind and provider observation time.
- Automatic weather refresh every 12 minutes while the page is active, plus manual refresh.
- Loading and unavailable states; no fabricated fallback readings.
- Departure-day forecasts within the provider's forecast range. For later trips, only destination essentials are suggested.
- Basic, destination-specific and weather-related packing suggestions with no mandatory checklist.
- Saved reminders at 24 hours and 2 hours before departure. Saving inside a window triggers it on the next check (within about 15 seconds while active).
- Persistent in-app alerts, optional browser notifications and a short sound after user interaction.
- Reminders remain active across app routes and page reloads in the same browser. Cancel or update from the destination page.

## Limits

This is a browser-local reminder system. The website must remain open for scheduled alerts; browser sleep/throttling can delay delivery. Reopening before departure catches up only the most urgent unsent reminder. No reminders fire after departure. Closing the site prevents scheduled delivery. For closed-site notifications, a deployed backend scheduler, push subscriptions, service worker and credentials are still required.

Browser notifications depend on browser/OS support, HTTPS (or localhost) and permission. Permission is requested only when the user clicks Enable browser notifications. In-app messages work without permission. Sound requires a user gesture each session and can be muted by the browser. Multiple simultaneously active tabs may occasionally duplicate a ping.

Departure input uses the user's device timezone; weather observation time uses the destination timezone. All current destination data is for India. Saved packing suggestions are a snapshot: refresh weather and click Update reminders nearer departure. The system cannot sense packed items. Storage is local to the browser, with no account or cross-device synchronization.

Open-Meteo conditions are provider model data, not a sensor at the exact destination. Check the provider's terms and plan before commercial-scale deployment: https://open-meteo.com/en/terms

## Validation

TypeScript check and production build passed. New reminder and UI tests cover timing boundaries, catch-up, duplicate suppression, invalid dates, weather-unavailable suggestions, corrupt storage, save and cancel. A live Open-Meteo request for Goa returned data during development.

The original gallery test fails because at least one existing destination has fewer than three images. The test and gallery source data are byte-for-byte unchanged from the uploaded ZIP; this is unrelated to weather/reminders. The existing gallery and routing component tests pass.

## Main changed files

- src/components/TripPreparation.tsx
- src/components/TripReminders.tsx
- src/lib/trips/reminders.ts
- src/lib/weather/useWeather.ts
- src/lib/weather/weather.functions.ts
- src/routes/destination.$id.tsx
- src/routes/__root.tsx
- src/routes/weather.tsx
- src/routes/planner.tsx
- src/test/trip-reminders.test.ts
- src/test/trip-preparation.test.tsx

No GitHub changes have been pushed and no deployment has been made.

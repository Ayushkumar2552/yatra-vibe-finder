# Weather and departure reminders

Weather is provided by Open-Meteo, with current conditions and forecasts where available. Missing responses are shown as unavailable rather than fabricated readings. Date handling uses the destination timezone for weather and the device timezone for departure input.

Signed-in users save destinations and trip reminders in Supabase. Row-level security isolates account data. Local pending writes retry while the site is open.

Reminder delivery runs in the browser: the website must stay open, and sleep/throttling can delay alerts. Optional browser notifications require permission; sound requires interaction. There is no closed-browser push scheduler or email reminder service.

See [README](README.md) for setup, authentication status, deployment, and validation commands. Core implementation lives in `src/lib/weather`, `src/lib/trips`, `src/components/TripPreparation.tsx`, and `src/components/TripReminders.tsx`.

# Render deployment

Live app: https://yatra-vibe-finder.onrender.com/

- Repository: `Ayushkumar2552/yatra-vibe-finder`
- Deployment branch: `deploy/render-supabase`
- Build: `npm ci --include=dev && npm run build:render`
- Start: `npm run start:render`
- Runtime: Node 22, Nitro Node server, Render free web service.
- Database/auth: Supabase; `saved_destinations` and `trip_reminders` use per-user row-level security.

Set `AUTH_PROVIDER=supabase`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` as server environment variables. Use `NODE_ENV=production` and `HOST=0.0.0.0`. The Render build script sets `VITE_AUTH_PROVIDER=supabase`. Never commit credentials or use a service-role key in the client.

Supabase's Site URL is `https://yatra-vibe-finder.onrender.com`; the allowed account redirect is `https://yatra-vibe-finder.onrender.com/account`. Email confirmation is temporarily disabled by the owner's request for the demo. Custom SMTP is not configured. Re-enabling confirmation requires configuring and testing email delivery and the confirmation flow first.

The owner confirmed signup/login and saving work on the deployed application. After application changes, run tests, TypeScript checking, and the Render build, then verify the deployment and account flow. Browser reminder delivery requires the site to remain open.

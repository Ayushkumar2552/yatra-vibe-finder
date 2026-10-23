# Render migration status

Target: AYUSH's workspace (tea-d7l2mid7vvec739qvlo0), GitHub repository Ayushkumar2552/yatra-vibe-finder.

The Node server build and Supabase email/password sign-in are prepared. Render uses AUTH_PROVIDER=supabase and the build uses VITE_AUTH_PROVIDER=supabase. Requests must pass Supabase getUser verification; Render never trusts ChatGPT identity headers. Cookies are HTTP-only and secure in production. No service-role key is required.

Deployment is not complete. Before publishing:

1. Supabase project created: kdxtqigldyuiuzzimpbl (Mumbai), in ayush kumar.
2. Schema applied. Transactional tests verified own-row access, blocked cross-user inserts, and hidden cross-user records. Security advisors returned no issues.
3. Cloud persistence is implemented. Saved destinations use authenticated server calls; alarms retain failed writes in a user-scoped local outbox and retry while the page is open.
4. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Render, configure the Supabase site URL, and verify confirmation email delivery. No credential values belong in this repository.
5. Verify signup, confirmed login, session refresh and logout against the actual project.
6. Push reviewed code to a new GitHub branch, preserving existing main/history. Validate render.yaml with Render CLI before applying it.
7. Deploy and verify public routes, authenticated planner/photo spots, and database persistence. Keep existing Sites deployment unchanged.

Local validation: Render build, TypeScript check, 68 tests passed (one optional live test skipped); three additional offline-sync tests passed. Real account/database tests remain pending provider connection. Render CLI is not installed; Blueprint platform validation is pending.

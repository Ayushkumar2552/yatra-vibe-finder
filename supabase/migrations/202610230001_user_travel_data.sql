-- Apply only to the selected YatraAI Supabase project.
-- Authentication accounts are managed by Supabase Auth, not this schema.
begin;
create table public.saved_destinations (
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id text not null check (length(destination_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, destination_id)
);
create table public.trip_reminders (
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id text not null check (length(destination_id) between 1 and 100),
  departure timestamptz not null,
  items text[] not null default '{}',
  sent text[] not null default '{}',
  snooze_until timestamptz,
  pending text,
  revision integer not null default 1 check (revision > 0),
  primary key (user_id, destination_id)
);
alter table public.saved_destinations enable row level security;
alter table public.trip_reminders enable row level security;
revoke all on public.saved_destinations, public.trip_reminders from anon, authenticated;
grant select, insert, update, delete on public.saved_destinations, public.trip_reminders to authenticated;
create policy own_saved_select on public.saved_destinations for select to authenticated using ((select auth.uid()) = user_id);
create policy own_saved_insert on public.saved_destinations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_saved_update on public.saved_destinations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_saved_delete on public.saved_destinations for delete to authenticated using ((select auth.uid()) = user_id);
create policy own_reminders_select on public.trip_reminders for select to authenticated using ((select auth.uid()) = user_id);
create policy own_reminders_insert on public.trip_reminders for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_reminders_update on public.trip_reminders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_reminders_delete on public.trip_reminders for delete to authenticated using ((select auth.uid()) = user_id);
commit;

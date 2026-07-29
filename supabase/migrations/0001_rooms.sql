-- WaveLang multiplayer rooms.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- One row per game. The entire game state lives in a single JSONB column, which
-- is what makes hotseat and multiplayer share the exact same engine code: the
-- client applies a pure function and writes the result back.

create table if not exists public.rooms (
  code       text primary key,
  state      jsonb not null,
  -- Optimistic concurrency. Every write asserts the version it read, so two
  -- phones acting at the same moment can't silently clobber each other.
  version    integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rooms are ephemeral; this index makes cleaning up stale ones cheap.
create index if not exists rooms_updated_at_idx on public.rooms (updated_at);

alter table public.rooms enable row level security;

-- SECURITY NOTE, deliberate: anyone with the anon key can read or write any
-- room, and the hidden target ships to every client in `state` — the UI simply
-- doesn't render it for non-psychics. This is exactly how Longwave works: it's
-- a party game among friends, and a determined player with DevTools open can
-- always peek. If that ever matters, move `target` into its own column and
-- serve it through a security-definer function that checks the caller is the
-- psychic.
drop policy if exists "anyone can read rooms" on public.rooms;
create policy "anyone can read rooms" on public.rooms for select using (true);

drop policy if exists "anyone can create rooms" on public.rooms;
create policy "anyone can create rooms" on public.rooms for insert with check (true);

drop policy if exists "anyone can update rooms" on public.rooms;
create policy "anyone can update rooms" on public.rooms for update using (true) with check (true);

-- Keep updated_at honest so the cleanup below can trust it.
create or replace function public.touch_room_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_touch_updated_at on public.rooms;
create trigger rooms_touch_updated_at
  before update on public.rooms
  for each row execute function public.touch_room_updated_at();

-- Realtime: clients subscribe to postgres_changes on this table, filtered to
-- their own room code.
do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception
  when duplicate_object then null;
end;
$$;

-- Row-level payloads need REPLICA IDENTITY FULL for realtime to send old values
-- alongside new ones on update.
alter table public.rooms replica identity full;

-- Optional housekeeping: abandoned rooms pile up otherwise. Run by hand, or
-- schedule with pg_cron if the extension is enabled.
--   select cron.schedule('wavelang-cleanup', '0 4 * * *',
--     $$delete from public.rooms where updated_at < now() - interval '24 hours'$$);

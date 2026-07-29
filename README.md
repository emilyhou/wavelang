# WaveLang

An online multiplayer game modeled off of Wavelength where the hint you give has to be an AI startup.

A hidden target sits somewhere on a spectrum like **Vaporware ↔ Actually ships**. One player — the
psychic — can see it. They name an AI company that lands right there, their team rotates the dial to
guess, and the other team bets on which side the real target is. Closer is worth more: 4 points dead
on, then 3, then 2.

Mobile-first, one phone per player, no accounts.

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173 and hit **Play on one device** — that works with no setup at all.

## Multiplayer setup

Rooms are backed by a single Supabase table. Two steps:

**1. Run the migration.** Paste [`supabase/migrations/0001_rooms.sql`](supabase/migrations/0001_rooms.sql)
into your project's SQL editor (Dashboard → SQL Editor → New query) and run it. It creates the
`rooms` table, its policies, and adds it to the realtime publication.

**2. Add your keys.** Copy `.env.example` to `.env.local` and fill in the two values from
Dashboard → Project Settings (Data API for the URL, API Keys for the anon key):

```bash
cp .env.example .env.local
```

Restart `npm run dev`. Create a room, share the `#/room/ABCD` link, and everyone lands in the
same lobby.

Without these, the app still runs — the online buttons are just disabled and say why.

## Game modes

| Mode | Players | How it ends |
| --- | --- | --- |
| **Teams** | 2+ per side | First side to 10 points |
| **Cooperative** | 2+ total | 8 rounds, one shared score |

In Teams mode the non-guessing side gets a bonus point for correctly calling whether the true target
is left or right of the guess — that's what keeps them paying attention.

## How it's put together

```
src/game/engine.ts        Pure rules. No React, no network, no randomness it doesn't own.
src/game/controller.ts    The seam: one interface, two implementations.
src/game/useHotseatRoom   Local state.
src/game/useRoom.ts       Supabase-backed state.
src/data/cards.ts         ~30 spectrum cards.
src/data/startups.ts      ~150 AI companies + the autocomplete search.
src/components/Dial.tsx   The SVG gauge.
```

The engine is pure state-in/state-out functions, which is why hotseat and multiplayer can share every
screen: `GameController` hides where the state actually lives. Multiplayer writes are optimistic and
reconciled with a compare-and-set on a `version` column, so two phones acting at once can't clobber
each other — the losing write re-applies its intent to the fresh state and retries.

Logos come from each company's favicon at render time, with a colored initial tile as fallback. No
API keys, no bundled image assets.

## Known limitations

- **The target isn't secret from a determined player.** It ships to every client inside the room
  state and the UI just doesn't render it for non-psychics — same as
  [Longwave](https://longwave.web.app/). Fine for a party game; see the note in the migration for how
  to lock it down properly if that changes.
- **Rooms are never garbage-collected automatically.** The migration includes a commented-out
  `pg_cron` job for that.

## Scripts

```bash
npm test
```

```bash
npm run build
```

`npm run lint` runs oxlint; `npm run test:watch` re-runs tests on change.

## Where to take it next

- Grow `startups.ts` from ~150 toward 500.
- Write more spectrum cards — the format is two poles of a single arguable axis.
- More visual character. The current look is a plain warm-paper theme; every color is a CSS
  variable in `src/index.css`, so re-theming is a one-file job.

# Blackridge Expedition

A mobile-first, six-player team-building simulation with a shared TV host display and live phone-based decisions.

## What works

- Six named player roles with private, soft incentives
- Shared discussion followed by individual submissions
- Live host dashboard showing submissions and vote totals
- Shared resources, branching consequences, four rounds, survival score
- Mobile browser play. No app installation
- Scenario content stored in `src/scenario.js` for easy revision
- Supabase Realtime synchronization
- Local single-browser demo mode when Supabase variables are absent

## Run locally

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add Supabase credentials for multiplayer use.
4. Run `npm run dev`.
5. Open `http://localhost:5173/?mode=host&room=SUMMIT` on the TV.
6. Players open `http://localhost:5173/?room=SUMMIT` on their phones.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy the project URL and anon key into `.env`.

The included policies are intentionally open for a private event prototype. Before public use, replace them with authenticated or room-token access.

## Deploy

Deploy the folder to Vercel as a Vite project. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.

## Facilitation

Players discuss openly. Each phone displays a private incentive that gently shapes recommendations. Mike's Silent Observer role limits him to one spoken contribution per round. The host reveals the majority decision only after all six players submit.

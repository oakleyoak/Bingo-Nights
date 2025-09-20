Bingo Nights - Starter

This repository is a starter scaffold for a multiplayer Bingo mobile game using React Native (Expo), Supabase for realtime/state/auth, and Netlify for serverless admin functions.

What's included
- `mobile/`: Expo React Native app (client)
- `web-admin/`: simple Netlify-hosted admin and serverless function example
- `supabase/schema.sql`: initial SQL schema for Supabase

Quick start (Windows PowerShell)
1. Install Node.js (LTS) and npm.
2. Install Expo CLI globally if you want: `npm install -g expo-cli` (optional; `npx expo` works too).
3. Install Supabase CLI: follow https://supabase.com/docs/guides/cli
4. Create a Supabase project and note your SUPABASE_URL and SUPABASE_ANON_KEY (and SERVICE_ROLE_KEY for server functions).

Run mobile app
> cd "d:/PROJECT/Game/Bingo Nights/mobile"
> npm install
> npm run start

Run web admin locally
> cd "d:/PROJECT/Game/Bingo Nights/web-admin"
> npm install
> npm run start

Supabase
- Apply the schema: `supabase db push --file ./supabase/schema.sql` (see Supabase CLI docs)
- Use Supabase Realtime and Auth for all online state. No localStorage is used; clients fetch and subscribe to state from Supabase.

Next steps
- Implement auth flows (email/password / magic link)
- Implement lobby, room creation/joining
- Implement realtime game play: calling numbers, claiming bingo, validation via serverless function
- Add tests and CI

Notes
- Do not commit secrets. Use environment variables (or Netlify/EAS secrets) for SUPABASE keys.

Deployment
- Netlify deploys are supported. See `docs/deploy-instructions.md` for step-by-step instructions to create a GitHub repo, connect Netlify, and configure CI.

Netlify deploy badge (replace with actual badge after first deploy):

![Netlify Status](https://api.netlify.com/api/v1/badges/REPLACE_WITH_YOUR_SITE_ID/deploy-status)

# Bingo Nights - Multiplayer Bingo Game

A fully functional multiplayer Bingo mobile game built with React Native (Expo), Supabase for realtime backend, and Netlify for deployment. Features realtime multiplayer gameplay with no local storage - all data synchronized through Supabase.

## 🎯 Project Status: PRODUCTION READY

All core features implemented and tested. Ready for deployment and user testing.

### ✅ What's Working
- **Mobile App**: Complete React Native app with Expo
- **Authentication**: Magic link authentication via Supabase
- **Multiplayer Lobby**: Create and join games in realtime
- **Gameplay**: Realtime bingo card updates, number calling, bingo detection
- **Backend**: Full Supabase integration (Database, Auth, Realtime, Edge Functions)
- **Validation**: Server-side bingo verification
- **Cross-Platform**: iOS, Android, Web support
- **Deployment**: GitHub repo ready, Netlify config prepared

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS)
- Supabase CLI
- Expo CLI (optional)

### Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

### Environment Variables
Create a `.env` file in `mobile/` with:
```bash
SUPABASE_URL=https://oluqgthjdyqffrrbnrls.supabase.co
SUPABASE_ANON_KEY=[Your anon key from Supabase dashboard]
```

## 📱 Features

### Core Gameplay
- **Realtime Multiplayer**: Instant game synchronization
- **Magic Link Auth**: Passwordless authentication
- **Dynamic Bingo Cards**: Unique cards for each player
- **Server Validation**: Prevents cheating with Edge Functions
- **Cross-Platform**: Works on iOS, Android, and Web

### Technical Features
- **No Local Storage**: Fully online, cloud-synced
- **Realtime Updates**: Live game state via Supabase subscriptions
- **Scalable Backend**: Serverless Edge Functions
- **Secure**: Row Level Security on all database operations

## 🏗️ Architecture

### Frontend (React Native + Expo)
- Authentication flow with Supabase Auth
- Lobby system for game management
- Realtime game screen with bingo card
- Web support for browser testing

### Backend (Supabase)
- **Database**: PostgreSQL with custom functions
- **Auth**: Magic link authentication
- **Realtime**: Live subscriptions for game updates
- **Edge Functions**: Server-side validation and number calling

### Database Schema
- `profiles` - User profiles
- `games` - Game sessions
- `players` - Game participants
- `bingo_cards` - Generated bingo cards
- `called_numbers` - Game progress
- `bingo_claims` - Validation requests

## 🚀 Deployment Status

### ✅ GitHub Repository
- **Repository**: `Bingo-Nights`
- **Owner**: `oakleyoak`
- **Status**: Connected and up-to-date

### ✅ Supabase Backend
- **Project URL**: `https://oluqgthjdyqffrrbnrls.supabase.co`
- **Schema**: Applied and tested
- **Edge Functions**: Deployed
  - `callNumber`: Server-side number calling
  - `validateBingo`: Bingo validation
- **Realtime**: Configured and working

### 🔄 Netlify (Web Admin)
- **Site URL**: https://bingonights.netlify.app
- **Admin URL**: https://app.netlify.com/projects/BingoNights
- **Status**: ✅ Deployed and live
- **Build Command**: `echo 'serverless functions'`
- **Functions**: `web-admin/netlify/functions`

## 🧪 Testing

### Database Function Test
```bash
npm install @supabase/supabase-js
node test_verify_bingo.js
```

### Mobile App Testing
1. Start Expo: `npx expo start`
2. Scan QR code with Expo Go
3. Test authentication and gameplay

## 📋 Project Analysis

See [`ANALYSIS.md`](ANALYSIS.md) for detailed project status, component analysis, deployment instructions, and roadmap.

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start mobile app
cd mobile && npx expo start

# Start web admin (optional)
cd web-admin && npm run start
```

### Supabase Management
```bash
# Link project
supabase link --project-ref oluqgthjdyqffrrbnrls

# Apply schema
supabase db push

# Deploy functions
supabase functions deploy
```

## 📚 Documentation

- **[Project Analysis](ANALYSIS.md)**: Detailed status and roadmap
- **[Deploy Instructions](docs/deploy-instructions.md)**: Step-by-step deployment guide
- **[API Reference](docs/api.md)**: Supabase functions documentation

## 🎮 Gameplay

1. **Authentication**: Sign in with magic link
2. **Lobby**: Create new game or join existing
3. **Gameplay**: Watch numbers being called in realtime
4. **Bingo Detection**: Automatic bingo detection
5. **Validation**: Server-side verification prevents false claims

## 🛠️ Technologies Used

- **React Native** + **Expo**: Cross-platform mobile development
- **Supabase**: Backend-as-a-Service (Database, Auth, Realtime)
- **Netlify**: Serverless deployment and functions
- **PostgreSQL**: Database with custom functions
- **TypeScript**: Type-safe development

## 📈 Roadmap

### Completed ✅
- Core multiplayer bingo functionality
- Realtime game synchronization
- Server-side validation
- Cross-platform mobile app
- Supabase backend integration

### Next Steps 🔄
- Deploy web admin to Netlify
- Submit to app stores
- Add game statistics and leaderboards
- Implement additional game modes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React Native, Supabase, and Netlify**

*Last Updated: September 20, 2025*

## Environment Variables

Set these environment variables for the mobile app (e.g., in Expo or .env file):

- SUPABASE_URL = https://oluqgthjdyqffrrbnrls.supabase.co
- SUPABASE_ANON_KEY = [Your anon key from Supabase dashboard]

**Do not commit these to the repo. Use .env files or Expo secrets.**

## Deployed Edge Functions

- callNumber: https://oluqgthjdyqffrrbnrls.supabase.co/functions/v1/callNumber
- validateBingo: https://oluqgthjdyqffrrbnrls.supabase.co/functions/v1/validateBingo

## Testing

After applying the schema, run the test for the `verify_bingo` function:

```bash
npm install @supabase/supabase-js
node test_verify_bingo.js
```

This will test the bingo verification logic.

## Applying the Schema

To apply the Supabase schema:

1. Ensure Supabase CLI is installed and logged in.
2. Link your project: `supabase link --project-ref oluqgthjdyqffrrbnrls`
3. Apply migrations: `supabase db push`

If you encounter hostname issues, verify the DB URL in your Supabase dashboard.

Deployment
- Netlify deploys are supported. See `docs/deploy-instructions.md` for step-by-step instructions to create a GitHub repo, connect Netlify, and configure CI.

Netlify deploy badge (replace with actual badge after first deploy):

![Netlify Status](https://api.netlify.com/api/v1/badges/REPLACE_WITH_YOUR_SITE_ID/deploy-status)

# Bingo Nights 🎲

**Automated Multiplayer Bingo Game** - Numbers called every 5 seconds, compete for points and prizes!

## 🎮 Game Overview

Bingo Nights is an automated multiplayer bingo game where:
- Numbers are called automatically every 5 seconds
- Players get FREE bingo cards when joining games
- Daily login rewards with consecutive day bonuses
- Player levels that increase reward amounts
- Points system rewards top finishers and daily logins
- AI players ensure lively gameplay even with few real players
- Simple, addictive, and social bingo experience

### Key Features
- ✅ **Automated Gameplay**: No waiting for hosts - numbers called every 5 seconds
- ✅ **Free Cards**: Get a free bingo card when joining any game
- ✅ **Daily Login Rewards**: Earn points every day you log in, with bonuses for consecutive days
- ✅ **Player Levels**: Level up to increase your daily reward multipliers
- ✅ **Points System**: Earn points for top placements and daily logins
- ✅ **AI Players**: Always 3 simulated players for lively atmosphere
- ✅ **Real-time Multiplayer**: Join live games with other players
- ✅ **Mobile-First**: Optimized for mobile devices

## 🎯 How to Play

1. **Sign Up/Login** with email and password (get daily rewards automatically!)
2. **Earn Daily Rewards** - Log in daily to earn points, XP, and level up
3. **Join Bingo Night** - Click "Join Bingo Night" to get a FREE bingo card
4. **Watch & Mark** - Numbers called every 5 seconds, mark your card
5. **Call Bingo** - Get 5-in-a-row and claim your placement reward!
6. **Level Up** - Gain XP from games and logins to increase your rewards
7. **Compete** - Top 5 placements get points and XP based on finishing position

### Single Game System
- **One Active Game**: Only one "Bingo Night" game is active at a time
- **Automatic Creation**: New games start automatically when players join
- **Continuous Play**: Games run continuously with automated number calling
- **Fair Competition**: Everyone plays in the same game session

### Points & Rewards System

#### Daily Login Rewards
- **Base Reward**: 10 points per day
- **Level Multiplier**: +10% per level (Level 2 = 11 points, Level 3 = 12.1 points, etc.)
- **Consecutive Bonus**: +5% per consecutive day (2nd day = +5%, 3rd day = +10%, etc.)
- **XP Gain**: 5 base XP + 2 XP per consecutive day
- **Maximum Streak**: No limit - keep logging in for bigger bonuses!

#### Game Placement Rewards
- 🥇 **1st Place**: **100 points** + 50 XP
- 🥈 **2nd Place**: **50 points** + 30 XP
- 🥉 **3rd Place**: **25 points** + 20 XP
- 4️⃣ **4th Place**: **15 points** + 10 XP
- 5️⃣ **5th Place**: **10 points** + 10 XP

#### Leveling System
- **XP Required**: Level × 100 XP (Level 2 needs 200 XP, Level 3 needs 300 XP, etc.)
- **XP Sources**:
  - Daily logins: 5 base + 2 per consecutive day
  - Game placements: 50/30/20/10/10 XP for top 5
- **Benefits**: Higher levels increase daily login reward multipliers (+10% per level)
- **Level-up Notifications**: Automatic alerts when you level up!

### Game Rules
- **Free Cards**: Every player gets 1 free bingo card per game
- **Automated Calling**: Numbers called every 5 seconds automatically
- **Winning**: Get 5-in-a-row (horizontal, vertical, or diagonal)
- **Fair Play**: AI players ensure lively games even with few real players

## 🎯 PROJECT STATUS: UNDER DEVELOPMENT

**Transforming into automated multiplayer bingo game with points system and AI players.**

### Current Vision ✅
- **Automated Gameplay**: Numbers called every 5 seconds automatically
- **Points System**: Earn points for top placements (1st: 100pts, 2nd: 50pts, 3rd: 25pts, 5th: 10pts)
- **Multi-Card Support**: Purchase 1-4 bingo cards per game (10 points each)
- **AI Simulation**: Always show 3 AI players unless 4+ real players join
- **Mobile-Only**: Removing web admin, focusing on core mobile game experience

### What's Working ✅
- **Supabase Backend**: Database schema and edge functions
- **Mobile App**: Basic React Native app with authentication
- **Realtime Features**: Live game synchronization

### What's Being Built 🚧
- **Automated Number Calling**: 5-second intervals until bingo
- **Points & Card System**: Player profiles with points and card purchasing
- **AI Player Simulation**: Simulated players for lively gameplay
- **Multi-Card UI**: Support for up to 4 cards per player
- **Scoring System**: Points allocation for top finishers

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

### Implemented ✅
- **Realtime Multiplayer**: Instant game synchronization via Supabase
- **Magic Link Auth**: Passwordless authentication via Supabase Auth
- **Database Backend**: Complete PostgreSQL schema with custom functions
- **Server-side Validation**: Anti-cheating bingo verification
- **Cross-Platform Support**: iOS, Android, Web via Expo

### In Development 🚧
- **Bingo Validation**: Server-side verification of bingo claims
- **Host Controls**: Number calling and game management interface
- **Enhanced Game Features**: Statistics, leaderboards, multiple game modes

### Planned 🔮
- **Enhanced UI/UX**: Modern design and animations
- **Push Notifications**: Game event notifications
- **Social Features**: Friends, chat, tournaments
- **Analytics**: Game statistics and reporting

## 🏗️ Architecture

### Frontend (React Native + Expo)
- Authentication flow with Supabase Auth
- Lobby system for game management
- Realtime game screen with bingo card
- Web support for browser testing

### Web Admin (Simple HTML/CSS/JS)
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Backend**: Supabase (Database, Auth, Realtime)
- **Icons**: Lucide React (CDN)
- **Hosting**: Simple HTTP server or Netlify

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
# Set up environment variables (one time setup)
.\setup-env.ps1 -SupabaseUrl 'https://your-project.supabase.co' -SupabaseAnonKey 'your-key'

# Or create .env file manually (see .env.example)

# Run the test
node test_verify_bingo.js
```

### Current Issues
- **Game Logic**: Need to implement proper bingo validation flow in mobile app
- **Host Controls**: Add game management features for hosts
- **Integration Tests**: No automated end-to-end testing setup

### Mobile App Testing
1. Install dependencies: `cd mobile && npm install`
2. Start Expo: `npx expo start`
3. **✅ App now loads successfully with Supabase integration**
4. Scan QR code with Expo Go app or open in web browser
5. Test authentication flow and basic game features

## 📋 Project Analysis

See [`ANALYSIS.md`](ANALYSIS.md) for detailed project status, component analysis, deployment instructions, and roadmap.

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start mobile app
cd mobile && npx expo start

# Start web admin (simple HTTP server)
cd web-admin
python -m http.server 3000
# Opens at http://localhost:3000

# Test database connection
node test_verify_bingo.js
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

- **Mobile App**: React Native + Expo
- **Backend**: Supabase (Database, Auth, Realtime, Edge Functions)
- **Database**: PostgreSQL with custom functions and triggers
- **Deployment**: Netlify (mobile app), GitHub (source control)
- **Icons**: Lucide (CDN)
- **Development Tools**: Python HTTP server, PowerShell scripts

## 📈 Roadmap

### Immediate Priorities (Next 1-2 weeks)
- **Automated Game System**: Implement 5-second automatic number calling
- **Points & Profiles**: Add player profiles with points system
- **Multi-Card Support**: Allow purchasing 1-4 cards per game
- **AI Player Simulation**: Show 3 simulated players for lively gameplay
- **Remove Web Admin**: Simplify to mobile-only experience

### Short Term (1-2 months)
- **Scoring System**: Points allocation for 1st, 2nd, 3rd, 5th place
- **Game Results**: Display final standings and points earned
- **UI Polish**: Optimize card layout for multiple cards
- **Performance**: Optimize for smooth 5-second intervals

### Future Enhancements
- **Leaderboards**: Global and weekly rankings
- **Achievements**: Special rewards and milestones
- **Themes**: Different card designs and themes
- **Social Features**: Friend invites and game history

## ⚠️ Important Notes

### Current Status
- **Under Development**: Transforming into automated multiplayer bingo game
- **Mobile-Only Focus**: Web admin being removed for streamlined experience
- **New Features**: Points system, multi-card support, AI players coming soon

### Getting Started (Development)
```bash
# Clone and setup
git clone [repository-url]
cd bingo-nights

# Install dependencies
npm install

# Setup mobile app
cd mobile
npm install
npx expo start
```

### Contributing
This project needs contributors! Key areas for contribution:
- **Automated Game Logic**: Number calling automation and game flow
- **Points System**: Player profiles, scoring, and card purchasing
- **AI Simulation**: Simulated player behavior and game balancing
- **Multi-Card UI**: Mobile interface for managing multiple bingo cards
- **Real-time Features**: Performance optimization for 5-second intervals

See [ANALYSIS.md](ANALYSIS.md) for detailed development roadmap and current issues.

---

**Built with ❤️ using React Native, Supabase, and Netlify**

*Last Updated: September 21, 2025*

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

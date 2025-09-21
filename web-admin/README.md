# Bingo Nights Web Admin

A simple React-based admin dashboard for managing the Bingo Nights game.

## Features

- **Dashboard**: Overview of users, games, and statistics
- **Games Management**: View and manage active games
- **User Management**: Admin tools for user accounts
- **Real-time Stats**: Live updates of game statistics

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for backend/database
- **Lucide React** for icons

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
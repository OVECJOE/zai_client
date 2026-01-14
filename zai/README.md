# Zai Game Client

A production-ready Next.js 16 client application for the Zai strategic hexagonal board game.

## Features

- **Authentication**: Register, login, guest accounts, and account conversion
- **Game Management**: Create games, make moves, resign, view game history
- **Matchmaking**: Join queue, find opponents, view queue statistics
- **Real-time Gameplay**: WebSocket integration for live game updates
- **Leaderboard**: View top players and rankings
- **User Profiles**: View player statistics and game history

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=https://api.zai.com/api/v1
NEXT_PUBLIC_WS_BASE_URL=wss://api.zai.com/ws
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js 16 App Router pages and layouts
- `components/` - React components (UI, auth, game, layout)
- `hooks/` - Custom React hooks (useAuth, useGame, useMatchmaking)
- `lib/` - Core libraries (API client, WebSocket, utilities)
- `store/` - Zustand state management stores
- `types/` - TypeScript type definitions
- `config/` - Configuration constants

## API Integration

All API endpoints from `API_REFERENCE.md` are integrated:

- Authentication endpoints (register, login, guest, convert, refresh, logout)
- User management (profile, update, game history)
- Game management (create, get, make move, resign, move history, active games)
- Matchmaking (join, leave, status, statistics)
- Invitations (create, list, accept, decline)
- Leaderboard (get leaderboard)

## WebSocket Support

Real-time game updates are handled via WebSocket connections. The client automatically:
- Connects to game WebSocket on game load
- Handles reconnection with exponential backoff
- Sends heartbeat pings every 30 seconds
- Processes game state updates, move confirmations, and game end events

## State Management

Uses Zustand for state management with persistence:
- `auth-store`: Authentication state and user data
- `game-store`: Current game state and active games
- `ui-store`: UI state (theme, modals, toasts)

## Styling

Uses Tailwind CSS 4 with the existing color scheme from `globals.css`. All components follow the design system with:
- Consistent spacing and typography
- Responsive layouts
- Accessible components

## Production Ready

This implementation includes:
- Error handling and user feedback
- Loading states
- TypeScript type safety
- Responsive design
- Accessible UI components
- Token refresh handling
- WebSocket reconnection logic

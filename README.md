# Fantasy Assistant - Frontend MVP

This is a UI-only fantasy football assistant application built with React, TypeScript, and TailwindCSS. All Yahoo Fantasy integration is mocked with localStorage persistence to provide a complete frontend experience.

## Features

- **Dashboard** - Overview with quick actions and recommendations
- **Start/Sit Analyzer** - Compare players with confidence scores
- **Waiver Wire** - Browse available players with FAAB guidance
- **Trade Analyzer** - Evaluate trades with value and risk analysis
- **Lineup Optimizer** - Get optimal starting lineups
- **Strength of Schedule** - Matchup difficulty heatmaps
- **Fantasy News** - Latest updates and insights
- **Yahoo Connect** - Mock OAuth flow with league selection

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

## Mock Yahoo Integration

The app simulates a complete Yahoo Fantasy integration:

1. Navigate to `/connect` to "connect" your Yahoo account
2. Select from 3 mock leagues
3. All data (connection status, selected league) persists via localStorage
4. Real roster and free agent data will be mocked until backend is connected

## Architecture

### State Management
- `LeagueContext` manages connection state and persists to localStorage
- React Query handles API state and caching

### Services Layer
- `services/api.ts` - Frontend contracts for all API calls (currently return mocks)
- `services/auth.ts` - Yahoo OAuth simulation (localStorage only)

### Mock Data
- `mocks/mockLeagues.json` - Available fantasy leagues
- `mocks/mockRoster.json` - Team roster data
- `mocks/mockFreeAgents.json` - Available free agents

## Moving to Production

**This is UI-only.** In Cursor, replace `services/api.ts` and `services/auth.ts` with real calls (Next.js API or Express). Keep function signatures identical. Use the stored league info from LeagueContext for requests.

### Required Backend Endpoints

```
GET  /api/me                    # Current user info
GET  /api/yahoo/leagues         # User's Yahoo leagues  
POST /api/yahoo/league          # Set active league
GET  /api/yahoo/roster?week=N   # Team roster for week
GET  /api/yahoo/free-agents     # Available free agents
```

### Environment Variables

```
YAHOO_CLIENT_ID=your_client_id
YAHOO_CLIENT_SECRET=your_client_secret
YAHOO_REDIRECT_URI=your_redirect_uri
```

## File Structure

```
src/
├── context/
│   └── LeagueContext.tsx      # Global state management
├── services/
│   ├── api.ts                 # API contracts (replace with real HTTP)
│   └── auth.ts                # Yahoo OAuth simulation
├── components/
│   ├── ConnectYahooButton.tsx # OAuth initiation
│   ├── LeaguePicker.tsx       # League selection
│   ├── UserBadge.tsx          # Connection status
│   └── ConnectionCallout.tsx  # Connection prompts
├── pages/
│   ├── Connect.tsx            # Yahoo connection flow
│   └── [other pages]          # Feature pages
└── mocks/
    ├── mockLeagues.json       # Demo leagues
    ├── mockRoster.json        # Demo roster
    └── mockFreeAgents.json    # Demo free agents
```

The frontend is fully functional and export-ready for backend integration.
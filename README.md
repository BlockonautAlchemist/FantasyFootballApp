# GridironGuru - Fantasy Football Assistant

A modern, AI-powered fantasy football assistant that helps you make better lineup decisions, analyze trades, and optimize your Yahoo Fantasy Sports team.

## Features

### 🎯 Start/Sit Optimizer
- **AI-Powered Recommendations**: Get intelligent start/sit recommendations based on player status, position eligibility, and league settings
- **Optimal Lineup Builder**: Automatically generates the best possible lineup from your current roster
- **Real-time Yahoo Integration**: Connects directly to your Yahoo Fantasy Sports account
- **Status-Aware Scoring**: Considers player injury status (OUT, IR, Q, etc.) in recommendations
- **Position-Specific Logic**: Handles FLEX positions and position eligibility correctly

### 🔗 Yahoo Fantasy Sports Integration
- **OAuth 2.0 Authentication**: Secure connection to Yahoo Fantasy Sports API
- **League & Team Detection**: Automatically detects your leagues and teams
- **Real-time Data**: Fetches current roster, league settings, and player status
- **Cookie-based Session**: Maintains connection state across sessions

### 📊 Advanced Analytics
- **Trade Analyzer**: Evaluate trade proposals with detailed analysis
- **Waiver Wire Assistant**: Find the best free agents and FAAB recommendations
- **Strength of Schedule**: Visualize upcoming matchups and difficulty
- **News & Updates**: Stay informed with player news and injury updates

## API Endpoints

### Session Management
- `GET /api/session` - Get current session data (league key, team key, connection status)

### Yahoo Fantasy Sports API Proxies
- `GET /api/yahoo/league-settings?league_key={key}` - Get league settings and roster positions
- `GET /api/yahoo/team-roster?team_key={key}&date={YYYY-MM-DD}` - Get team roster (optional date parameter)
- `GET /api/optimal-lineup?league_key={key}&team_key={key}` - Get AI-powered optimal lineup recommendations

### Authentication
- `GET /api/auth/yahoo/config` - Check Yahoo OAuth configuration
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - Logout current user

## Getting Started

### Prerequisites
- Node.js 18+ 
- Yahoo Fantasy Sports account
- Yahoo Developer App (for OAuth)

### Environment Variables
Create a `.env` file with your Yahoo OAuth credentials:

```env
YAHOO_CLIENT_ID=your_client_id
YAHOO_CLIENT_SECRET=your_client_secret
YAHOO_REDIRECT_URI=http://localhost:3000/api/auth/yahoo/callback
SESSION_SECRET=your_session_secret
```

### Installation
```bash
npm install
npm run dev
```

### Yahoo OAuth Setup
1. Create a Yahoo Developer App at [Yahoo Developer Network](https://developer.yahoo.com/apps/)
2. Configure OAuth 2.0 settings with your redirect URI
3. Add Fantasy Sports API permissions
4. Update your `.env` file with the client credentials

## Architecture

### Backend
- **Express.js** - API server with session management
- **OAuth 2.0** - Yahoo Fantasy Sports authentication
- **TypeScript** - Type-safe development
- **Vercel** - Serverless deployment ready

### Frontend
- **React 18** - Modern UI with hooks
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Shared
- **TypeScript Types** - Shared type definitions
- **Scoring Module** - Heuristic scoring algorithms
- **Yahoo API Parsers** - Robust JSON parsing for Yahoo's nested data structure

## Scoring Algorithm

The Start/Sit Optimizer uses a heuristic scoring system:

### Base Position Weights
- **RB**: 90 points (highest priority for FLEX)
- **WR**: 85 points
- **TE**: 70 points  
- **QB**: 75 points
- **K/DEF**: 20 points

### Status Penalties
- **OUT/IR**: -100 points (hard penalty)
- **DL**: -60 points
- **D**: -40 points
- **Q**: -15 points (questionable)
- **NA**: -20 points

### FLEX Logic
- **W/R/T**: Prefers RB > WR > TE
- **Q/W/R/T**: Includes QB in FLEX consideration
- **W/R**: RB or WR only

## Error Handling

The application includes comprehensive error handling:

- **Graceful Degradation**: Falls back to mock data when APIs are unavailable
- **User-Friendly Messages**: Clear error messages for common issues
- **Retry Logic**: Automatic retries for transient failures
- **Status Indicators**: Visual feedback for loading and error states

## Development

### Project Structure
```
GridironGuru/
├── api/                    # Vercel serverless functions
│   ├── session.ts         # Session management
│   ├── yahoo/            # Yahoo API proxies
│   └── optimal-lineup.ts # Lineup optimization
├── client/src/           # React frontend
│   ├── components/       # UI components
│   ├── pages/           # Page components
│   └── services/        # API client
├── shared/              # Shared types and utilities
│   ├── types.ts         # TypeScript definitions
│   └── scoring.ts       # Scoring algorithms
└── server/              # Express server (development)
```

### Key Components
- **StartSit.tsx** - Main Start/Sit Optimizer page
- **ConnectionCallout.tsx** - Yahoo connection status
- **scoring.ts** - Heuristic scoring algorithms
- **session.ts** - Session management API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
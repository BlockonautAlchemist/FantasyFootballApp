# Yahoo League Selector Implementation

This document describes the implementation of the Yahoo League Selector that appears after successful Yahoo OAuth login.

## Overview

The Yahoo League Selector provides a seamless flow for users to:
1. Complete Yahoo OAuth authentication
2. Select their preferred fantasy league from available leagues
3. Persist the selection for future use

## Architecture

### Frontend Components

#### `LeaguePicker.tsx`
- **Location**: `client/src/components/LeaguePicker.tsx`
- **Purpose**: Main component for league selection UI
- **Features**:
  - Fetches leagues from Yahoo API via `/api/yahoo/leagues`
  - Displays leagues in a radio button list format
  - Shows league details (name, season, scoring type, team count)
  - Handles selection and submission to `/api/league`
  - Provides loading, error, and empty states

#### `Connect.tsx` (Updated)
- **Location**: `client/src/pages/Connect.tsx`
- **Purpose**: Main connection page that orchestrates the flow
- **Features**:
  - Detects OAuth success via URL parameters
  - Shows league picker when connected but no league selected
  - Displays success state when league is selected
  - Provides "Change League" functionality

### Backend API Routes

#### `GET /api/yahoo/leagues`
- **Purpose**: Fetch user's Yahoo leagues
- **Authentication**: Requires valid session
- **Response**: Array of league objects with `league_key`, `name`, `season`, etc.
- **Implementation**: Uses OAuth 2.0 Bearer token to call Yahoo API

#### `POST /api/league`
- **Purpose**: Set the selected league
- **Body**: `{ league_key: string }`
- **Features**:
  - Links league to user in database
  - Sets HTTP-only cookie `yahoo_league_key`
  - Returns success confirmation

#### `GET /api/yahoo/proxy`
- **Purpose**: Proxy for Yahoo API requests
- **Usage**: Used by client-side Yahoo helpers
- **Security**: Validates session and token before proxying

### Utility Files

#### `lib/yahoo.ts`
- **Location**: `client/src/lib/yahoo.ts`
- **Purpose**: Yahoo API helper functions
- **Key Functions**:
  - `getAccessTokenFromServer()`: Gets token from session
  - `yahooFetch()`: Makes authenticated requests to Yahoo API
  - `getUserLeagues()`: Fetches and parses user leagues
  - `parseLeaguesFromYahooJson()`: Safely parses Yahoo's nested JSON

#### `types/yahoo.ts`
- **Location**: `client/src/types/yahoo.ts`
- **Purpose**: TypeScript type definitions
- **Key Types**:
  - `League`: Main league object structure
  - `YahooApiResponse`: Yahoo API response structure
  - `parseLeaguesFromYahooJson()`: Safe parser function

#### `lib/cookies.ts`
- **Location**: `client/src/lib/cookies.ts`
- **Purpose**: Cookie utility functions
- **Features**: Secure cookie configuration for league persistence

## Data Flow

1. **OAuth Completion**: User completes Yahoo OAuth and is redirected to `/connect?auth=success`
2. **League Detection**: Connect page detects OAuth success and shows league picker
3. **League Fetching**: LeaguePicker fetches leagues via `/api/yahoo/leagues`
4. **League Selection**: User selects a league from the radio button list
5. **League Persistence**: Selection is saved via `/api/league` endpoint
6. **State Update**: Frontend context is updated with selected league
7. **Navigation**: User is redirected to dashboard or success page

## Security Features

- **HTTP-Only Cookies**: League selection stored in secure HTTP-only cookies
- **Session Validation**: All API endpoints validate user session
- **Token Management**: OAuth 2.0 tokens handled server-side only
- **Error Handling**: Graceful handling of token expiry and API errors

## Error Handling

- **Token Expiry**: Detects 401 responses and shows appropriate error messages
- **Network Errors**: Retry mechanisms and user-friendly error messages
- **Empty States**: Handles cases where no leagues are found
- **Loading States**: Shows loading indicators during API calls

## Configuration

### Environment Variables
- `YAHOO_CLIENT_ID`: Yahoo OAuth client ID
- `YAHOO_CLIENT_SECRET`: Yahoo OAuth client secret
- `YAHOO_REDIRECT_URI`: OAuth redirect URI
- `SESSION_SECRET`: Session encryption secret

### Cookie Configuration
```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 365 // 1 year
}
```

## Usage

### For Users
1. Click "Connect with Yahoo" on the Connect page
2. Complete Yahoo OAuth flow
3. Select your preferred league from the list
4. Click "Continue" to save selection
5. Access all fantasy tools with your league data

### For Developers
The implementation follows the existing patterns in the codebase:
- Uses existing `LeagueContext` for state management
- Integrates with existing OAuth flow
- Maintains compatibility with existing league linking system
- Uses established UI components and styling

## Future Enhancements

- **Token Refresh**: Implement automatic token refresh when expired
- **Multiple Leagues**: Support for managing multiple linked leagues
- **League Switching**: Quick league switching without full re-authentication
- **Caching**: Implement league data caching for better performance

# Start/Sit Assistant Setup Guide

This guide explains how to set up the functional start/sit assistant that integrates with Yahoo Fantasy Sports API using OAuth 2.0.

## Overview

The start/sit assistant now provides real data-driven recommendations by:
1. Connecting to Yahoo Fantasy Sports via OAuth 2.0
2. Fetching real player statistics and projections
3. Analyzing multiple factors to provide intelligent recommendations
4. Showing confidence levels and reasoning

## API Endpoints Created

### 1. `/api/fantasy` (Consolidated Endpoint)
This single endpoint handles multiple fantasy sports operations based on the `action` query parameter:

#### Player Search: `GET /api/fantasy?action=search&q=player_name`
- **Purpose**: Searches for players in the user's Yahoo leagues
- **Input**: `?action=search&q=player_name`
- **Output**: Array of matching players with IDs

#### Player Stats: `GET /api/fantasy?action=stats&playerId=id&week=number`
- **Purpose**: Gets comprehensive player statistics
- **Input**: `?action=stats&playerId=id&week=number`
- **Output**: Player stats including projections, historical data, and context

#### Start/Sit Analysis: `POST /api/fantasy?action=start-sit`
- **Purpose**: Analyzes two players and provides start/sit recommendations
- **Input**: `{ playerAId, playerBId, week, scoring }`
- **Output**: Recommendation with confidence, reasons, and player comparison data

## OAuth 2.0 Implementation

The app uses Yahoo's OAuth 2.0 flow as documented in the [Yahoo Sign-In documentation](https://developer.yahoo.com/sign-in-with-yahoo/):

1. **Authorization Request**: `/api/auth/yahoo/start`
2. **Callback Handling**: `/api/auth/yahoo/callback`
3. **Token Refresh**: `/api/auth/yahoo/refresh`

### Required Environment Variables

```env
YAHOO_CLIENT_ID=your_client_id
YAHOO_CLIENT_SECRET=your_client_secret
YAHOO_REDIRECT_URI=https://your-domain.com/api/auth/yahoo/callback
```

### Yahoo App Setup

1. Go to [Yahoo Developer Network](https://developer.yahoo.com/apps/)
2. Create a new app with the following settings:
   - **App Type**: Web Application
   - **Scopes**: `fspt-r fspt-w profile email openid`
   - **Redirect URI**: Your callback URL
3. Copy the Client ID and Client Secret to your environment variables

## Frontend Integration

### LeagueContext
The app uses a `LeagueContext` to manage connection state:
- `connected`: Boolean indicating if user is authenticated
- `linkedLeague`: Selected league information
- `user`: User profile data

### StartSit Page Features
- **Connection Check**: Only allows analysis when connected
- **Player Search**: Real-time search using Yahoo API
- **Smart Recommendations**: Based on multiple factors:
  - Recent performance (last 4 games)
  - Projected points
  - Target share (for WR/TE)
  - Injury status
  - Snap percentage
  - Strength of schedule

## Data Sources

### Yahoo Fantasy Sports API
The app fetches data from these Yahoo endpoints:
- `https://fantasysports.yahooapis.com/fantasy/v2/player/{id}/stats`
- `https://fantasysports.yahooapis.com/fantasy/v2/player/{id}`
- `https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues`

### Analysis Factors
1. **Recent Performance**: Average fantasy points from last 4 games
2. **Projections**: Yahoo's projected fantasy points
3. **Usage Metrics**: Target share, snap percentage
4. **Health Status**: Injury reports and status
5. **Matchup Context**: Opponent strength (future enhancement)

## Error Handling

The app includes comprehensive error handling:
- **Authentication Errors**: Redirects to connection flow
- **API Errors**: Falls back to mock data for development
- **Network Errors**: Graceful degradation with user feedback

## Development vs Production

### Development Mode
- Uses mock data when Yahoo API is unavailable
- Provides sample players for testing
- Shows connection prompts

### Production Mode
- Requires valid Yahoo OAuth credentials
- Uses real Yahoo Fantasy Sports data
- Implements proper error handling and rate limiting

## Testing

To test the start/sit functionality:

1. **Connect Account**: Go to `/connect` and link your Yahoo account
2. **Select League**: Choose a league from your Yahoo leagues
3. **Search Players**: Use the player search to find players
4. **Compare**: Select two players and get recommendations

## Future Enhancements

1. **Advanced Analytics**: More sophisticated algorithms
2. **Historical Data**: Better trend analysis
3. **Injury Reports**: Real-time injury status
4. **Weather Impact**: Weather-based adjustments
5. **Expert Consensus**: Integration with expert rankings

## Troubleshooting

### Common Issues

1. **"Not authenticated" error**
   - Check if Yahoo OAuth is properly configured
   - Verify environment variables are set
   - Clear browser cookies and try again

2. **"Failed to fetch player stats" error**
   - Check Yahoo API rate limits
   - Verify player IDs are valid
   - Check network connectivity

3. **No search results**
   - Ensure user has active Yahoo leagues
   - Check if leagues are NFL fantasy football
   - Verify OAuth scopes include `fspt-r`

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

This will log API requests and responses for troubleshooting.

## Security Considerations

1. **OAuth 2.0**: Uses secure OAuth 2.0 flow with PKCE
2. **Token Storage**: Access tokens stored in secure HTTP-only cookies
3. **API Security**: All endpoints validate authentication
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Data Privacy**: Only fetches necessary user data

## Performance Optimization

1. **Caching**: Cache player data to reduce API calls
2. **Batch Requests**: Combine multiple API calls where possible
3. **Lazy Loading**: Load data only when needed
4. **Error Boundaries**: Graceful handling of API failures

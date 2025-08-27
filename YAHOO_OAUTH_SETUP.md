# Yahoo OAuth Setup Guide

This guide explains how to configure Yahoo OAuth for your fantasy football application.

## Prerequisites

1. A Yahoo account
2. Access to the Yahoo Developer Network
3. Your application domain (for production) or localhost (for development)

## Step 1: Create Yahoo Developer Application

1. Go to [Yahoo Developer Network](https://developer.yahoo.com)
2. Sign in with your Yahoo account
3. Navigate to "My Apps" and click "Create an App"
4. Fill out the application details:
   - **Application Name**: Your app name (e.g., "Fantasy Football Assistant")
   - **Application Type**: Web Application
   - **Description**: Brief description of your app
   - **Home Page URL**: Your application's home page
   - **Redirect URI(s)**: 
     - For development: `http://localhost:5000/api/auth/yahoo/callback`
     - For production: `https://yourdomain.com/api/auth/yahoo/callback`
   - **API Permissions**: Select "Fantasy Sports" with Read/Write access

5. Submit the application and note your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Yahoo credentials:
   ```env
   YAHOO_CLIENT_ID=your_yahoo_client_id_here
   YAHOO_CLIENT_SECRET=your_yahoo_client_secret_here
   YAHOO_REDIRECT_URI=http://localhost:5000/api/auth/yahoo/callback
   SESSION_SECRET=your_secure_session_secret_here
   ```

   **Important**: Keep your Client Secret secure and never commit it to version control.

## Step 3: Database Setup

The application requires a database to store user sessions and Yahoo tokens. Update your `DATABASE_URL` in the `.env` file if using a real database, or the in-memory storage will be used for development.

Run database migrations:
```bash
npm run db:push
```

## Step 4: Yahoo Fantasy Sports API Integration

### Supported Features

The integration supports the following Yahoo Fantasy Sports API features:

1. **User Authentication**: OAuth 1.0a flow with Yahoo
2. **League Management**: Fetch and link user's fantasy leagues
3. **Team Data**: Access team rosters and information
4. **Player Data**: Get free agents, waivers, and player information
5. **Transactions**: Add/drop players, place waiver claims
6. **Token Management**: Automatic token refresh using session handles

### API Endpoints

#### Authentication Endpoints

- `GET /api/auth/yahoo/start` - Initiate Yahoo OAuth flow
- `GET /api/auth/yahoo/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - Logout and clear session

#### League Endpoints

- `GET /api/yahoo/leagues` - Get user's Yahoo leagues
- `POST /api/yahoo/leagues/:leagueId/link` - Link a specific league
- `GET /api/yahoo/leagues/linked` - Get currently linked league

### Frontend Integration

The frontend components have been updated to support real Yahoo OAuth:

#### ConnectYahooButton Component

The `ConnectYahooButton` component now:
- Redirects to Yahoo OAuth when clicked
- Handles OAuth return parameters
- Manages connection state during the flow
- Automatically completes authentication on return

#### LeagueContext Updates

The `LeagueContext` has been enhanced with:
- Session-based authentication checking
- Automatic data refresh from backend
- Proper logout handling
- Loading states for better UX

## Step 5: Testing the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to your app (usually `http://localhost:5000`)

3. Click "Connect with Yahoo" button

4. You'll be redirected to Yahoo for authentication

5. After granting permissions, you'll be redirected back to your app

6. Your Yahoo leagues should now be available in the League Picker

## Security Considerations

1. **Environment Variables**: Never commit actual Yahoo credentials to your repository [[memory:7023297]]

2. **Session Security**: The session secret should be a strong, random string

3. **HTTPS in Production**: Always use HTTPS in production environments

4. **Token Storage**: Yahoo tokens are stored securely in the database with proper encryption

5. **CORS Configuration**: Ensure your CORS settings only allow your domain

## Troubleshooting

### Common Issues

1. **"OAuth token not found" error**
   - Check that your Yahoo credentials are correct
   - Verify the redirect URI matches exactly

2. **"Failed to get Yahoo user ID" error**
   - Ensure Fantasy Sports permission is granted in your Yahoo app
   - Check that the user has at least one fantasy league

3. **Session issues**
   - Verify SESSION_SECRET is set in environment variables
   - Check that cookies are enabled in your browser

4. **API errors**
   - Check the browser console and server logs for detailed error messages
   - Verify your Yahoo app has the correct permissions

### Debug Mode

To enable debug mode for OAuth requests, set the following environment variable:
```env
DEBUG=oauth*
```

## Yahoo API Rate Limits

Yahoo has rate limits on their Fantasy Sports API:
- 999 requests per resource per hour for unauthenticated requests
- Higher limits for authenticated requests
- Be mindful of these limits when making multiple API calls

## Production Deployment

When deploying to production:

1. Update your Yahoo app's redirect URI to your production domain
2. Set `NODE_ENV=production` in your environment
3. Use a secure session secret
4. Enable HTTPS
5. Configure proper database connection
6. Monitor API usage and error rates

## Additional Resources

- [Yahoo Fantasy Sports API Documentation](https://developer.yahoo.com/fantasysports/guide/)
- [OAuth 1.0a Specification](https://tools.ietf.org/html/rfc5849)
- [Express Session Documentation](https://github.com/expressjs/session)

For questions or issues, check the server logs and browser console for detailed error messages.

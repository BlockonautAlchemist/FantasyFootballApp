import { Router } from 'express';
import fetch from 'node-fetch';
import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { storage } from './storage.js';

// In-memory storage for OAuth state (in production, use Redis or database)
const oauthStates = new Map<string, { expiresAt: number }>();

// Yahoo OAuth 2.0 endpoints (from official documentation)
const YAHOO_AUTHORIZE_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Clean up expired OAuth states
 */
function cleanupExpiredStates(): void {
  const now = Date.now();
  for (const [state, data] of Array.from(oauthStates.entries())) {
    if (data.expiresAt < now) {
      oauthStates.delete(state);
    }
  }
}

export const yahooAuthRouter = Router();

/**
 * GET /auth/yahoo/start
 * Initiates the OAuth 2.0 flow
 */
yahooAuthRouter.get('/start', (req: Request, res: Response) => {
  try {
    // Clean up expired states periodically
    cleanupExpiredStates();

    // Generate state for CSRF protection
    const state = generateState();

    // Store state (expires in 10 minutes)
    oauthStates.set(state, {
      expiresAt: Date.now() + (10 * 60 * 1000)
    });

    // Build authorization URL (matching Yahoo OAuth 2.0 specification)
    const params = new URLSearchParams({
      client_id: process.env.YAHOO_CLIENT_ID!,
      redirect_uri: process.env.YAHOO_REDIRECT_URI!,
      response_type: 'code',
      scope: 'openid profile',
      state,
      language: 'en-us'
    });

    const authUrl = `${YAHOO_AUTHORIZE_URL}?${params.toString()}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Yahoo OAuth start error:', error);
    res.status(500).json({ error: 'Failed to initiate Yahoo authentication' });
  }
});

/**
 * GET /auth/yahoo/callback
 * Handles the OAuth callback and exchanges code for tokens
 */
yahooAuthRouter.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    console.log('OAuth callback received:', {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!oauthError,
      query: req.query
    });

    // Handle OAuth errors
    if (oauthError) {
      console.error('Yahoo OAuth error:', oauthError);
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&reason=${oauthError}`);
    }

    if (!code || !state) {
      console.error('Missing authorization code or state:', { code: !!code, state: !!state });
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    // Validate state
    const stateData = oauthStates.get(state as string);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    // Remove used state
    oauthStates.delete(state as string);

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code as string);

    if (!tokenResponse) {
      console.error('Token exchange failed - redirecting with error');
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&reason=token_exchange_failed`);
    }

    console.log('Token response received:', {
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in
    });

    // Get user profile using access token
    console.log('About to fetch profile...');
    const userProfile = await getYahooUserProfile(tokenResponse.access_token);
    console.log('Profile fetch result:', userProfile);

    if (!userProfile) {
      console.error('Failed to get user profile - redirecting with error');
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&reason=profile_fetch_failed`);
    }

    // Extract user information from profile (handle different response formats)
    const yahooUserId = userProfile.guid || userProfile.sub || userProfile.id;
    const displayName = userProfile.nickname || userProfile.name || userProfile.displayName || `Yahoo User ${yahooUserId}`;
    
    console.log('Extracted user info:', { yahooUserId, displayName });
    
    if (!yahooUserId) {
      console.error('No user ID found in profile:', userProfile);
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&reason=invalid_profile`);
    }

    // Handle user creation/update
    let user = await storage.getUserByYahooId(yahooUserId);

    if (!user) {
      // Create new user
      user = await storage.createUser({
        username: `yahoo_${yahooUserId}`,
        password: '', // Yahoo users don't need password
      });

      // Update with Yahoo data
      user = await storage.updateUser(user.id, {
        yahooUserId,
        displayName,
      });
    } else {
      // Update existing user with latest display name
      user = await storage.updateUser(user.id, {
        displayName,
      });
    }

    if (!user) {
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&reason=user_creation_failed`);
    }

    // Store Yahoo token
    const existingToken = await storage.getYahooToken(user.id);

    const tokenData = {
      userId: user.id,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || '',
      tokenSecret: '', // Not used in OAuth 2.0
      sessionHandle: '', // Not used in OAuth 2.0
      expiresAt: tokenResponse.expires_in ? new Date(Date.now() + (tokenResponse.expires_in * 1000)) : null,
    };

    if (existingToken) {
      await storage.updateYahooToken(user.id, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenSecret: '',
        sessionHandle: '',
        expiresAt: tokenData.expiresAt,
      });
    } else {
      await storage.createYahooToken(tokenData);
    }

    // Store user in session
    (req.session as any).userId = user.id;

    // Redirect to frontend with success
    res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=success`);
  } catch (error) {
    console.error('Yahoo OAuth callback error:', error);
    res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error`);
  }
});

/**
 * POST /auth/yahoo/refresh
 * Refreshes an access token using refresh token
 */
yahooAuthRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = await storage.getYahooToken(userId);
    if (!token || !token.refreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    // Check if token is expired
    if (token.expiresAt && token.expiresAt <= new Date()) {
      // Exchange refresh token for new tokens
      const newTokens = await refreshAccessToken(token.refreshToken);

      if (!newTokens) {
        return res.status(400).json({ error: 'Failed to refresh token' });
      }

      // Update token in database
      await storage.updateYahooToken(userId, {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || token.refreshToken,
        expiresAt: newTokens.expires_in ? new Date(Date.now() + (newTokens.expires_in * 1000)) : null,
      });

      res.json({
        access_token: newTokens.access_token,
        expires_in: newTokens.expires_in,
        token_type: newTokens.token_type
      });
    } else {
      // Token is still valid
      res.json({
        access_token: token.accessToken,
        expires_in: token.expiresAt ? Math.floor((token.expiresAt.getTime() - Date.now()) / 1000) : null,
        token_type: 'Bearer'
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Exchange authorization code for tokens (matching Yahoo OAuth 2.0 specification)
 */
async function exchangeCodeForTokens(code: string): Promise<any> {
  try {
    console.log('Exchanging code for tokens:', { code: code.substring(0, 10) + '...' });
    
    const response = await fetch(YAHOO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.YAHOO_REDIRECT_URI!,
        client_id: process.env.YAHOO_CLIENT_ID!,
        client_secret: process.env.YAHOO_CLIENT_SECRET!
      })
    });

    console.log('Token exchange response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);
      return null;
    }

    const tokenData = await response.json() as any;
    console.log('Token exchange successful:', { 
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });
    return tokenData;
  } catch (error) {
    console.error('Token exchange error:', error);
    return null;
  }
}

/**
 * Refresh access token using refresh token (matching Yahoo OAuth 2.0 specification)
 */
async function refreshAccessToken(refreshToken: string): Promise<any> {
  try {
    const response = await fetch(YAHOO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        redirect_uri: process.env.YAHOO_REDIRECT_URI!,
        client_id: process.env.YAHOO_CLIENT_ID!,
        client_secret: process.env.YAHOO_CLIENT_SECRET!
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', response.status, errorText);
      return null;
    }

    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Get Yahoo user profile using access token
 */
async function getYahooUserProfile(accessToken: string): Promise<any> {
  try {
    console.log('Fetching profile with token:', accessToken.substring(0, 10) + '...');
    
    // Try the OpenID Connect userinfo endpoint first
    let response = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'FantasyFootballApp/1.0'
      }
    });

    console.log('Profile response status:', response.status);
    console.log('Profile response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile fetch failed:', response.status, errorText);
      
      // If OpenID endpoint fails, try the legacy Yahoo profile endpoint
      console.log('Trying fallback profile endpoint...');
      response = await fetch('https://api.login.yahoo.com/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'User-Agent': 'FantasyFootballApp/1.0'
        }
      });

      console.log('Fallback profile response status:', response.status);
      
      if (!response.ok) {
        const fallbackErrorText = await response.text();
        console.error('Fallback profile fetch also failed:', response.status, fallbackErrorText);
        return null;
      }
    }

    const profile = await response.json();
    console.log('Profile data received:', profile);
    return profile;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

export default yahooAuthRouter;

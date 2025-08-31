import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Verify required environment variables are present
  const clientId = process.env.YAHOO_CLIENT_ID;
  const redirectUri = process.env.YAHOO_REDIRECT_URI;
  
  if (!clientId) {
    return res.status(500).json({ 
      error: 'YAHOO_CLIENT_ID environment variable is missing',
      hasClientId: false,
      hasRedirectUri: !!redirectUri
    });
  }
  
  if (!redirectUri) {
    return res.status(500).json({ 
      error: 'YAHOO_REDIRECT_URI environment variable is missing',
      hasClientId: true,
      hasRedirectUri: false
    });
  }

  // Step 2: Generate random state for CSRF protection
  // This proves we can generate secure random values for OAuth state
  const state = randomBytes(8).toString('hex'); // 16 hex characters

  // Step 3: Build Yahoo OAuth 2.0 authorization URL with exact parameters
  // This verifies proper URL construction and parameter encoding
  const YAHOO_AUTHORIZE_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri, // URLSearchParams automatically URL-encodes
    response_type: 'code',
    scope: 'fspt-r fspt-w openid email profile',
    state: state,
    language: 'en-us'
  });

  const authorizeUrl = `${YAHOO_AUTHORIZE_URL}?${params.toString()}`;

  // Step 4: Return exact JSON structure with parameter echo for verification
  // This allows comparison of sent vs received parameters in callback
  res.status(200).json({
    authorizeUrl,
    paramsEcho: {
      clientIdLast6: clientId.slice(-6), // Last 6 chars for verification without exposing full ID
      redirectUri: redirectUri,
      scopes: "fspt-r fspt-w openid email profile",
      responseType: "code",
      state: state
    }
  });
}

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

  // Step 3: Build minimal Yahoo OAuth 2.0 authorization URL
  // We start with only "fspt-r" scope to rule out scope-related issues.
  // Once this minimal flow works, we'll add "fspt-w", then "openid email profile"
  const base = "https://api.login.yahoo.com/oauth2/request_auth";
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: encodeURIComponent(redirectUri), // Explicit URL encoding
    scope: 'fspt-r', // Minimal scope to test basic OAuth flow
    state: state
  });

  const authorizeUrl = `${base}?${params.toString()}`;

  // Step 4: Return exact JSON structure with parameter echo for verification
  res.status(200).json({
    authorizeUrl,
    echo: {
      clientIdLast6: clientId.slice(-6), // Last 6 chars for verification without exposing full ID
      redirectUri: redirectUri,
      scope: "fspt-r",
      responseType: "code",
      state: state
    }
  });
}

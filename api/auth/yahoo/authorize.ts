import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  // Step 2: Build Yahoo OAuth 2.0 authorization URL
  // This verifies that we can construct the proper OAuth flow URL
  const YAHOO_AUTHORIZE_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'fspt-r fspt-w openid email profile',
    language: 'en-us'
  });

  const authorizeUrl = `${YAHOO_AUTHORIZE_URL}?${params.toString()}`;

  // Step 3: Return the authorization URL for testing
  // This allows manual testing of the OAuth flow without automatic redirects
  res.status(200).json({
    authorizeUrl,
    clientId: `${clientId.substring(0, 8)}...`, // Show partial ID for verification
    redirectUri,
    scopes: 'fspt-r fspt-w openid email profile'
  });
}

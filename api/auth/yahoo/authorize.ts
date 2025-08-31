import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Read environment variables
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const redirectUri = process.env.YAHOO_REDIRECT_URI!.trim();
  
  // Read optional scope from query parameter, fallback to environment variable or default
  const scope = (req.query.scope as string)?.trim() || (process.env.YAHOO_REQUESTED_SCOPES || 'fspt-r').trim();
  
  // Generate a 16-hex state (no hyphens)
  const state = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  // Build the URL with URLSearchParams (so redirect_uri is encoded ONCE)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    state: state
  });

  const authorizeUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;

  return res.status(200).json({
    authorizeUrl,
    echo: { clientIdLast6: clientId.slice(-6), redirectUri, scope }
  });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Read environment variables
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const redirectUri = process.env.YAHOO_REDIRECT_URI!.trim();
  const scope = (req.query.scope as string)?.trim() || (process.env.YAHOO_REQUESTED_SCOPES || 'fspt-r').trim();
  
  // Generate state (16 hex) and nonce (16 hex) if openid scope is requested
  const state = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const hasOpenId = scope.includes('openid');
  const nonce = hasOpenId ? crypto.randomUUID().replace(/-/g, '').slice(0, 16) : null;

  // Set cookies
  res.setHeader('Set-Cookie', [
    `yahoo_state=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`,
    ...(nonce ? [`yahoo_nonce=${nonce}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`] : [])
  ]);

  // Build the authorize URL with URLSearchParams (so redirect_uri is encoded once)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    state: state,
    ...(nonce ? { nonce: nonce } : {})
  });

  const authorizeUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;

  return res.status(200).json({
    authorizeUrl,
    echo: { 
      clientIdLast6: clientId.slice(-6), 
      redirectUri, 
      scope, 
      hasNonce: hasOpenId 
    }
  });
}

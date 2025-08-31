import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const redirectUri = process.env.YAHOO_REDIRECT_URI!.trim(); // EXACT string as in Yahoo console
  const state = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  // DO NOT pre-encode redirectUri; URLSearchParams will encode ONCE.
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'fspt-r',
    state
  });

  const authorizeUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;

  return res.status(200).json({
    authorizeUrl,
    echo: { clientIdLast6: clientId.slice(-6), redirectUri, scope: 'fspt-r' }
  });
}

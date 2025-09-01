import type { VercelRequest, VercelResponse } from '@vercel/node';

function buildAuthorizeUrl(req: VercelRequest, res: VercelResponse, scopeOverride?: string) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const redirectUri = process.env.YAHOO_REDIRECT_URI!.trim();
  const DEFAULT = (process.env.YAHOO_REQUESTED_SCOPES || 'openid profile email fspt-w').trim();

  const raw = (scopeOverride && scopeOverride.trim()) ||
              (typeof req.query.scope === 'string' && req.query.scope.trim()) ||
              DEFAULT;

  // sanitize to allowed scopes
  const ALLOWED = new Set(['fspt-r','fspt-w','openid','email','profile']);
  const scope = raw.replace(/[,\s;]+/g,' ').trim().split(' ').filter(s => ALLOWED.has(s)).join(' ');

  const state = crypto.randomUUID().replace(/-/g,'').slice(0,16);
  const needsOIDC = /\bopenid\b/.test(scope);
  const nonce = needsOIDC ? crypto.randomUUID().replace(/-/g,'').slice(0,16) : undefined;

  // CSRF/OIDC cookies
  const cookies = [
    `yahoo_state=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`,
  ];
  if (needsOIDC) cookies.push(`yahoo_nonce=${nonce}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`);
  res.setHeader('Set-Cookie', cookies);

  // Single-encode via URLSearchParams
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state
  });
  if (needsOIDC) params.set('nonce', nonce!);

  const authorizeUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
  return authorizeUrl;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authorizeUrl = buildAuthorizeUrl(req, res);
    // 302 redirect to Yahoo
    res.status(302).setHeader('Location', authorizeUrl).end();
  } catch (e) {
    res.status(500).json({ error: 'start_failed', message: (e as Error).message });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const redirectUri = process.env.YAHOO_REDIRECT_URI!.trim();
  
  // Single source of truth for scopes with sanitization
  const defaultScopes = (process.env.YAHOO_REQUESTED_SCOPES || 'fspt-r fspt-w').trim();
  const raw = (typeof req.query.scope === 'string' && req.query.scope.trim()) ? req.query.scope : defaultScopes;

  // Sanitize scopes
  // allow-list only these tokens
  const ALLOWED = new Set(['fspt-r','fspt-w','openid','email','profile']);
  // turn commas/semicolons into spaces, collapse whitespace
  const cleaned = raw.replace(/[,\s;]+/g,' ').trim();
  const scope = cleaned.split(' ').filter(s => ALLOWED.has(s)).join(' ');

  const state = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const needsOIDC = /\bopenid\b/.test(scope);
  const nonce = needsOIDC ? crypto.randomUUID().replace(/-/g, '').slice(0, 16) : undefined;

  // CSRF / OIDC cookies
  res.setHeader('Set-Cookie', [
    `yahoo_state=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`,
    ...(needsOIDC ? [`yahoo_nonce=${nonce}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`] : [])
  ]);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri, // single-encode via URLSearchParams
    scope,
    state
  });
  if (needsOIDC) params.set('nonce', nonce!);

  const authorizeUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
  return res.status(200).json({ authorizeUrl, echo: { scope, hasNonce: needsOIDC } });
}

// /api/league.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

function cookieString(
  name: string,
  value: string,
  maxAge = 60 * 60 * 24 * 365 // 1 year (seconds)
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    'HttpOnly',
    'Secure',
  ];
  return parts.join('; ');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // body may be string or object depending on runtime
  let body: any = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const league_key = body?.league_key;
  if (!league_key || typeof league_key !== 'string') {
    return res.status(400).json({ error: 'invalid_league_key' });
  }

  // Persist selection in an HTTP-only cookie
  res.setHeader('Set-Cookie', cookieString('yahoo_league_key', league_key));
  return res.status(200).json({ ok: true, league_key });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || getCookie(req, 'yahoo_access');
  const league_key = String(req.query.league_key || '');
  
  if (!token || !league_key) return res.status(400).json({ error: 'missing_param' });

  try {
    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${league_key}/settings?format=json`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const ct = r.headers.get('content-type') || '';
    const text = await r.text();
    
    if (!r.ok || !ct.includes('application/json')) {
      console.error('Yahoo league settings error:', r.status, text.slice(0, 200));
      return res.status(r.status).json({ error: 'yahoo_error', snippet: text.slice(0,200) });
    }
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('League settings API error:', error);
    return res.status(500).json({ error: 'internal_error', detail: String(error) });
  }
}

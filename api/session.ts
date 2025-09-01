import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SessionData } from '../shared/types';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

async function yahooJson(url: string, token: string) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const ct = r.headers.get('content-type') || '';
  const text = await r.text();
  if (!r.ok) throw new Error(`yahoo_${r.status}:${text.slice(0,200)}`);
  if (!ct.includes('application/json')) throw new Error(`non_json:${text.slice(0,200)}`);
  return JSON.parse(text);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const oauth_token = getCookie(req, 'yahoo_access_token');
  const oauth_token_secret = getCookie(req, 'yahoo_access_token_secret');
  const leagueKey = getCookie(req, 'yahoo_league_key') || '';

  if (!oauth_token || !oauth_token_secret) {
    return res.status(200).json({ connected: false, league_key: null, team_key: null });
  }

  try {
    let teamKey: string | null = null;

        if (leagueKey) {
      // For now, return a mock team key since we need to implement OAuth 1.0a for this endpoint
      // In a full implementation, we would use the OAuth tokens to make the API call
      teamKey = `${leagueKey}.t.1`; // Mock team key
    }
    }

    const sessionData: SessionData = {
      connected: true,
      league_key: leagueKey || null,
      team_key: teamKey,
    };

    return res.status(200).json(sessionData);
  } catch (e: any) {
    console.error('Session API error:', e);
    return res.status(500).json({ 
      connected: false, 
      league_key: null, 
      team_key: null,
      error: String(e?.message || e) 
    });
  }
}

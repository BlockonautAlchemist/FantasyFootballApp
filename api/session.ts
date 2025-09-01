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

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || getCookie(req, 'yahoo_access');
  const leagueKey = getCookie(req, 'yahoo_league_key') || '';

  if (!token) return res.status(200).json({ connected: false, league_key: null, team_key: null });

  try {
    let teamKey: string | null = null;

    if (leagueKey) {
      // Find my teams and pick the one in this league
      const data = await yahooJson(
        'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/teams?format=json',
        token
      );
      const users = data?.fantasy_content?.users;
      const user = users?.[0]?.user || users?.['0']?.user;
      const teamsNode = user?.find((n: any) => n?.teams)?.teams || user?.[1]?.teams;
      const count = Number(teamsNode?.count ?? 0);
      for (let i = 0; i < count; i++) {
        const t = teamsNode?.[i]?.team;
        if (!t) continue;
        const obj = Object.assign({}, ...t.filter((x: any) => x && typeof x === 'object'));
        if (String(obj.league_key) === String(leagueKey)) {
          teamKey = obj.team_key || null;
          break;
        }
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

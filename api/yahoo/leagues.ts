// /api/yahoo/leagues.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

type League = {
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  url?: string;
  scoring_type?: string;
  num_teams?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  // >>> use your cookie names <<<
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const token = bearer || getCookie(req, 'yahoo_access'); // NOT yahoo_access_token

  if (!token) {
    return res.status(401).json({ error: 'not_connected', detail: 'Missing yahoo_access cookie or Bearer token' });
  }

  try {
    const url = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json';
    const yres = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    const ct = yres.headers.get('content-type') || '';
    const text = await yres.text();

    if (!yres.ok) {
      console.error('Yahoo error:', yres.status, text.slice(0, 300));
      return res.status(yres.status).json({ error: 'yahoo_error', status: yres.status, snippet: text.slice(0, 200) });
    }
    if (!ct.includes('application/json')) {
      console.error('Unexpected content-type:', ct, text.slice(0, 200));
      return res.status(502).json({ error: 'unexpected_content_type', contentType: ct, snippet: text.slice(0, 200) });
    }

    const data = JSON.parse(text);
    const leagues = parseLeaguesFromYahooJson(data);
    return res.status(200).json({ leagues });
  } catch (err: any) {
    console.error('Internal leagues API error:', err);
    return res.status(500).json({ error: 'internal_error', detail: String(err?.message || err) });
  }
}

function parseLeaguesFromYahooJson(json: any): League[] {
  const out: League[] = [];
  const users = json?.fantasy_content?.users;
  const user = users?.[0]?.user || users?.['0']?.user;
  if (!user) return out;

  const gamesNode = user.find((n: any) => n?.games)?.games || user?.[1]?.games;
  if (!gamesNode) return out;

  const gameCount = Number(gamesNode?.count ?? 0);
  for (let gi = 0; gi < gameCount; gi++) {
    const game = gamesNode?.[gi]?.game;
    if (!game) continue;
    const leaguesNode = game.find((n: any) => n?.leagues)?.leagues;
    if (!leaguesNode) continue;

    const leagueCount = Number(leaguesNode?.count ?? 0);
    for (let li = 0; li < leagueCount; li++) {
      const arr = leaguesNode?.[li]?.league;
      if (!arr) continue;
      const obj = Object.assign({}, ...arr.filter((x: any) => x && typeof x === 'object'));
      if (!obj.league_key) continue;

      out.push({
        league_key: obj.league_key,
        league_id: obj.league_id ?? '',
        name: obj.name ?? '',
        season: String(obj.season ?? ''),
        url: obj.url,
        scoring_type: obj.scoring_type,
        num_teams: Number(obj.num_teams ?? 0),
      });
    }
  }
  return out;
}
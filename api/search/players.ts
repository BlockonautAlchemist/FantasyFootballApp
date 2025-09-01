import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

interface YahooPlayer {
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
    ascii_first: string;
    ascii_last: string;
  };
  editorial_team_abbr: string;
  display_position: string;
  position_type: string;
  eligible_positions: string[];
  status?: string;
  injury_note?: string;
}

interface SearchResult {
  id: string;
  name: string;
  pos: string;
  team: string;
  status?: string;
  injuryNote?: string;
}

async function searchYahooPlayers(token: string, query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Yahoo Fantasy Sports API doesn't have a direct search endpoint
    // We'll need to get players from the user's league or use a different approach
    // For now, let's try to get players from the user's league
    
    // First, get the user's leagues
    const leaguesUrl = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json';
    const leaguesResponse = await fetch(leaguesUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!leaguesResponse.ok) {
      throw new Error(`Failed to fetch leagues: ${leaguesResponse.status}`);
    }

    const leaguesData = await leaguesResponse.json();
    const leagues = parseLeaguesFromYahooJson(leaguesData);
    
    if (leagues.length === 0) {
      return [];
    }

    // Use the first league to search for players
    const leagueKey = leagues[0].league_key;
    
    // Get players from the league (this will include all players in the league)
    const playersUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/players?format=json`;
    const playersResponse = await fetch(playersUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!playersResponse.ok) {
      throw new Error(`Failed to fetch players: ${playersResponse.status}`);
    }

    const playersData = await playersResponse.json();
    const players = parsePlayersFromYahooJson(playersData);
    
    // Filter players based on search query
    const filteredPlayers = players.filter(player => 
      player.name.full.toLowerCase().includes(query.toLowerCase()) ||
      player.editorial_team_abbr.toLowerCase().includes(query.toLowerCase())
    );

    // Convert to our format
    return filteredPlayers.map(player => ({
      id: player.player_id,
      name: player.name.full,
      pos: player.display_position,
      team: player.editorial_team_abbr,
      status: player.status,
      injuryNote: player.injury_note
    })).slice(0, 10); // Limit to 10 results

  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

function parseLeaguesFromYahooJson(json: any): any[] {
  const out: any[] = [];
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

function parsePlayersFromYahooJson(json: any): YahooPlayer[] {
  const out: YahooPlayer[] = [];
  const players = json?.fantasy_content?.league?.[1]?.players;
  
  if (!players) return out;

  const playerCount = Number(players?.count ?? 0);
  for (let i = 0; i < playerCount; i++) {
    const player = players?.[i]?.player?.[0];
    if (!player) continue;

    out.push({
      player_id: player.player_id,
      name: player.name,
      editorial_team_abbr: player.editorial_team_abbr,
      display_position: player.display_position,
      position_type: player.position_type,
      eligible_positions: player.eligible_positions || [],
      status: player.status,
      injury_note: player.injury_note
    });
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // Get access token from cookie or Authorization header
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const token = bearer || getCookie(req, 'yahoo_access');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Search for players
    const players = await searchYahooPlayers(token, query);

    res.status(200).json(players);

  } catch (error) {
    console.error('Player search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

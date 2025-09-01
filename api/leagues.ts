import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  url: string;
  scoring_type: string;
  num_teams: number;
  teams?: YahooTeam[];
}

interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  logo?: string;
  manager?: string;
}

interface LeagueResponse {
  leagues: YahooLeague[];
  selectedLeague?: YahooLeague;
}

function parseLeaguesFromYahooJson(json: any): YahooLeague[] {
  const out: YahooLeague[] = [];
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

      // Get teams for this league
      const teams: YahooTeam[] = [];
      const teamsNode = arr.find((n: any) => n?.teams)?.teams;
      if (teamsNode) {
        const teamCount = Number(teamsNode?.count ?? 0);
        for (let ti = 0; ti < teamCount; ti++) {
          const teamArr = teamsNode?.[ti]?.team;
          if (!teamArr) continue;
          const teamObj = Object.assign({}, ...teamArr.filter((x: any) => x && typeof x === 'object'));
          if (teamObj.team_key) {
            teams.push({
              team_key: teamObj.team_key,
              team_id: teamObj.team_id || '',
              name: teamObj.name || 'Unknown Team',
              logo: teamObj.logo,
              manager: teamObj.managers?.[0]?.manager?.nickname
            });
          }
        }
      }

      out.push({
        league_key: obj.league_key,
        league_id: obj.league_id ?? '',
        name: obj.name ?? '',
        season: String(obj.season ?? ''),
        url: obj.url,
        scoring_type: obj.scoring_type,
        num_teams: Number(obj.num_teams ?? 0),
        teams
      });
    }
  }
  return out;
}

async function fetchUserLeagues(token: string): Promise<YahooLeague[]> {
  try {
    const leaguesUrl = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues;out=teams?format=json';
    const response = await fetch(leaguesUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leagues: ${response.status}`);
    }

    const data = await response.json();
    return parseLeaguesFromYahooJson(data);
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    // Return mock data for development
    return [
      {
        league_key: "league1",
        league_id: "1",
        name: "Steve Zic's Amazing League",
        season: "2025",
        url: "https://football.fantasysports.yahoo.com/f1/1",
        scoring_type: "head",
        num_teams: 12,
        teams: [
          {
            team_key: "team1",
            team_id: "1",
            name: "Steve's Team",
            manager: "Steve"
          }
        ]
      },
      {
        league_key: "league2",
        league_id: "2",
        name: "4 Quarters Of War",
        season: "2025",
        url: "https://football.fantasysports.yahoo.com/f1/2",
        scoring_type: "head",
        num_teams: 12,
        teams: [
          {
            team_key: "team2",
            team_id: "2",
            name: "Jesse",
            manager: "Jesse"
          }
        ]
      },
      {
        league_key: "league3",
        league_id: "3",
        name: "Fantasy Champions",
        season: "2025",
        url: "https://football.fantasysports.yahoo.com/f1/3",
        scoring_type: "head",
        num_teams: 10,
        teams: [
          {
            team_key: "team3",
            team_id: "3",
            name: "Champion",
            manager: "Champion"
          }
        ]
      }
    ];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get access token from cookie or Authorization header
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const token = bearer || getCookie(req, 'yahoo_access');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leagues = await fetchUserLeagues(token);
    
    // Get the currently selected league from query params or use the first one
    const { selectedLeagueKey } = req.query;
    const selectedLeague = selectedLeagueKey 
      ? leagues.find(l => l.league_key === selectedLeagueKey)
      : leagues[0];

    const response: LeagueResponse = {
      leagues,
      selectedLeague
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Leagues API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

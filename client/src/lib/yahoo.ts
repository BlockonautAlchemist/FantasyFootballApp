// Yahoo API helpers for league management

export type League = {
  league_key: string;  // e.g., "nfl.l.12345"
  league_id: string;
  name: string;
  season: string;
  url?: string;
  scoring_type?: string;
  num_teams?: number;
};

/**
 * Get access token from server-side session or cookies
 * This function reads from the existing Express.js session/cookie system
 */
export async function getAccessTokenFromServer(): Promise<string | null> {
  try {
    // Try to get from the existing /api/yahoo/me endpoint which validates the session
    const response = await fetch('/api/yahoo/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      // If we can access the user endpoint, the session is valid
      // The actual token is handled server-side in the Express.js backend
      return 'valid_session'; // Placeholder - actual token is server-side
    }
    
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Fetch data from Yahoo API using server-side token
 */
export async function yahooFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`/api/yahoo/proxy?path=${encodeURIComponent(path)}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Yahoo API error: 401 - Token expired or invalid');
    }
    throw new Error(`Yahoo API error: ${res.status}`);
  }
  
  return (await res.json()) as T;
}

/**
 * Robustly unwrap Yahoo JSON -> League[]
 * Handles Yahoo's nested JSON structure safely
 */
export function parseLeaguesFromYahooJson(json: any): League[] {
  const out: League[] = [];
  const users = json?.fantasy_content?.users;
  if (!users) return out;

  // users["0"].user[1].games is commonly where the games live
  const userObj = users?.[0]?.user ?? users?.['0']?.user ?? null;
  if (!userObj) return out;

  // find games node
  const gamesNode = userObj.find((n: any) => n?.games) ?? userObj?.[1]?.games;
  const games = gamesNode?.[0] ?? gamesNode; // tolerate structures

  if (!games) return out;

  // traverse games -> leagues
  const gameCount = Number(games?.count ?? Object.keys(games).length ?? 0);
  for (let gi = 0; gi < gameCount; gi++) {
    const game = games?.[gi]?.game;
    if (!game) continue;

    const leaguesNode = game.find((n: any) => n?.leagues)?.leagues;
    if (!leaguesNode) continue;

    const leagueCount = Number(leaguesNode?.count ?? Object.keys(leaguesNode).length ?? 0);
    for (let li = 0; li < leagueCount; li++) {
      const league = leaguesNode?.[li]?.league;
      if (!league) continue;

      // league is an array; its [0] often has key props
      const meta = Object.assign({}, ...league.filter((x: any) => typeof x === 'object'));
      const league_key = meta?.league_key ?? meta?.['league_key'];
      const league_id = meta?.league_id ?? '';
      const name = meta?.name ?? '';
      const season = meta?.season ?? meta?.season_value ?? '';
      const url = meta?.url;
      const scoring_type = meta?.scoring_type;
      const num_teams = Number(meta?.num_teams ?? 0);

      if (league_key && name) {
        out.push({ league_key, league_id, name, season: String(season), url, scoring_type, num_teams });
      }
    }
  }
  return out;
}

/**
 * Get user's Yahoo leagues
 */
export async function getUserLeagues(token: string): Promise<League[]> {
  const data = await yahooFetch<any>(
    'users;use_login=1/games;game_keys=nfl/leagues?format=json',
    token
  );
  return parseLeaguesFromYahooJson(data);
}

/**
 * Refresh Yahoo token - stub for future implementation
 */
export async function refreshYahooToken(): Promise<void> {
  // TODO: Implement using stored refresh_token with https://api.login.yahoo.com/oauth2/get_token
  // For now, surface a readable error to the UI when 401 occurs.
  throw new Error('Token expired. Please reconnect to Yahoo.');
}

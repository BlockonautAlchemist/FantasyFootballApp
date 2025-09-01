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
  
  const ct = res.headers.get('content-type') || '';
  let payload: any = ct.includes('application/json') ? await res.json() : { error: 'non_json', snippet: await res.text() };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Yahoo API error: 401 - Token expired or invalid');
    }
    throw new Error(payload?.error || `Yahoo API error: ${res.status}`);
  }
  
  return payload as T;
}

/**
 * Robustly unwrap Yahoo JSON -> League[]
 * Minimal, defensive parser for Yahoo JSON → League[]
 */
export function parseLeaguesFromYahooJson(json: any): League[] {
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
      const leagueArr = leaguesNode?.[li]?.league;
      if (!leagueArr) continue;
      const obj = Object.assign({}, ...leagueArr.filter((x: any) => x && typeof x === 'object'));

      const league_key = obj.league_key;
      if (!league_key) continue;

      out.push({
        league_key,
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

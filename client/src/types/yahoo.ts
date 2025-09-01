// TypeScript types for Yahoo Fantasy Sports API

export type League = {
  league_key: string;  // e.g., "nfl.l.12345"
  league_id: string;
  name: string;
  season: string;
  url?: string;
  scoring_type?: string;
  num_teams?: number;
};

export type YahooApiResponse<T = any> = {
  fantasy_content: {
    users: Array<{
      user: Array<{
        games?: Array<{
          game: Array<{
            leagues?: Array<{
              league: Array<{
                league_key: Array<string>;
                name: Array<string>;
                season: Array<string>;
                url?: Array<string>;
                scoring_type?: Array<string>;
                num_teams?: Array<string>;
                teams?: Array<{
                  team: Array<{
                    team_key: Array<string>;
                    name: Array<string>;
                  }>;
                }>;
              }>;
            }>;
          }>;
        }>;
      }>;
    }>;
  };
};

export type YahooUserProfile = {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  locale?: string;
  guid?: string;
  id?: string;
};

export type YahooTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

export type YahooError = {
  error: string;
  error_description?: string;
  error_uri?: string;
};

// API Response types
export type LeaguesApiResponse = {
  leagues: League[];
};

export type LeagueSelectionRequest = {
  league_key: string;
};

export type LeagueSelectionResponse = {
  ok: boolean;
};

// Error response types
export type ApiErrorResponse = {
  error: string;
  details?: string;
};

// Safe parser function type
export type LeagueParser = (json: any) => League[];

/**
 * Safe parser for Yahoo's nested JSON structure
 * Handles the complex nested arrays that Yahoo API returns
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

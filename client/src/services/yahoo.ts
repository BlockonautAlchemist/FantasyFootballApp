// Yahoo Fantasy Sports API client wrapper
// Uses the consolidated /api/yahoo-proxy endpoint

export interface YahooLeaguesResponse {
  leagues: Array<{
    league_key: string;
    league_id: string;
    name: string;
    season: string;
    url?: string;
    scoring_type?: string;
    num_teams?: number;
  }>;
}

export interface YahooLeagueSettings {
  fantasy_content: {
    league: Array<{
      league: Array<{
        league_key?: string;
        name?: string;
        season?: string;
        scoring_type?: string;
        num_teams?: number;
        settings?: Array<{
          settings: Array<{
            roster_positions?: Array<{
              roster_positions: Array<{
                roster_position: Array<{
                  position?: string;
                  count?: number;
                }>;
              }>;
            }>;
          }>;
        }>;
      }>;
    }>;
  };
}

export interface YahooTeamRoster {
  fantasy_content: {
    team: Array<{
      team: Array<{
        roster?: Array<{
          roster: Array<{
            players?: Array<{
              player: Array<{
                player_key?: string;
                name?: {
                  full?: string;
                };
                status?: string;
                editorial_team_abbr?: string;
                eligible_positions?: string[];
                selected_position?: {
                  position?: string;
                };
              }>;
            }>;
          }>;
        }>;
      }>;
    }>;
  };
}

export interface OptimalLineup {
  starters: Record<string, Array<{
    player_key: string;
    name: string;
    status?: string;
    editorial_team_abbr?: string;
    eligible_positions: string[];
    selected_position?: string;
  }>>;
  bench: Array<{
    player_key: string;
    name: string;
    status?: string;
    editorial_team_abbr?: string;
    eligible_positions: string[];
    selected_position?: string;
  }>;
  recommendations: {
    start: Array<{
      player_key: string;
      name: string;
      status?: string;
      editorial_team_abbr?: string;
      eligible_positions: string[];
      selected_position?: string;
    }>;
    sit: Array<{
      player_key: string;
      name: string;
      status?: string;
      editorial_team_abbr?: string;
      eligible_positions: string[];
      selected_position?: string;
    }>;
    reasons: string[];
  };
}

// Base function to call the Yahoo proxy
async function callYahooProxy(action: string, params: Record<string, string> = {}): Promise<any> {
  const searchParams = new URLSearchParams({ action, ...params });
  
  const response = await fetch(`/api/yahoo-proxy?${searchParams}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return await response.json();
}

// Get user's Yahoo leagues
export async function getYahooLeagues(): Promise<YahooLeaguesResponse> {
  return callYahooProxy('leagues');
}

// Get league settings
export async function getLeagueSettings(leagueKey: string): Promise<YahooLeagueSettings> {
  return callYahooProxy('league-settings', { league_key: leagueKey });
}

// Get team roster
export async function getTeamRoster(teamKey: string, date?: string): Promise<YahooTeamRoster> {
  const params: Record<string, string> = { team_key: teamKey };
  if (date) params.date = date;
  return callYahooProxy('team-roster', params);
}

// Get optimal lineup recommendations
export async function getOptimalLineup(leagueKey: string, teamKey: string): Promise<OptimalLineup> {
  return callYahooProxy('optimal-lineup', { 
    league_key: leagueKey, 
    team_key: teamKey 
  });
}

// Helper function to parse leagues from Yahoo response
export function parseLeaguesFromYahooJson(json: any): Array<{
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  url?: string;
  scoring_type?: string;
  num_teams?: number;
}> {
  const out: Array<{
    league_key: string;
    league_id: string;
    name: string;
    season: string;
    url?: string;
    scoring_type?: string;
    num_teams?: number;
  }> = [];
  
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

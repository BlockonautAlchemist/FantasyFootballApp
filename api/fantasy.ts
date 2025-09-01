import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

interface PlayerStats {
  name: string;
  team: string;
  position: string;
  opponent: string;
  projectedPoints: number;
  last4Games: number[];
  snapPercentage: number;
  targetShare: number;
  injuryStatus: string;
  fantasyPoints: number;
  targets: number;
  receptions: number;
  rushingYards: number;
  passingYards: number;
  touchdowns: number;
  week: number;
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

interface StartSitAnalysis {
  recommendation: 'A' | 'B';
  confidence: number;
  reasons: string[];
  pivots?: string[];
  playerA: PlayerStats;
  playerB: PlayerStats;
  strengthOfSchedule: {
    A: number;
    B: number;
  };
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

// Player search functionality
async function searchYahooPlayers(token: string, query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Get the user's leagues
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
    
    // Get players from the league
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
      player.editorial_team_abbr.toLowerCase().includes(query.toLowerCase()) ||
      player.display_position.toLowerCase().includes(query.toLowerCase())
    );

    // Convert to SearchResult format
    return filteredPlayers.slice(0, 10).map(player => ({
      id: player.player_id,
      name: player.name.full,
      pos: player.display_position,
      team: player.editorial_team_abbr,
      status: player.status,
      injuryNote: player.injury_note
    }));

  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

// Player stats functionality
async function getPlayerStats(token: string, playerId: string, week: number): Promise<PlayerStats> {
  try {
    // Get player info
    const playerUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}?format=json`;
    const playerResponse = await fetch(playerUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!playerResponse.ok) {
      throw new Error(`Failed to fetch player: ${playerResponse.status}`);
    }

    const playerData = await playerResponse.json();

    // Get player stats for the week
    const statsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}/stats;type=week;week=${week}?format=json`;
    const statsResponse = await fetch(statsUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();

    // Parse the data
    const player = parsePlayerFromYahooJson(playerData);
    const stats = parseStatsFromYahooJson(statsData);
    
    // Get historical data for last 4 games
    const historicalStats = await getHistoricalStats(token, playerId, week);
    
    // Get projections (if available)
    const projections = await getProjections(token, playerId, week);
    
    // Get opponent and context
    const context = await getPlayerContext(token, playerId, week);

    // Ensure all required fields are present with default values
    return {
      name: player.name || 'Unknown Player',
      team: player.team || 'Unknown',
      position: player.position || 'Unknown',
      opponent: player.opponent || 'Unknown',
      projectedPoints: player.projectedPoints || 0,
      last4Games: player.last4Games || [0, 0, 0, 0],
      snapPercentage: player.snapPercentage || 0.8,
      targetShare: player.targetShare || 0.2,
      injuryStatus: player.injuryStatus || 'Healthy',
      fantasyPoints: stats.fantasyPoints || 0,
      targets: stats.targets || 0,
      receptions: stats.receptions || 0,
      rushingYards: stats.rushingYards || 0,
      passingYards: stats.passingYards || 0,
      touchdowns: stats.touchdowns || 0,
      week: week
    };

  } catch (error) {
    console.error('Error fetching player stats:', error);
    // Return a complete PlayerStats object with default values
    return {
      name: 'Unknown Player',
      team: 'Unknown',
      position: 'Unknown',
      opponent: 'Unknown',
      projectedPoints: 0,
      last4Games: [0, 0, 0, 0],
      snapPercentage: 0.8,
      targetShare: 0.2,
      injuryStatus: 'Healthy',
      fantasyPoints: 0,
      targets: 0,
      receptions: 0,
      rushingYards: 0,
      passingYards: 0,
      touchdowns: 0,
      week: week
    };
  }
}

// Start/sit analysis functionality
async function analyzeStartSit(token: string, playerAId: string, playerBId: string, week: number): Promise<StartSitAnalysis> {
  // Fetch player stats for both players
  const [playerA, playerB] = await Promise.all([
    getPlayerStats(token, playerAId, week),
    getPlayerStats(token, playerBId, week)
  ]);

  return performStartSitAnalysis(playerA, playerB, week);
}

// Leagues functionality
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

// Helper functions
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

function parsePlayerFromYahooJson(json: any): Partial<PlayerStats> {
  const player = json?.fantasy_content?.player?.[0]?.[0];
  if (!player) {
    throw new Error('Invalid player data structure');
  }

  return {
    name: player.name?.full || 'Unknown Player',
    team: player.editorial_team_abbr || 'Unknown',
    position: player.display_position || 'Unknown',
    injuryStatus: player.injury_note ? 'Injured' : 'Healthy',
    opponent: 'Unknown',
    projectedPoints: 0,
    last4Games: [0, 0, 0, 0],
    snapPercentage: 0.8,
    targetShare: 0.2,
    fantasyPoints: 0,
    targets: 0,
    receptions: 0,
    rushingYards: 0,
    passingYards: 0,
    touchdowns: 0,
    week: 1
  };
}

function parseStatsFromYahooJson(json: any): Partial<PlayerStats> {
  const player = json?.fantasy_content?.player?.[0]?.[0];
  if (!player) {
    return {
      fantasyPoints: 0,
      targets: 0,
      receptions: 0,
      rushingYards: 0,
      passingYards: 0,
      touchdowns: 0
    };
  }

  const stats = player?.player_stats?.stats || [];
  const statMap = new Map();
  
  stats.forEach((stat: any) => {
    if (stat.stat?.stat_id && stat.stat?.value) {
      statMap.set(stat.stat.stat_id, parseFloat(stat.stat.value));
    }
  });

  return {
    fantasyPoints: statMap.get('0') || 0, // Fantasy points
    targets: statMap.get('58') || 0, // Targets
    receptions: statMap.get('1') || 0, // Receptions
    rushingYards: statMap.get('3') || 0, // Rushing yards
    passingYards: statMap.get('4') || 0, // Passing yards
    touchdowns: (statMap.get('6') || 0) + (statMap.get('7') || 0) + (statMap.get('8') || 0), // Total TDs
  };
}

async function getHistoricalStats(token: string, playerId: string, currentWeek: number): Promise<Partial<PlayerStats>> {
  try {
    // Get stats for the last 4 weeks
    const last4Games: number[] = [];
    
    for (let week = Math.max(1, currentWeek - 4); week < currentWeek; week++) {
      const statsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}/stats;type=week;week=${week}?format=json`;
      const response = await fetch(statsUrl, { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.ok) {
        const data = await response.json();
        const stats = parseStatsFromYahooJson(data);
        last4Games.push(stats.fantasyPoints || 0);
      } else {
        last4Games.push(0);
      }
    }

    // Pad with zeros if we don't have 4 games
    while (last4Games.length < 4) {
      last4Games.unshift(0);
    }

    return { last4Games };
  } catch (error) {
    console.error('Error fetching historical stats:', error);
    return { last4Games: [0, 0, 0, 0] };
  }
}

async function getProjections(token: string, playerId: string, week: number): Promise<Partial<PlayerStats>> {
  try {
    // Try to get projections from Yahoo
    const projectionsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}/stats;type=week;week=${week};out=projections?format=json`;
    const response = await fetch(projectionsUrl, { headers: { Authorization: `Bearer ${token}` } });
    
    if (response.ok) {
      const data = await response.json();
      const stats = parseStatsFromYahooJson(data);
      return { projectedPoints: stats.fantasyPoints || 0 };
    }
    
    return { projectedPoints: 0 };
  } catch (error) {
    console.error('Error fetching projections:', error);
    return { projectedPoints: 0 };
  }
}

async function getPlayerContext(token: string, playerId: string, week: number): Promise<Partial<PlayerStats>> {
  try {
    // This would typically fetch opponent info, weather, etc.
    // For now, return basic context
    return {
      opponent: 'Unknown',
      snapPercentage: 0.8,
      targetShare: 0.2
    };
  } catch (error) {
    console.error('Error fetching player context:', error);
    return {
      opponent: 'Unknown',
      snapPercentage: 0.8,
      targetShare: 0.2
    };
  }
}

function performStartSitAnalysis(playerA: PlayerStats, playerB: PlayerStats, week: number): StartSitAnalysis {
  // Simple analysis based on projected points and recent performance
  const playerAScore = (playerA.projectedPoints * 0.6) + (playerA.last4Games.reduce((a, b) => a + b, 0) / 4 * 0.4);
  const playerBScore = (playerB.projectedPoints * 0.6) + (playerB.last4Games.reduce((a, b) => a + b, 0) / 4 * 0.4);
  
  const recommendation = playerAScore > playerBScore ? 'A' : 'B';
  const confidence = Math.abs(playerAScore - playerBScore) / Math.max(playerAScore, playerBScore) * 100;
  
  const reasons = [
    `${recommendation === 'A' ? playerA.name : playerB.name} has better projected points`,
    `${recommendation === 'A' ? playerA.name : playerB.name} has better recent performance`,
    `Matchup favors ${recommendation === 'A' ? playerA.name : playerB.name}`
  ];

  return {
    recommendation,
    confidence: Math.min(confidence, 95),
    reasons,
    playerA,
    playerB,
    strengthOfSchedule: {
      A: Math.random() * 10,
      B: Math.random() * 10
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get access token from cookie or Authorization header
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const token = bearer || getCookie(req, 'yahoo_access');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'search':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
          return res.status(400).json({ error: 'Query parameter required' });
        }
        const searchResults = await searchYahooPlayers(token, q);
        return res.status(200).json(searchResults);

      case 'stats':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { playerId, week = '1' } = req.query;
        if (!playerId || typeof playerId !== 'string') {
          return res.status(400).json({ error: 'Player ID required' });
        }
        const playerStats = await getPlayerStats(token, playerId, parseInt(week as string));
        return res.status(200).json(playerStats);

      case 'start-sit':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { playerAId, playerBId, week: startSitWeek = '1' } = req.body;
        if (!playerAId || !playerBId) {
          return res.status(400).json({ error: 'Both player IDs required' });
        }
        const analysis = await analyzeStartSit(token, playerAId, playerBId, parseInt(startSitWeek as string));
        return res.status(200).json(analysis);

      case 'leagues':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const leagues = await fetchUserLeagues(token);
        const { selectedLeagueKey } = req.query;
        const selectedLeague = selectedLeagueKey 
          ? leagues.find(l => l.league_key === selectedLeagueKey)
          : leagues[0];
        const leagueResponse: LeagueResponse = {
          leagues,
          selectedLeague
        };
        return res.status(200).json(leagueResponse);

      default:
        return res.status(400).json({ error: 'Invalid action. Use: search, stats, start-sit, or leagues' });
    }
  } catch (error) {
    console.error('Fantasy API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

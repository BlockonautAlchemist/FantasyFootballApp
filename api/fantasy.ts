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

// Player stats functionality
async function getPlayerStats(token: string, playerId: string, week: number): Promise<PlayerStats> {
  try {
    // Get player details and stats for the specific week
    const statsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}/stats;type=week;week=${week}?format=json`;
    const playerUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}?format=json`;
    
    const [statsResponse, playerResponse] = await Promise.all([
      fetch(statsUrl, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(playerUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    if (!statsResponse.ok || !playerResponse.ok) {
      throw new Error(`Failed to fetch player data: ${statsResponse.status} / ${playerResponse.status}`);
    }

    const [statsData, playerData] = await Promise.all([
      statsResponse.json(),
      playerResponse.json()
    ]);

    // Parse the data
    const player = parsePlayerFromYahooJson(playerData);
    const stats = parseStatsFromYahooJson(statsData);
    
    // Get historical data for last 4 games
    const historicalStats = await getHistoricalStats(token, playerId, week);
    
    // Get projections (if available)
    const projections = await getProjections(token, playerId, week);
    
    // Get opponent and context
    const context = await getPlayerContext(token, playerId, week);

    return {
      ...player,
      ...stats,
      ...historicalStats,
      ...projections,
      ...context,
      week
    };

  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
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

// Helper functions
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
  } catch (error) {
    console.error('Error fetching projections:', error);
  }

  // Fallback: estimate projections based on historical average
  return { projectedPoints: 0 };
}

async function getPlayerContext(token: string, playerId: string, week: number): Promise<Partial<PlayerStats>> {
  try {
    // For now, return basic context
    // In a full implementation, you'd fetch:
    // - Opponent from schedule API
    // - Snap percentage from advanced stats
    // - Target share from team data
    // - Injury status from injury reports
    
    return {
      opponent: 'TBD', // Would need to fetch from schedule API
      snapPercentage: 0.8, // Would need to fetch from advanced stats
      targetShare: 0.2, // Would need to calculate from team data
    };
  } catch (error) {
    console.error('Error fetching player context:', error);
    return {
      opponent: 'Unknown',
      snapPercentage: 0.8,
      targetShare: 0.2,
    };
  }
}

function performStartSitAnalysis(playerA: PlayerStats, playerB: PlayerStats, week: number): StartSitAnalysis {
  let recommendation: 'A' | 'B' = 'A';
  let confidence = 0.5;
  const reasons: string[] = [];
  const pivots: string[] = [];

  // Calculate confidence based on multiple factors
  let scoreA = 0;
  let scoreB = 0;

  // Factor 1: Recent performance (last 4 games average)
  const avgA = playerA.last4Games.reduce((a, b) => a + b, 0) / playerA.last4Games.length;
  const avgB = playerB.last4Games.reduce((a, b) => a + b, 0) / playerB.last4Games.length;
  
  if (avgA > avgB) {
    scoreA += 0.2;
    reasons.push(`${playerA.name} has better recent performance (${avgA.toFixed(1)} vs ${avgB.toFixed(1)} avg)`);
  } else if (avgB > avgA) {
    scoreB += 0.2;
    reasons.push(`${playerB.name} has better recent performance (${avgB.toFixed(1)} vs ${avgA.toFixed(1)} avg)`);
  }

  // Factor 2: Projected points
  if (playerA.projectedPoints > playerB.projectedPoints) {
    scoreA += 0.25;
    reasons.push(`${playerA.name} has higher projections (${playerA.projectedPoints} vs ${playerB.projectedPoints})`);
  } else if (playerB.projectedPoints > playerA.projectedPoints) {
    scoreB += 0.25;
    reasons.push(`${playerB.name} has higher projections (${playerB.projectedPoints} vs ${playerA.projectedPoints})`);
  }

  // Factor 3: Target share (for WR/TE)
  if (['WR', 'TE'].includes(playerA.position) && ['WR', 'TE'].includes(playerB.position)) {
    if (playerA.targetShare > playerB.targetShare) {
      scoreA += 0.15;
      reasons.push(`${playerA.name} has higher target share (${(playerA.targetShare * 100).toFixed(0)}% vs ${(playerB.targetShare * 100).toFixed(0)}%)`);
    } else if (playerB.targetShare > playerA.targetShare) {
      scoreB += 0.15;
      reasons.push(`${playerB.name} has higher target share (${(playerB.targetShare * 100).toFixed(0)}% vs ${(playerA.targetShare * 100).toFixed(0)}%)`);
    }
  }

  // Factor 4: Injury status
  if (playerA.injuryStatus === 'Healthy' && playerB.injuryStatus !== 'Healthy') {
    scoreA += 0.2;
    reasons.push(`${playerA.name} is healthy while ${playerB.name} is ${playerB.injuryStatus.toLowerCase()}`);
  } else if (playerB.injuryStatus === 'Healthy' && playerA.injuryStatus !== 'Healthy') {
    scoreB += 0.2;
    reasons.push(`${playerB.name} is healthy while ${playerA.name} is ${playerA.injuryStatus.toLowerCase()}`);
  }

  // Factor 5: Snap percentage
  if (playerA.snapPercentage > playerB.snapPercentage) {
    scoreA += 0.1;
    reasons.push(`${playerA.name} has higher snap percentage (${(playerA.snapPercentage * 100).toFixed(0)}% vs ${(playerB.snapPercentage * 100).toFixed(0)}%)`);
  } else if (playerB.snapPercentage > playerA.snapPercentage) {
    scoreB += 0.1;
    reasons.push(`${playerB.name} has higher snap percentage (${(playerB.snapPercentage * 100).toFixed(0)}% vs ${(playerA.snapPercentage * 100).toFixed(0)}%)`);
  }

  // Determine recommendation
  if (scoreA > scoreB) {
    recommendation = 'A';
    confidence = Math.min(0.95, 0.5 + (scoreA - scoreB));
  } else if (scoreB > scoreA) {
    recommendation = 'B';
    confidence = Math.min(0.95, 0.5 + (scoreB - scoreA));
  } else {
    // Tie - go with projections
    recommendation = playerA.projectedPoints > playerB.projectedPoints ? 'A' : 'B';
    confidence = 0.55;
    reasons.push('Close call - recommendation based on projections');
  }

  // Add some pivot suggestions based on position
  if (playerA.position === 'WR') {
    pivots.push('Nico Collins', 'Zay Flowers', 'Tank Dell');
  } else if (playerA.position === 'RB') {
    pivots.push('Zack Moss', 'Gus Edwards', 'Tyjae Spears');
  } else if (playerA.position === 'TE') {
    pivots.push('Trey McBride', 'Jake Ferguson', 'Dalton Schultz');
  }

  return {
    recommendation,
    confidence,
    reasons,
    pivots,
    playerA,
    playerB,
    strengthOfSchedule: {
      A: 3.2, // Would need to calculate from schedule data
      B: 4.1
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
        const { q: query } = req.query;
        if (!query || typeof query !== 'string') {
          return res.status(400).json({ error: 'Query parameter required' });
        }
        const players = await searchYahooPlayers(token, query);
        return res.status(200).json(players);

      case 'stats':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { playerId, week } = req.query;
        if (!playerId || typeof playerId !== 'string') {
          return res.status(400).json({ error: 'Player ID is required' });
        }
        const weekNumber = week ? parseInt(week as string) : 1;
        const stats = await getPlayerStats(token, playerId, weekNumber);
        return res.status(200).json(stats);

      case 'start-sit':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { playerAId, playerBId, week: startSitWeek, scoring } = req.body;
        if (!playerAId || !playerBId || !startSitWeek) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        const analysis = await analyzeStartSit(token, playerAId, playerBId, startSitWeek);
        return res.status(200).json({
          input: { playerAId, playerBId, week: startSitWeek, scoring },
          facts: {
            playerA: {
              name: analysis.playerA.name,
              team: analysis.playerA.team,
              pos: analysis.playerA.position,
              opp: analysis.playerA.opponent,
              proj: analysis.playerA.projectedPoints,
              last4: analysis.playerA.last4Games,
              snap: analysis.playerA.snapPercentage,
              tgtShare: analysis.playerA.targetShare,
              inj: analysis.playerA.injuryStatus
            },
            playerB: {
              name: analysis.playerB.name,
              team: analysis.playerB.team,
              pos: analysis.playerB.position,
              opp: analysis.playerB.opponent,
              proj: analysis.playerB.projectedPoints,
              last4: analysis.playerB.last4Games,
              snap: analysis.playerB.snapPercentage,
              tgtShare: analysis.playerB.targetShare,
              inj: analysis.playerB.injuryStatus
            }
          },
          sos: analysis.strengthOfSchedule,
          result: {
            recommendation: analysis.recommendation,
            confidence: analysis.confidence,
            reasons: analysis.reasons,
            pivots: analysis.pivots
          }
        });

      default:
        return res.status(400).json({ error: 'Invalid action. Use: search, stats, or start-sit' });
    }
  } catch (error) {
    console.error('Fantasy API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

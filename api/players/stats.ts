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

function parsePlayerFromYahooJson(json: any): Partial<PlayerStats> {
  const player = json?.fantasy_content?.player?.[0]?.[0];
  if (!player) {
    throw new Error('Invalid player data structure');
  }

  return {
    name: player.name?.full || 'Unknown Player',
    team: player.editorial_team_abbr || 'Unknown',
    position: player.display_position || 'Unknown',
    injuryStatus: player.injury_note ? 'Injured' : 'Healthy'
  };
}

function parseStatsFromYahooJson(json: any): Partial<PlayerStats> {
  const player = json?.fantasy_content?.player?.[0]?.[0];
  if (!player) {
    return {};
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerId, week } = req.query;

    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const weekNumber = week ? parseInt(week as string) : 1;

    // Get access token from cookie or Authorization header
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const token = bearer || getCookie(req, 'yahoo_access');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get player stats
    const stats = await getPlayerStats(token, playerId, weekNumber);

    res.status(200).json(stats);

  } catch (error) {
    console.error('Player stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

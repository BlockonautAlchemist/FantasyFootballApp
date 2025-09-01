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

async function getPlayerStats(token: string, playerId: string, week: number): Promise<PlayerStats> {
  // Get player details from Yahoo Fantasy Sports API
  const playerUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}/stats;type=week;week=${week}?format=json`;
  
  const response = await fetch(playerUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch player stats: ${response.status}`);
  }

  const data = await response.json();
  
  // Parse Yahoo's complex JSON structure
  const player = parsePlayerFromYahooJson(data);
  
  // Get additional context (opponent, injury status, etc.)
  const context = await getPlayerContext(token, playerId, week);
  
  return {
    ...player,
    ...context
  };
}

function parsePlayerFromYahooJson(json: any): Partial<PlayerStats> {
  const player = json?.fantasy_content?.player?.[0]?.[0];
  if (!player) {
    throw new Error('Invalid player data structure');
  }

  const stats = player?.player_stats?.stats || [];
  const statMap = new Map();
  
  stats.forEach((stat: any) => {
    if (stat.stat?.stat_id && stat.stat?.value) {
      statMap.set(stat.stat.stat_id, parseFloat(stat.stat.value));
    }
  });

  return {
    name: player.name?.full || 'Unknown Player',
    team: player.editorial_team_abbr || 'Unknown',
    position: player.display_position || 'Unknown',
    fantasyPoints: statMap.get('0') || 0, // Fantasy points
    targets: statMap.get('58') || 0, // Targets
    receptions: statMap.get('1') || 0, // Receptions
    rushingYards: statMap.get('3') || 0, // Rushing yards
    passingYards: statMap.get('4') || 0, // Passing yards
    touchdowns: (statMap.get('6') || 0) + (statMap.get('7') || 0) + (statMap.get('8') || 0), // Total TDs
  };
}

async function getPlayerContext(token: string, playerId: string, week: number): Promise<Partial<PlayerStats>> {
  // Get player's team and opponent for the week
  const teamUrl = `https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}?format=json`;
  
  const response = await fetch(teamUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    return {};
  }

  const data = await response.json();
  const player = data?.fantasy_content?.player?.[0]?.[0];
  
  // For now, return basic context - in a full implementation,
  // you'd fetch opponent data, injury reports, etc.
  return {
    opponent: 'TBD', // Would need to fetch from schedule API
    projectedPoints: 0, // Would need to fetch from projections API
    last4Games: [0, 0, 0, 0], // Would need to fetch historical stats
    snapPercentage: 0.8, // Would need to fetch from advanced stats
    targetShare: 0.2, // Would need to calculate from team data
    injuryStatus: 'Healthy' // Would need to fetch from injury reports
  };
}

function analyzeStartSit(playerA: PlayerStats, playerB: PlayerStats, week: number): StartSitAnalysis {
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerAId, playerBId, week, scoring } = req.body;

    if (!playerAId || !playerBId || !week) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get access token from cookie or Authorization header
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const token = bearer || getCookie(req, 'yahoo_access');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch player stats for both players
    const [playerA, playerB] = await Promise.all([
      getPlayerStats(token, playerAId, week),
      getPlayerStats(token, playerBId, week)
    ]);

    // Analyze and provide recommendation
    const analysis = analyzeStartSit(playerA, playerB, week);

    // Return the analysis
    res.status(200).json({
      input: { playerAId, playerBId, week, scoring },
      facts: {
        playerA: {
          name: playerA.name,
          team: playerA.team,
          pos: playerA.position,
          opp: playerA.opponent,
          proj: playerA.projectedPoints,
          last4: playerA.last4Games,
          snap: playerA.snapPercentage,
          tgtShare: playerA.targetShare,
          inj: playerA.injuryStatus
        },
        playerB: {
          name: playerB.name,
          team: playerB.team,
          pos: playerB.position,
          opp: playerB.opponent,
          proj: playerB.projectedPoints,
          last4: playerB.last4Games,
          snap: playerB.snapPercentage,
          tgtShare: playerB.targetShare,
          inj: playerB.injuryStatus
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

  } catch (error) {
    console.error('Start/sit analysis error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

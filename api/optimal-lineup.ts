import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

interface LineupPlayer {
  id: string;
  name: string;
  pos: string;
  team: string;
  expertPercent: number;
  weekPoints: number;
  matchup: string;
  matchupRating: number;
  isStart: boolean;
  rank: number;
  projectedPoints: number;
  last4Games: number[];
  injuryStatus: string;
}

interface OptimalLineupResponse {
  startPlayers: LineupPlayer[];
  benchPlayers: LineupPlayer[];
  week: number;
  leagueName: string;
  teamName: string;
  totalProjectedPoints: number;
  expertCount: number;
}

// Mock data for demonstration - in production this would come from Yahoo API
const mockLineupData: OptimalLineupResponse = {
  startPlayers: [
    {
      id: "1",
      name: "Bo Nix",
      pos: "QB",
      team: "DEN",
      expertPercent: 78,
      weekPoints: 9,
      matchup: "TEN Sun 4:05 PM",
      matchupRating: 5,
      isStart: true,
      rank: 9,
      projectedPoints: 18.5,
      last4Games: [15.2, 12.8, 19.1, 16.3],
      injuryStatus: "Healthy"
    },
    {
      id: "2",
      name: "Breece Hall",
      pos: "RB",
      team: "NYJ",
      expertPercent: 100,
      weekPoints: 19,
      matchup: "PIT Sun 1:00 PM",
      matchupRating: 5,
      isStart: true,
      rank: 19,
      projectedPoints: 22.3,
      last4Games: [24.1, 18.7, 21.2, 19.8],
      injuryStatus: "Healthy"
    },
    {
      id: "3",
      name: "Ja'Marr Chase",
      pos: "WR",
      team: "CIN",
      expertPercent: 100,
      weekPoints: 1,
      matchup: "@CLE Sun 1:00 PM",
      matchupRating: 5,
      isStart: true,
      rank: 1,
      projectedPoints: 25.7,
      last4Games: [28.3, 22.1, 26.8, 24.5],
      injuryStatus: "Healthy"
    },
    {
      id: "4",
      name: "Ladd McConkey",
      pos: "WR",
      team: "LAC",
      expertPercent: 100,
      weekPoints: 12,
      matchup: "KC Fri 8:00 PM",
      matchupRating: 5,
      isStart: true,
      rank: 12,
      projectedPoints: 16.2,
      last4Games: [14.8, 17.3, 15.9, 16.7],
      injuryStatus: "Healthy"
    },
    {
      id: "5",
      name: "Sam LaPorta",
      pos: "TE",
      team: "DET",
      expertPercent: 100,
      weekPoints: 4,
      matchup: "@GB Sun 4:25 PM",
      matchupRating: 5,
      isStart: true,
      rank: 4,
      projectedPoints: 14.8,
      last4Games: [16.2, 13.9, 15.1, 14.3],
      injuryStatus: "Healthy"
    },
    {
      id: "6",
      name: "Kyren Williams",
      pos: "FLX",
      team: "LAR",
      expertPercent: 100,
      weekPoints: 12,
      matchup: "HOU Sun 4:25 PM",
      matchupRating: 5,
      isStart: true,
      rank: 12,
      projectedPoints: 19.4,
      last4Games: [21.7, 18.2, 20.1, 19.8],
      injuryStatus: "Healthy"
    },
    {
      id: "7",
      name: "Aaron Jones Sr.",
      pos: "FLX",
      team: "MIN",
      expertPercent: 100,
      weekPoints: 22,
      matchup: "@CHI Mon 8:15 PM",
      matchupRating: 5,
      isStart: true,
      rank: 22,
      projectedPoints: 17.6,
      last4Games: [18.9, 16.3, 17.8, 18.1],
      injuryStatus: "Healthy"
    },
    {
      id: "8",
      name: "Matt Gay",
      pos: "K",
      team: "WAS",
      expertPercent: 100,
      weekPoints: 9,
      matchup: "NYG Sun 1:00 PM",
      matchupRating: 5,
      isStart: true,
      rank: 9,
      projectedPoints: 8.5,
      last4Games: [9.2, 7.8, 8.9, 8.1],
      injuryStatus: "Healthy"
    },
    {
      id: "9",
      name: "Detroit Lions",
      pos: "DST",
      team: "DET",
      expertPercent: 100,
      weekPoints: 15,
      matchup: "@GB Sun 4:25 PM",
      matchupRating: 5,
      isStart: true,
      rank: 15,
      projectedPoints: 12.3,
      last4Games: [13.7, 11.8, 12.9, 12.1],
      injuryStatus: "Healthy"
    }
  ],
  benchPlayers: [
    {
      id: "10",
      name: "Trevor Lawrence",
      pos: "QB",
      team: "JAC",
      expertPercent: 21,
      weekPoints: 12,
      matchup: "CAR Sun 1:00 PM",
      matchupRating: 5,
      isStart: false,
      rank: 12,
      projectedPoints: 16.8,
      last4Games: [15.2, 17.9, 16.1, 17.3],
      injuryStatus: "Healthy"
    },
    {
      id: "11",
      name: "Jaylen Warren",
      pos: "RB",
      team: "PIT",
      expertPercent: 0,
      weekPoints: 29,
      matchup: "@NYJ Sun 1:00 PM",
      matchupRating: 5,
      isStart: false,
      rank: 29,
      projectedPoints: 8.7,
      last4Games: [7.2, 9.1, 8.3, 8.9],
      injuryStatus: "Healthy"
    },
    {
      id: "12",
      name: "R. Stevenson",
      pos: "RB",
      team: "NE",
      expertPercent: 0,
      weekPoints: 36,
      matchup: "LV Sun 1:00 PM",
      matchupRating: 5,
      isStart: false,
      rank: 36,
      projectedPoints: 6.4,
      last4Games: [5.8, 6.9, 6.1, 6.7],
      injuryStatus: "Healthy"
    },
    {
      id: "13",
      name: "Stefon Diggs",
      pos: "WR",
      team: "NE",
      expertPercent: 0,
      weekPoints: 40,
      matchup: "LV Sun 1:00 PM",
      matchupRating: 5,
      isStart: false,
      rank: 40,
      projectedPoints: 11.2,
      last4Games: [10.8, 11.7, 10.9, 11.5],
      injuryStatus: "Healthy"
    },
    {
      id: "14",
      name: "Keon Coleman",
      pos: "WR",
      team: "BUF",
      expertPercent: 0,
      weekPoints: 42,
      matchup: "BAL Sun 8:20 PM",
      matchupRating: 5,
      isStart: false,
      rank: 42,
      projectedPoints: 9.8,
      last4Games: [9.2, 10.1, 9.5, 10.3],
      injuryStatus: "Healthy"
    },
    {
      id: "15",
      name: "Chris Godwin Jr.",
      pos: "WR",
      team: "TB",
      expertPercent: 0,
      weekPoints: 113,
      matchup: "@ATL Sun 1:00 PM",
      matchupRating: 5,
      isStart: false,
      rank: 113,
      projectedPoints: 7.3,
      last4Games: [6.8, 7.7, 7.1, 7.5],
      injuryStatus: "Healthy"
    },
    {
      id: "16",
      name: "Jonnu Smith",
      pos: "TE",
      team: "PIT",
      expertPercent: 0,
      weekPoints: 20,
      matchup: "@NYJ Sun 1:00 PM",
      matchupRating: 5,
      isStart: false,
      rank: 20,
      projectedPoints: 5.9,
      last4Games: [5.4, 6.2, 5.7, 6.1],
      injuryStatus: "Healthy"
    }
  ],
  week: 1,
  leagueName: "4 Quarters Of War",
  teamName: "Jesse",
  totalProjectedPoints: 156.9,
  expertCount: 14
};

async function getYahooTeamRoster(token: string, leagueKey: string, teamKey: string, week: number): Promise<LineupPlayer[]> {
  try {
    // Get team roster from Yahoo
    const rosterUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${teamKey}/roster;week=${week}?format=json`;
    const response = await fetch(rosterUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roster: ${response.status}`);
    }

    const data = await response.json();
    // Parse roster data and convert to LineupPlayer format
    // This is a simplified version - in production you'd parse the actual Yahoo response
    
    return [];
  } catch (error) {
    console.error('Error fetching team roster:', error);
    return [];
  }
}

async function analyzeOptimalLineup(token: string, leagueKey: string, teamKey: string, week: number): Promise<OptimalLineupResponse> {
  try {
    // Get team roster
    const roster = await getYahooTeamRoster(token, leagueKey, teamKey, week);
    
    // If we have real data, use it; otherwise fall back to mock data
    if (roster.length > 0) {
      // Analyze roster and determine optimal lineup
      // This would involve complex algorithms to determine start/bench decisions
      return {
        startPlayers: roster.filter(p => p.isStart),
        benchPlayers: roster.filter(p => !p.isStart),
        week,
        leagueName: "Your League",
        teamName: "Your Team",
        totalProjectedPoints: roster.reduce((sum, p) => sum + p.projectedPoints, 0),
        expertCount: 14
      };
    }
    
    // Return mock data for now
    return {
      ...mockLineupData,
      week
    };
  } catch (error) {
    console.error('Error analyzing optimal lineup:', error);
    // Return mock data as fallback
    return {
      ...mockLineupData,
      week
    };
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
    const { week = '1', leagueKey, teamKey } = req.query;
    
    if (!leagueKey || !teamKey) {
      return res.status(400).json({ error: 'League key and team key are required' });
    }

    const weekNumber = parseInt(week as string);
    const lineup = await analyzeOptimalLineup(token, leagueKey as string, teamKey as string, weekNumber);
    
    return res.status(200).json(lineup);
  } catch (error) {
    console.error('Optimal lineup API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

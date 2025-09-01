import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeague } from "@/context/LeagueContext";

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

interface OptimalLineupProps {
  week?: string;
}

// Mock data for demonstration - this would come from the API based on selected league
const getMockLineupData = (leagueName: string, teamName: string): OptimalLineupResponse => ({
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
  leagueName,
  teamName,
  totalProjectedPoints: 156.9,
  expertCount: 14
});

async function fetchUserLeagues(): Promise<LeagueResponse> {
  try {
    const response = await fetch('/api/leagues', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leagues: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    // Return mock data for development
    return {
      leagues: [
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
      ]
    };
  }
}

async function fetchOptimalLineup(week: number, leagueName: string, teamName: string): Promise<OptimalLineupResponse> {
  try {
    // In a real implementation, this would fetch from the API
    // For now, return mock data based on the selected league
    return getMockLineupData(leagueName, teamName);
  } catch (error) {
    console.error('Error fetching optimal lineup:', error);
    return getMockLineupData(leagueName, teamName);
  }
}

export default function OptimalLineup({ week = "1" }: OptimalLineupProps) {
  const { connected, linkedLeague, user } = useLeague();
  const [editLineup, setEditLineup] = useState(false);
  const [multiLeagueMode, setMultiLeagueMode] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(week);

  // Fetch user's available leagues
  const { data: leagueData, isLoading: leaguesLoading } = useQuery({
    queryKey: ['user-leagues'],
    queryFn: fetchUserLeagues,
    enabled: connected,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const availableLeagues = leagueData?.leagues || [];
  const defaultLeague = linkedLeague?.leagueName || availableLeagues[0]?.name || "Steve Zic's Amazing League";
  const defaultTeam = linkedLeague?.teamName || availableLeagues[0]?.teams?.[0]?.name || "Steve's Team";

  const [selectedLeague, setSelectedLeague] = useState(defaultLeague);
  const [selectedTeam, setSelectedTeam] = useState(defaultTeam);

  // Update selected league when linkedLeague changes
  useEffect(() => {
    if (linkedLeague?.leagueName) {
      setSelectedLeague(linkedLeague.leagueName);
      setSelectedTeam(linkedLeague.teamName || linkedLeague.leagueName);
    }
  }, [linkedLeague]);

  // Update when league data loads
  useEffect(() => {
    if (availableLeagues.length > 0 && !selectedLeague) {
      const firstLeague = availableLeagues[0];
      setSelectedLeague(firstLeague.name);
      setSelectedTeam(firstLeague.teams?.[0]?.name || firstLeague.name);
    }
  }, [availableLeagues, selectedLeague]);

  const { data: lineupData, isLoading: lineupLoading, error } = useQuery({
    queryKey: ['optimal-lineup', selectedWeek, selectedLeague, selectedTeam],
    queryFn: () => fetchOptimalLineup(parseInt(selectedWeek), selectedLeague, selectedTeam),
    enabled: connected && !!selectedLeague && !!selectedTeam,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = lineupData || getMockLineupData(selectedLeague, selectedTeam);
  const isLoading = leaguesLoading || lineupLoading;

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < rating ? 'text-blue-400 fill-current' : 'text-gray-600'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const PlayerRow = ({ player }: { player: LineupPlayer }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-300">
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-gray-100">{player.name}</div>
            <div className="text-sm text-gray-400">{player.team} - {player.pos} {player.rank}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          player.expertPercent === 100 
            ? 'bg-green-900 text-green-300' 
            : player.expertPercent > 50 
            ? 'bg-yellow-900 text-yellow-300'
            : 'bg-gray-700 text-gray-300'
        }`}>
          {player.expertPercent > 0 ? `${player.expertPercent}%` : '-'}
        </span>
      </td>
      <td className="py-3 px-4 text-center font-medium text-gray-100">
        {player.weekPoints}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{player.matchup}</span>
          {renderStars(player.matchupRating)}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Optimal Lineup</h1>
            <p className="text-gray-400 mt-1">Based on a poll of {data.expertCount} experts</p>
            {connected && (
              <p className="text-sm text-gray-500 mt-1">
                {data.leagueName} • {data.teamName} • Week {data.week}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* League Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">League:</span>
              <Select value={selectedLeague} onValueChange={(value) => {
                const league = availableLeagues.find(l => l.name === value);
                if (league) {
                  setSelectedLeague(league.name);
                  setSelectedTeam(league.teams?.[0]?.name || league.name);
                }
              }}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {availableLeagues.map((league) => (
                    <SelectItem key={league.league_key} value={league.name} className="text-gray-100 hover:bg-gray-700">
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Week Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">Week:</span>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-20 bg-gray-800 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {[...Array(18)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()} className="text-gray-100 hover:bg-gray-700">
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={editLineup}
                onCheckedChange={setEditLineup}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm font-medium text-gray-300">Edit Lineup</span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={multiLeagueMode}
                onCheckedChange={setMultiLeagueMode}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm font-medium text-gray-300">Multi-League Mode</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Pick Experts</span>
            </Button>
          </div>
        </div>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>See Top Props for Your Team</span>
        </Button>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-300">
                Connect Your Yahoo Account
              </h3>
              <div className="mt-2 text-sm text-amber-200">
                <p>
                  To use the Optimal Lineup with real data, please connect your Yahoo Fantasy Football account first.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="/connect"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Connect Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-400">Loading optimal lineup...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">
                Error Loading Lineup
              </h3>
              <div className="mt-2 text-sm text-red-200">
                <p>There was an error loading your optimal lineup. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lineup Tables */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Start These Players */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-100">Start these players</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PLAYERS</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">EXPERT %</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">WEEK {data.week}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">MATCHUP</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {data.startPlayers.map((player) => (
                      <PlayerRow key={player.id} player={player} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bench These Players */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-100">Bench these players</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PLAYERS</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">EXPERT %</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">WEEK {data.week}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">MATCHUP</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {data.benchPlayers.map((player) => (
                      <PlayerRow key={player.id} player={player} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">
                  View Current Lineup
                </a>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">
                  Total Projected Points: <span className="font-semibold text-gray-100">{data.totalProjectedPoints}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">This lineup has already been set for your league.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

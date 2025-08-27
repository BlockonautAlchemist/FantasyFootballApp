import { StartSitInput, StartSitResult, WaiverItem, PlayerSummary, FAABGuidance, TradeResult, LineupRec, SoSCell, NewsItem } from "./types";

// Frontend contracts for API calls - signatures remain stable when moving to real backend

export async function getMe(): Promise<{id: string; displayName: string} | null> {
  // Currently reads from localStorage, replace with HTTP call to /api/me
  const user = localStorage.getItem('fantasy-assistant-user');
  return user ? JSON.parse(user) : null;
}

export async function listYahooLeagues(): Promise<any[]> {
  // Currently returns mocks, replace with HTTP call to /api/yahoo/leagues
  const mockData = await import("../mocks/mockLeagues.json");
  return mockData.default;
}

export async function setYahooLeague(payload: {
  leagueKey: string; 
  leagueName: string; 
  teamKey?: string; 
  teamName?: string;
}): Promise<void> {
  // Currently persists to localStorage, replace with HTTP call to /api/yahoo/league
  localStorage.setItem('fantasy-assistant-league', JSON.stringify(payload));
}

export async function getRoster(week: number): Promise<any[]> {
  // Currently returns mocks, replace with HTTP call to /api/yahoo/roster?week={week}
  const mockData = await import("../mocks/mockRoster.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 300);
  });
}

export async function getFreeAgents(pos?: string): Promise<any[]> {
  // Currently returns mocks, replace with HTTP call to /api/yahoo/free-agents?pos={pos}
  const mockData = await import("../mocks/mockFreeAgents.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default.filter(p => !pos || p.position === pos)), 400);
  });
}

export async function comparePlayers(input: StartSitInput): Promise<StartSitResult & {facts: any; sos: any; input: StartSitInput}> {
  const mockData = await import("../mocks/playerCompare.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      ...mockData.default.result,
      facts: mockData.default.facts,
      sos: mockData.default.sos,
      input: mockData.default.input
    }), 500);
  });
}

export async function getWaivers(week: number, position?: string): Promise<{candidates: WaiverItem[]; drops: PlayerSummary[]; faab: FAABGuidance[]}> {
  const mockData = await import("../mocks/waivers.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 300);
  });
}

export async function analyzeTrade(sideA: PlayerSummary[], sideB: PlayerSummary[]): Promise<TradeResult> {
  const mockData = await import("../mocks/trade.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 800);
  });
}

export async function optimizeLineup(week: number): Promise<LineupRec> {
  const mockData = await import("../mocks/lineup.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 600);
  });
}

export async function getSoS(pos?: string): Promise<SoSCell[]> {
  const mockData = await import("../mocks/sos.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 400);
  });
}

export async function getNews(): Promise<NewsItem[]> {
  const mockData = await import("../mocks/news.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 200);
  });
}

export async function searchPlayers(query: string): Promise<PlayerSummary[]> {
  // Mock implementation - will be replaced with real API call to /api/search/players?q={query}
  const mockData = await import("../mocks/mockFreeAgents.json");
  
  // Add some popular players to the search results for better demo experience
  const additionalPlayers: PlayerSummary[] = [
    { id: "nfl.p.1234", name: "Jaylen Waddle", pos: "WR", team: "MIA" },
    { id: "nfl.p.5678", name: "Courtland Sutton", pos: "WR", team: "DEN" },
    { id: "nfl.p.9999", name: "Josh Allen", pos: "QB", team: "BUF" },
    { id: "nfl.p.8888", name: "Christian McCaffrey", pos: "RB", team: "SF" },
    { id: "nfl.p.7777", name: "Cooper Kupp", pos: "WR", team: "LAR" },
    { id: "nfl.p.6666", name: "Travis Kelce", pos: "TE", team: "KC" },
    { id: "nfl.p.5555", name: "Derrick Henry", pos: "RB", team: "BAL" },
    { id: "nfl.p.4444", name: "Tyreek Hill", pos: "WR", team: "MIA" },
    { id: "nfl.p.3333", name: "Davante Adams", pos: "WR", team: "LV" },
    { id: "nfl.p.2222", name: "Lamar Jackson", pos: "QB", team: "BAL" }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query || query.length < 2) {
        resolve([]);
        return;
      }

      // Combine mock free agents with additional popular players
      const allPlayers = [
        ...additionalPlayers,
        ...mockData.default.map((player: any) => ({
          id: player.playerId,
          name: player.name,
          pos: player.position as PlayerSummary['pos'],
          team: player.team
        }))
      ];

      // Filter based on query
      const filtered = allPlayers.filter(player => 
        player.name.toLowerCase().includes(query.toLowerCase()) ||
        player.team.toLowerCase().includes(query.toLowerCase())
      );

      // Sort by relevance (exact matches first, then contains)
      const sorted = filtered.sort((a, b) => {
        const aNameExact = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bNameExact = b.name.toLowerCase().startsWith(query.toLowerCase());
        
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;
        return a.name.localeCompare(b.name);
      });

      resolve(sorted.slice(0, 10)); // Limit to 10 results
    }, 300); // Simulate API delay
  });
}

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

import { StartSitInput, StartSitResult, WaiverItem, PlayerSummary, FAABGuidance, TradeResult, LineupRec, SoSCell, NewsItem } from "./types";

export async function comparePlayers(input: StartSitInput): Promise<StartSitResult & {facts: any; sos: any; input: StartSitInput}> {
  const mockData = await import("../mocks/playerCompare.mock.json");
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData.default), 500);
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

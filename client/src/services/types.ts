export interface PlayerSummary {
  id: string;
  name: string;
  pos: "QB" | "RB" | "WR" | "TE" | "DST" | "K";
  team: string;
  status?: string;
  bye?: number;
}

export interface StartSitInput {
  playerAId: string;
  playerBId: string;
  week: number;
  scoring: "standard" | "half_ppr" | "ppr";
}

export interface StartSitResult {
  recommendation: "A" | "B";
  confidence: number;
  reasons: string[];
  pivots?: string[];
  facts: any;
}

export interface WaiverItem {
  id: string;
  name: string;
  team: string;
  pos: string;
  avail: number;
  proj: number;
  roleTrend: "up" | "down" | "flat";
  notes?: string;
}

export interface FAABGuidance {
  id: string;
  min: number;
  likely: number;
  max: number;
  rationale: string;
}

export interface TradeSide {
  players: PlayerSummary[];
}

export interface TradeResult {
  verdict: "Accept" | "Reject" | "Consider";
  delta: number;
  rosImpact: string;
  risk: number;
  reasons: string[];
}

export interface LineupRec {
  starters: string[];
  bench: string[];
  pivots?: string[];
  reasons: string[];
}

export interface SoSCell {
  week: number;
  pos: string;
  strength: number;
}

export interface NewsItem {
  id: string;
  title: string;
  tag: "injury" | "role" | "matchup" | "other";
  summary: string;
  timestamp: string;
  impact: "High" | "Medium" | "Low";
  timeframe?: string;
}

export type LeagueKey = string;
export type TeamKey = string;

export type RosteredPlayer = {
  player_key: string;
  name: string;
  status?: string;            // Q, O, D, IR, NA, etc.
  editorial_team_abbr?: string;
  eligible_positions: string[]; // e.g., ['WR','RB','W/R/T']
  selected_position?: string;   // e.g., 'WR', 'BN'
};

export type LeagueSlots = { [slot: string]: number }; // e.g., { QB:1, RB:2, WR:2, TE:1, 'W/R/T':1, K:1, DEF:1 }

export type SessionData = {
  connected: boolean;
  league_key: string | null;
  team_key: string | null;
  error?: string;
};

export type LeagueSettings = {
  league_key: string;
  name: string;
  season: string;
  scoring_type: string;
  roster_positions: LeagueSlots;
  num_teams: number;
  current_week?: number;
};

export type TeamRoster = {
  team_key: string;
  players: RosteredPlayer[];
  week?: number;
};

export type OptimalLineup = {
  starters: Record<string, RosteredPlayer[]>;
  bench: RosteredPlayer[];
  recommendations: {
    start: RosteredPlayer[];
    sit: RosteredPlayer[];
    reasons: string[];
  };
};

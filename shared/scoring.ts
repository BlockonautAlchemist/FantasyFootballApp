import type { RosteredPlayer, LeagueSlots } from './types';

// Simple MVP heuristic (no projections yet):
// - Hard penalties for OUT/IR/DL
// - Mild penalty for Q/NA
// - Position weight: RB > WR > TE > QB for FLEX
const STATUS_PENALTY: Record<string, number> = {
  O: -100, OUT: -100, IR: -100, DL: -60, D: -40, PUP: -40,
  Q: -15, NA: -20, SUSP: -40,
};

const BASE_POS_WEIGHT: Record<string, number> = {
  QB: 75,
  RB: 90,
  WR: 85,
  TE: 70,
  K: 20,
  DEF: 20,
  'W/R': 0, 'W/R/T': 0, 'Q/W/R/T': 0, // filled by eligible base
};

function statusPenalty(s?: string) {
  if (!s) return 0;
  const key = s.toUpperCase();
  return STATUS_PENALTY[key] ?? 0;
}

export function scorePlayer(p: RosteredPlayer, forSlot: string): number {
  const base =
    forSlot === 'W/R/T'
      ? Math.max(BASE_POS_WEIGHT.RB, BASE_POS_WEIGHT.WR, BASE_POS_WEIGHT.TE) // prefer RB/WR/TE
      : BASE_POS_WEIGHT[forSlot] ?? Math.max(...p.eligible_positions.map(ep => BASE_POS_WEIGHT[ep] ?? 0), 0);

  return base + statusPenalty(p.status);
}

// Greedy fill: go slot-by-slot using current roster pool
export function buildOptimalLineup(
  slots: LeagueSlots,
  roster: RosteredPlayer[]
) {
  const starters: Record<string, RosteredPlayer[]> = {};
  const bench: RosteredPlayer[] = [...roster];

  const takeBestForSlot = (slot: string) => {
    let bestIdx = -1;
    let bestScore = -1e9;
    for (let i = 0; i < bench.length; i++) {
      const p = bench[i];
      // If slot is specific (QB/RB/WR/TE/K/DEF), player must be eligible for it.
      if (!isEligible(p, slot)) continue;
      const sc = scorePlayer(p, slot);
      if (sc > bestScore) { bestScore = sc; bestIdx = i; }
    }
    if (bestIdx >= 0) {
      const pick = bench.splice(bestIdx, 1)[0];
      starters[slot] = starters[slot] || [];
      starters[slot].push(pick);
    }
  };

  Object.entries(slots).forEach(([slot, count]) => {
    for (let i = 0; i < count; i++) takeBestForSlot(slot);
  });

  return { starters, bench };
}

function isEligible(p: RosteredPlayer, slot: string) {
  // exact slot (QB/RB/WR/TE/K/DEF)
  if (p.eligible_positions.includes(slot)) return true;
  // FLEX handling
  if (slot === 'W/R/T') {
    return p.eligible_positions.some(ep => ep === 'RB' || ep === 'WR' || ep === 'TE');
  }
  if (slot === 'Q/W/R/T') {
    return p.eligible_positions.some(ep => ep === 'QB' || ep === 'RB' || ep === 'WR' || ep === 'TE');
  }
  if (slot === 'W/R') {
    return p.eligible_positions.some(ep => ep === 'RB' || ep === 'WR');
  }
  return false;
}

export function generateStartSitRecommendations(
  optimalLineup: { starters: Record<string, RosteredPlayer[]>; bench: RosteredPlayer[] },
  currentRoster: RosteredPlayer[]
): { start: RosteredPlayer[]; sit: RosteredPlayer[]; reasons: string[] } {
  const start: RosteredPlayer[] = [];
  const sit: RosteredPlayer[] = [];
  const reasons: string[] = [];

  // Find players who should start but aren't currently starting
  Object.entries(optimalLineup.starters).forEach(([slot, players]) => {
    players.forEach(player => {
      const currentPlayer = currentRoster.find(p => p.player_key === player.player_key);
      if (currentPlayer && currentPlayer.selected_position !== slot) {
        start.push(player);
        reasons.push(`${player.name} should start at ${slot} instead of ${currentPlayer.selected_position || 'bench'}`);
      }
    });
  });

  // Find players who are starting but should be benched
  currentRoster.forEach(player => {
    if (player.selected_position && player.selected_position !== 'BN') {
      const isInOptimal = Object.values(optimalLineup.starters).some(players => 
        players.some(p => p.player_key === player.player_key)
      );
      if (!isInOptimal) {
        sit.push(player);
        reasons.push(`${player.name} should be benched (currently at ${player.selected_position})`);
      }
    }
  });

  return { start, sit, reasons };
}

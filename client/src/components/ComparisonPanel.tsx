interface Player {
  name: string;
  team: string;
  pos: string;
  opp: string;
  proj: number;
  last4: number[];
  snap: number;
  tgtShare: number;
  inj: string;
}

interface ComparisonPanelProps {
  playerA: Player;
  playerB: Player;
  recommendation: "A" | "B";
}

export default function ComparisonPanel({ playerA, playerB, recommendation }: ComparisonPanelProps) {
  const last4AvgA = playerA.last4.reduce((a, b) => a + b, 0) / playerA.last4.length;
  const last4AvgB = playerB.last4.reduce((a, b) => a + b, 0) / playerB.last4.length;

  const getPlayerHeaderClass = (player: "A" | "B") => {
    return recommendation === player 
      ? "bg-secondary/10 p-4 rounded-lg" 
      : "bg-surface2 p-4 rounded-lg";
  };

  const getStatClass = (valueA: number, valueB: number, isPlayerA: boolean) => {
    if (valueA === valueB) return "";
    const isBetter = isPlayerA ? valueA > valueB : valueB > valueA;
    return isBetter ? "font-medium text-secondary" : "";
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Player Comparison</h3>
      
      {/* Player Headers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className={getPlayerHeaderClass("A")}>
            <h4 className="font-bold text-lg text-text">{playerA.name}</h4>
            <p className="text-sm text-textDim">{playerA.team} {playerA.pos} vs {playerA.opp}</p>
            <p className="text-xs text-textDim">{playerA.inj}</p>
          </div>
        </div>
        <div className="text-center">
          <div className={getPlayerHeaderClass("B")}>
            <h4 className="font-bold text-lg text-text">{playerB.name}</h4>
            <p className="text-sm text-textDim">{playerB.team} {playerB.pos} vs {playerB.opp}</p>
            <p className="text-xs text-textDim">{playerB.inj}</p>
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-text font-medium">Stat</th>
              <th className="text-center py-2 text-text font-medium">{playerA.name.split(" ")[0]}</th>
              <th className="text-center py-2 text-text font-medium">{playerB.name.split(" ")[0]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="py-2 text-textDim">Projection</td>
              <td className={`text-center py-2 ${getStatClass(playerA.proj, playerB.proj, true)}`}>
                {playerA.proj}
              </td>
              <td className={`text-center py-2 ${getStatClass(playerA.proj, playerB.proj, false)}`}>
                {playerB.proj}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-textDim">Last 4 Avg</td>
              <td className={`text-center py-2 ${getStatClass(last4AvgA, last4AvgB, true)}`}>
                {last4AvgA.toFixed(1)}
              </td>
              <td className={`text-center py-2 ${getStatClass(last4AvgA, last4AvgB, false)}`}>
                {last4AvgB.toFixed(1)}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-textDim">Snap %</td>
              <td className={`text-center py-2 ${getStatClass(playerA.snap, playerB.snap, true)}`}>
                {Math.round(playerA.snap * 100)}%
              </td>
              <td className={`text-center py-2 ${getStatClass(playerA.snap, playerB.snap, false)}`}>
                {Math.round(playerB.snap * 100)}%
              </td>
            </tr>
            <tr>
              <td className="py-2 text-textDim">Target Share</td>
              <td className={`text-center py-2 ${getStatClass(playerA.tgtShare, playerB.tgtShare, true)}`}>
                {Math.round(playerA.tgtShare * 100)}%
              </td>
              <td className={`text-center py-2 ${getStatClass(playerA.tgtShare, playerB.tgtShare, false)}`}>
                {Math.round(playerB.tgtShare * 100)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
      : "bg-slate-100 p-4 rounded-lg";
  };

  const getStatClass = (valueA: number, valueB: number, isPlayerA: boolean) => {
    if (valueA === valueB) return "";
    const isBetter = isPlayerA ? valueA > valueB : valueB > valueA;
    return isBetter ? "font-medium text-secondary" : "";
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Player Comparison</h3>
      
      {/* Player Headers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className={getPlayerHeaderClass("A")}>
            <h4 className="font-bold text-lg text-slate-800">{playerA.name}</h4>
            <p className="text-sm text-slate-600">{playerA.team} {playerA.pos} vs {playerA.opp}</p>
            <p className="text-xs text-slate-500">{playerA.inj}</p>
          </div>
        </div>
        <div className="text-center">
          <div className={getPlayerHeaderClass("B")}>
            <h4 className="font-bold text-lg text-slate-800">{playerB.name}</h4>
            <p className="text-sm text-slate-600">{playerB.team} {playerB.pos} vs {playerB.opp}</p>
            <p className="text-xs text-slate-500">{playerB.inj}</p>
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-slate-700 font-medium">Stat</th>
              <th className="text-center py-2 text-slate-700 font-medium">{playerA.name.split(" ")[0]}</th>
              <th className="text-center py-2 text-slate-700 font-medium">{playerB.name.split(" ")[0]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 text-slate-600">Projection</td>
              <td className={`text-center py-2 ${getStatClass(playerA.proj, playerB.proj, true)}`}>
                {playerA.proj}
              </td>
              <td className={`text-center py-2 ${getStatClass(playerA.proj, playerB.proj, false)}`}>
                {playerB.proj}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-slate-600">Last 4 Avg</td>
              <td className={`text-center py-2 ${getStatClass(last4AvgA, last4AvgB, true)}`}>
                {last4AvgA.toFixed(1)}
              </td>
              <td className={`text-center py-2 ${getStatClass(last4AvgA, last4AvgB, false)}`}>
                {last4AvgB.toFixed(1)}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-slate-600">Snap %</td>
              <td className={`text-center py-2 ${getStatClass(playerA.snap, playerB.snap, true)}`}>
                {Math.round(playerA.snap * 100)}%
              </td>
              <td className={`text-center py-2 ${getStatClass(playerA.snap, playerB.snap, false)}`}>
                {Math.round(playerB.snap * 100)}%
              </td>
            </tr>
            <tr>
              <td className="py-2 text-slate-600">Target Share</td>
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

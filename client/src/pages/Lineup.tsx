import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import ConnectionCallout from "@/components/ConnectionCallout";
import { optimizeLineup } from "@/services/api";

export default function Lineup() {
  const [optimized, setOptimized] = useState(false);

  const { data: lineupRec, isLoading } = useQuery({
    queryKey: ["/api/lineup", 8],
    queryFn: () => optimizeLineup(8),
    enabled: optimized,
  });

  const handleOptimize = () => {
    setOptimized(true);
  };

  const mockRoster = [
    { name: "Josh Allen", pos: "QB", team: "BUF" },
    { name: "Tua Tagovailoa", pos: "QB", team: "MIA" },
    { name: "Christian McCaffrey", pos: "RB", team: "SF" },
    { name: "Saquon Barkley", pos: "RB", team: "PHI" },
    { name: "Rachaad White", pos: "RB", team: "TB" },
    { name: "Tyreek Hill", pos: "WR", team: "MIA" },
    { name: "Stefon Diggs", pos: "WR", team: "HOU" },
    { name: "Courtland Sutton", pos: "WR", team: "DEN" },
    { name: "Jordan Addison", pos: "WR", team: "MIN" },
    { name: "Romeo Doubs", pos: "WR", team: "GB" },
    { name: "Travis Kelce", pos: "TE", team: "KC" },
    { name: "Tyler Higbee", pos: "TE", team: "LAR" },
    { name: "Philadelphia DST", pos: "DST", team: "PHI" },
    { name: "Justin Tucker", pos: "K", team: "BAL" }
  ];

  const positions = ["QB", "RB", "WR", "TE", "DST", "K"];

  return (
    <div>
      <PageHeader 
        title="Lineup Optimizer" 
        subtitle="Get optimal starting lineup with pivot suggestions" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* My Roster */}
      <div className="bg-surface rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">My Roster</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map(pos => (
            <div key={pos} className="space-y-2">
              <h4 className="font-medium text-slate-700 text-sm">{pos}</h4>
              {mockRoster.filter(player => player.pos === pos).map((player, index) => {
                const initials = player.name.split(" ").map(n => n[0]).join("").toUpperCase();
                return (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded" data-testid={`roster-player-${player.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{player.name}</p>
                      <p className="text-xs text-slate-600">{player.team}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button 
            onClick={handleOptimize} 
            className="btn-primary"
            disabled={isLoading}
            data-testid="button-recommend-lineup"
          >
            <i className="fas fa-cogs mr-2"></i>
            {isLoading ? "Optimizing..." : "Recommend Lineup"}
          </Button>
        </div>
      </div>

      {/* Lineup Recommendations */}
      {lineupRec && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommended Starters */}
          <div className="bg-surface rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              <i className="fas fa-star text-secondary mr-2"></i>
              Recommended Starters
            </h3>
            <div className="space-y-3">
              {lineupRec.starters.map((player, index) => {
                const initials = player.split(" ").map(n => n[0]).join("").toUpperCase();
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded" data-testid={`starter-${player.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-xs font-bold text-secondary">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{player}</p>
                      <p className="text-xs text-slate-600">Starter</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench & Pivots */}
          <div className="space-y-6">
            {/* Bench */}
            <div className="bg-surface rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                <i className="fas fa-chair text-slate-500 mr-2"></i>
                Bench
              </h3>
              <div className="space-y-2">
                {lineupRec.bench.map((player, index) => {
                  const initials = player.split(" ").map(n => n[0]).join("").toUpperCase();
                  return (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {initials}
                      </div>
                      <p className="text-sm text-slate-700">{player}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pivot Options */}
            {lineupRec.pivots && (
              <div className="bg-surface rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  <i className="fas fa-exchange-alt text-warning mr-2"></i>
                  Pivot Options
                </h3>
                <div className="space-y-2">
                  {lineupRec.pivots.map((pivot, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-slate-700">{pivot}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reasoning */}
      {lineupRec && (
        <div className="mt-8 bg-surface rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Lineup Reasoning</h3>
          <ul className="space-y-2">
            {lineupRec.reasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <i className="fas fa-lightbulb text-warning text-sm mt-1 mr-3"></i>
                <span className="text-slate-600">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

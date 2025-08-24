import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import TierBadge from "@/components/TierBadge";
import RiskChip from "@/components/RiskChip";
import FAABSlider from "@/components/FAABSlider";
import { Button } from "@/components/ui/button";
import { getWaivers } from "@/services/api";

const positions = ["All", "QB", "RB", "WR", "TE"];

export default function Waivers() {
  const [selectedPosition, setSelectedPosition] = useState("All");

  const { data: waiverData, isLoading } = useQuery({
    queryKey: ["/api/waivers", 8, selectedPosition === "All" ? undefined : selectedPosition],
    queryFn: () => getWaivers(8, selectedPosition === "All" ? undefined : selectedPosition),
  });

  const getTierFromProj = (proj: number) => {
    if (proj >= 15) return 1;
    if (proj >= 12) return 2;
    if (proj >= 9) return 3;
    if (proj >= 6) return 4;
    return 5;
  };

  const getRiskFromTrend = (trend: string, avail: number) => {
    if (trend === "up" && avail > 80) return "Low";
    if (trend === "down" || avail < 50) return "High";
    return "Med";
  };

  return (
    <div>
      <PageHeader 
        title="Waiver Wire" 
        subtitle="Top available players with FAAB guidance and drop suggestions" 
      />

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Filter by Position:</label>
          <div className="flex gap-2">
            {positions.map((pos) => (
              <Button
                key={pos}
                variant={selectedPosition === pos ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPosition(pos)}
                data-testid={`filter-${pos.toLowerCase()}`}
              >
                {pos}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8" data-testid="loading-waivers">
          <i className="fas fa-spinner fa-spin text-2xl text-slate-400 mb-2"></i>
          <p className="text-slate-600">Loading waiver recommendations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Players */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-slate-800">Top Available Players</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {waiverData?.candidates.map((player) => {
                  const initials = player.name.split(" ").map(n => n[0]).join("").toUpperCase();
                  const tierColors = ["bg-primary/10", "bg-secondary/10", "bg-warning/10"];
                  const iconColors = ["text-primary", "text-secondary", "text-warning"];
                  const colorIndex = Math.floor(Math.random() * 3);
                  
                  return (
                    <div key={player.id} className="p-4 hover:bg-gray-50" data-testid={`player-${player.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${tierColors[colorIndex]} rounded-full flex items-center justify-center text-xs font-bold ${iconColors[colorIndex]}`}>
                            {initials}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{player.name}</h4>
                            <p className="text-sm text-slate-600">{player.team} {player.pos}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-slate-800">{player.avail}%</div>
                            <div className="text-xs text-slate-500">Available</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-slate-800">{player.proj}</div>
                            <div className="text-xs text-slate-500">Proj</div>
                          </div>
                          <TierBadge tier={getTierFromProj(player.proj)} />
                          <RiskChip risk={getRiskFromTrend(player.roleTrend, player.avail) as "Low" | "Med" | "High"} />
                        </div>
                      </div>
                      {player.notes && (
                        <div className="mt-2 flex items-center">
                          <i className={`fas ${player.roleTrend === "up" ? "fa-arrow-up text-secondary" : player.roleTrend === "down" ? "fa-arrow-down text-danger" : "fa-minus text-slate-400"} text-xs mr-1`}></i>
                          <span className="text-xs text-slate-600">{player.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAAB & Drops */}
          <div className="lg:col-span-1 space-y-6">
            {/* FAAB Guidance */}
            <div className="bg-surface rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">FAAB Guidance</h3>
              <div className="space-y-4">
                {waiverData?.faab.map((guidance) => (
                  <FAABSlider key={guidance.id} guidance={guidance} />
                ))}
              </div>
            </div>

            {/* Suggested Drops */}
            <div className="bg-surface rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Suggested Drops</h3>
              <div className="space-y-3">
                {waiverData?.drops.map((player) => {
                  const initials = player.name.split(" ").map(n => n[0]).join("").toUpperCase();
                  const isDrop = player.status === "IR";
                  
                  return (
                    <div 
                      key={player.id} 
                      className={`flex items-center justify-between p-2 rounded ${isDrop ? "bg-red-50" : "bg-yellow-50"}`}
                      data-testid={`drop-${player.id}`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${isDrop ? "bg-red-100" : "bg-yellow-100"} rounded-full flex items-center justify-center text-xs font-bold ${isDrop ? "text-red-600" : "text-yellow-600"}`}>
                          {isDrop ? "IR" : "BN"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{player.name}</p>
                          <p className="text-xs text-slate-600">{player.team} {player.pos}{player.status ? ` - ${player.status}` : ""}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${isDrop ? "text-red-600" : "text-yellow-600"}`}>
                        {isDrop ? "Drop" : "Consider"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

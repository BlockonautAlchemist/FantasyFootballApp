import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { analyzeTrade } from "@/services/api";
import { PlayerSummary } from "@/services/types";

const mockPlayersGive: PlayerSummary[] = [
  { id: "ceedee-lamb", name: "CeeDee Lamb", pos: "WR", team: "DAL" },
  { id: "jonathan-taylor", name: "Jonathan Taylor", pos: "RB", team: "IND" }
];

const mockPlayersReceive: PlayerSummary[] = [
  { id: "tyreek-hill", name: "Tyreek Hill", pos: "WR", team: "MIA" },
  { id: "aaron-jones", name: "Aaron Jones", pos: "RB", team: "MIN" },
  { id: "dk-metcalf", name: "DK Metcalf", pos: "WR", team: "SEA" }
];

export default function Trade() {
  const [playersGive, setPlayersGive] = useState<PlayerSummary[]>(mockPlayersGive);
  const [playersReceive, setPlayersReceive] = useState<PlayerSummary[]>(mockPlayersReceive);
  const [analyzed, setAnalyzed] = useState(false);

  const { data: tradeResult, isLoading } = useQuery({
    queryKey: ["/api/trade", playersGive, playersReceive],
    queryFn: () => analyzeTrade(playersGive, playersReceive),
    enabled: analyzed,
  });

  const handleAnalyze = () => {
    setAnalyzed(true);
  };

  const removePlayer = (playerId: string, isGiving: boolean) => {
    if (isGiving) {
      setPlayersGive(prev => prev.filter(p => p.id !== playerId));
    } else {
      setPlayersReceive(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const getPlayerInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div>
      <PageHeader 
        title="Trade Analyzer" 
        subtitle="Evaluate trade offers with value analysis and risk assessment" 
      />

      {/* Trade Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">You Give</h3>
          <div className="space-y-3">
            {playersGive.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                    {getPlayerInitials(player.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{player.name}</p>
                    <p className="text-sm text-slate-600">{player.team} {player.pos}</p>
                  </div>
                </div>
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removePlayer(player.id, true)}
                  data-testid={`remove-give-${player.id}`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button 
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded text-slate-500 hover:border-gray-400 hover:text-slate-600"
              data-testid="button-add-give-player"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Player
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">You Receive</h3>
          <div className="space-y-3">
            {playersReceive.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                    {getPlayerInitials(player.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{player.name}</p>
                    <p className="text-sm text-slate-600">{player.team} {player.pos}</p>
                  </div>
                </div>
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removePlayer(player.id, false)}
                  data-testid={`remove-receive-${player.id}`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button 
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded text-slate-500 hover:border-gray-400 hover:text-slate-600"
              data-testid="button-add-receive-player"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Player
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <Button 
          onClick={handleAnalyze} 
          className="btn-primary text-lg px-8 py-3"
          disabled={isLoading}
          data-testid="button-analyze-trade"
        >
          <i className="fas fa-calculator mr-2"></i>
          {isLoading ? "Analyzing..." : "Analyze Trade"}
        </Button>
      </div>

      {/* Trade Analysis Results */}
      {tradeResult && (
        <div className="bg-surface rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">Trade Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verdict */}
            <div className="text-center">
              <div className={`${tradeResult.verdict === "Accept" ? "bg-secondary/10 text-secondary" : tradeResult.verdict === "Reject" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"} text-lg font-bold py-4 px-6 rounded-lg mb-4`}>
                {tradeResult.verdict.toUpperCase()} TRADE
              </div>
              <div className="text-3xl font-bold text-secondary mb-2" data-testid="text-value-delta">
                +{tradeResult.delta}
              </div>
              <div className="text-sm text-slate-600">Value Delta (Points/Week)</div>
            </div>

            {/* Risk Assessment */}
            <div className="text-center">
              <div className="bg-warning/10 p-4 rounded-lg mb-4">
                <i className="fas fa-exclamation-triangle text-warning text-2xl mb-2"></i>
                <div className="font-semibold text-slate-800">Medium Risk</div>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2" data-testid="text-risk-score">
                {tradeResult.risk}/5
              </div>
              <div className="text-sm text-slate-600">Risk Score</div>
            </div>

            {/* ROS Impact */}
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-lg mb-4">
                <i className="fas fa-chart-line text-primary text-2xl mb-2"></i>
                <div className="font-semibold text-slate-800">{tradeResult.rosImpact}</div>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">+8%</div>
              <div className="text-sm text-slate-600">Championship Odds</div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-slate-800 mb-4">Analysis Summary</h4>
            <ul className="space-y-2">
              {tradeResult.reasons.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <i className={`fas ${index === 2 ? "fa-exclamation text-warning" : "fa-check text-secondary"} text-sm mt-1 mr-3`}></i>
                  <span className="text-slate-600">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

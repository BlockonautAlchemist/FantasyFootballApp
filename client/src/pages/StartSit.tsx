import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import PlayerSearch from "@/components/PlayerSearch";
import ComparisonPanel from "@/components/ComparisonPanel";
import ConnectionCallout from "@/components/ConnectionCallout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { comparePlayers } from "@/services/api";
import { StartSitInput } from "@/services/types";

export default function StartSit() {
  const [playerA, setPlayerA] = useState("Jaylen Waddle");
  const [playerB, setPlayerB] = useState("Courtland Sutton");
  const [week, setWeek] = useState("8");
  const [scoring, setScoring] = useState("half_ppr");
  const [submitted, setSubmitted] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ["/api/start-sit", playerA, playerB, week, scoring],
    queryFn: () => comparePlayers({
      playerAId: "nfl.p.1234",
      playerBId: "nfl.p.5678", 
      week: parseInt(week),
      scoring: scoring as "standard" | "half_ppr" | "ppr"
    }),
    enabled: submitted,
  });

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div>
      <PageHeader 
        title="Start/Sit Analyzer" 
        subtitle="Compare two players and get a data-driven recommendation" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* Input Form */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Player A</label>
            <PlayerSearch 
              placeholder="Search player..." 
              value={playerA}
              onChange={setPlayerA}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Player B</label>
            <PlayerSearch 
              placeholder="Search player..." 
              value={playerB}
              onChange={setPlayerB}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Week</label>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger data-testid="select-week">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">Week 8</SelectItem>
                <SelectItem value="9">Week 9</SelectItem>
                <SelectItem value="10">Week 10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Scoring</label>
            <Select value={scoring} onValueChange={setScoring}>
              <SelectTrigger data-testid="select-scoring">
                <SelectValue placeholder="Select scoring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="half_ppr">Half PPR</SelectItem>
                <SelectItem value="ppr">Full PPR</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          className="btn-primary"
          disabled={isLoading}
          data-testid="button-compare-players"
        >
          <i className="fas fa-search mr-2"></i>
          {isLoading ? "Comparing..." : "Compare Players"}
        </Button>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendation */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Recommendation</h3>
              <div className="text-center mb-6">
                <div className="bg-secondary/10 text-secondary text-lg font-bold py-3 px-4 rounded-lg mb-3">
                  START {result.recommendation === "A" ? result.facts.playerA.name.toUpperCase() : result.facts.playerB.name.toUpperCase()}
                </div>
                <div className="text-2xl font-bold text-text mb-1" data-testid="text-confidence">
                  {Math.round(result.confidence * 100)}%
                </div>
                <div className="text-sm text-textDim">Confidence</div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-text">Key Reasons:</h4>
                <ul className="text-sm text-textDim space-y-2">
                  {result.reasons?.map((reason: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <i className="fas fa-check text-secondary text-xs mt-1 mr-2"></i>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              {result.pivots && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium text-text mb-2">Pivot Options:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.pivots?.map((pivot: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {pivot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Player Comparison */}
          <div className="lg:col-span-2">
            <ComparisonPanel 
              playerA={result.facts.playerA}
              playerB={result.facts.playerB}
              recommendation={result.recommendation}
            />
          </div>
        </div>
      )}
    </div>
  );
}

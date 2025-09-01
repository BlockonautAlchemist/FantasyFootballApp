import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import PlayerPicker from "@/components/PlayerPicker";
import ComparisonPanel from "@/components/ComparisonPanel";
import ConnectionCallout from "@/components/ConnectionCallout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { comparePlayers } from "@/services/api";
import { StartSitInput, PlayerSummary } from "@/services/types";
import { useLeague } from "@/context/LeagueContext";

export default function StartSit() {
  const { connected, linkedLeague } = useLeague();
  const [playerA, setPlayerA] = useState<PlayerSummary | null>(null);
  const [playerB, setPlayerB] = useState<PlayerSummary | null>(null);
  const [week, setWeek] = useState("8");
  const [scoring, setScoring] = useState("half_ppr");
  const [submitted, setSubmitted] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ["/api/start-sit", playerA?.id, playerB?.id, week, scoring],
    queryFn: () => {
      if (!playerA?.id || !playerB?.id) {
        throw new Error("Player IDs are required");
      }
      return comparePlayers({
        playerAId: playerA.id,
        playerBId: playerB.id,
        week: parseInt(week),
        scoring: scoring as "standard" | "half_ppr" | "ppr"
      });
    },
    enabled: submitted && !!playerA?.id && !!playerB?.id && connected,
  });

  const handleSubmit = () => {
    if (playerA?.id && playerB?.id) {
      setSubmitted(true);
    }
  };

  // Reset submitted state when players change
  useEffect(() => {
    setSubmitted(false);
  }, [playerA?.id, playerB?.id]);

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

      {/* Not Connected Message */}
      {!connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Connect Your Yahoo Account
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  To use the Start/Sit Analyzer with real data, please connect your Yahoo Fantasy Football account first.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="/connect"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Connect Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Player A</label>
            <PlayerPicker 
              placeholder="Search player..." 
              value={playerA?.name || ""}
              onSelect={setPlayerA}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Player B</label>
            <PlayerPicker 
              placeholder="Search player..." 
              value={playerB?.name || ""}
              onSelect={setPlayerB}
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
          disabled={isLoading || !playerA || !playerB || !connected}
          data-testid="button-compare-players"
        >
          <i className="fas fa-search mr-2"></i>
          {isLoading ? "Comparing..." : !connected ? "Connect to Analyze" : "Compare Players"}
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

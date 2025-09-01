import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import ConnectionCallout from "@/components/ConnectionCallout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSession } from "@/services/api";
import { getOptimalLineup } from "@/services/yahoo";
import type { RosteredPlayer } from "@shared/types";

export default function StartSit() {
  // Get session data (league and team keys)
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: 1,
  });

  // Get optimal lineup when we have league and team keys
  const { data: optimalLineup, isLoading: lineupLoading, error: lineupError } = useQuery({
    queryKey: ["optimal-lineup", session?.league_key, session?.team_key],
    queryFn: () => {
      if (!session?.league_key || !session?.team_key) {
        throw new Error("League and team keys required");
      }
      return getOptimalLineup(session.league_key, session.team_key);
    },
    enabled: !!session?.league_key && !!session?.team_key && session.connected,
    retry: 1,
  });

  const isLoading = sessionLoading || lineupLoading;

  return (
    <div>
      <PageHeader 
        title="Start/Sit Optimizer" 
        subtitle="Get AI-powered lineup recommendations for your Yahoo Fantasy team" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textDim">Loading your team data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {lineupError && (
        <Alert className="mb-6">
          <AlertDescription>
            Failed to load lineup data. Please check your Yahoo connection and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Not Connected State */}
      {!sessionLoading && !session?.connected && (
        <Alert className="mb-6">
          <AlertDescription>
            Please connect your Yahoo Fantasy account to use the Start/Sit Optimizer.
          </AlertDescription>
        </Alert>
      )}

      {/* No League Selected */}
      {session?.connected && !session?.league_key && (
        <Alert className="mb-6">
          <AlertDescription>
            Please select a league from your Yahoo Fantasy account to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Optimal Lineup Results */}
      {optimalLineup && (
        <div className="space-y-6">
          {/* Start Recommendations */}
          {optimalLineup.recommendations.start.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-600">🚀 Start These Players</span>
                  <Badge variant="secondary">{optimalLineup.recommendations.start.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimalLineup.recommendations.start.map((player: RosteredPlayer, index: number) => (
                    <div key={player.player_key} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div className="font-medium text-green-800">{player.name}</div>
                        <div className="text-sm text-green-600">
                          {player.editorial_team_abbr} • {player.eligible_positions.join(', ')}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {optimalLineup.recommendations.reasons[index]?.split(' at ')[1]?.split(' instead')[0] || 'START'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sit Recommendations */}
          {optimalLineup.recommendations.sit.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-red-600">⏸️ Sit These Players</span>
                  <Badge variant="secondary">{optimalLineup.recommendations.sit.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimalLineup.recommendations.sit.map((player: RosteredPlayer, index: number) => (
                    <div key={player.player_key} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <div className="font-medium text-red-800">{player.name}</div>
                        <div className="text-sm text-red-600">
                          {player.editorial_team_abbr} • {player.eligible_positions.join(', ')}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-red-700 border-red-300">
                        BENCH
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimal Lineup Display */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Optimal Lineup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(optimalLineup.starters).map(([position, players]) => (
                  <div key={position} className="space-y-2">
                    <h4 className="font-medium text-text capitalize">{position}</h4>
                    {(players as RosteredPlayer[]).map((player: RosteredPlayer) => (
                      <div key={player.player_key} className="flex items-center justify-between p-2 bg-surface border border-border rounded">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-textDim">
                            {player.editorial_team_abbr}
                            {player.status && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {player.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bench Players */}
          {optimalLineup.bench.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🪑 Bench Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimalLineup.bench.map((player: RosteredPlayer) => (
                    <div key={player.player_key} className="flex items-center justify-between p-2 bg-muted border border-border rounded">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-textDim">
                          {player.editorial_team_abbr} • {player.eligible_positions.join(', ')}
                          {player.status && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {player.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

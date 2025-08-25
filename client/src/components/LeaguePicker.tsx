import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { listYahooLeagues } from "@/services/auth";
import { useLeague } from "@/context/LeagueContext";

interface League {
  leagueKey: string;
  leagueName: string;
  season: string;
  teamKey?: string;
  teamName?: string;
}

interface LeaguePickerProps {
  onLeagueSelected: () => void;
}

export default function LeaguePicker({ onLeagueSelected }: LeaguePickerProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const { setLinkedLeague } = useLeague();

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const data = await listYahooLeagues();
      setLeagues(data);
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLeague = (league: League) => {
    setLinkedLeague({
      leagueKey: league.leagueKey,
      leagueName: league.leagueName,
      teamKey: league.teamKey,
      teamName: league.teamName
    });
    onLeagueSelected();
  };

  if (loading) {
    return (
      <div className="text-center py-8" data-testid="loading-leagues">
        <i className="fas fa-spinner fa-spin text-2xl text-slate-400 mb-2"></i>
        <p className="text-slate-600">Loading your leagues...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Select Your League</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((league) => (
          <div 
            key={league.leagueKey} 
            className="bg-surface border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            data-testid={`league-card-${league.leagueKey}`}
          >
            <div className="mb-4">
              <h4 className="font-semibold text-slate-800 text-lg mb-2">{league.leagueName}</h4>
              <p className="text-sm text-slate-600 mb-1">Season: {league.season}</p>
              {league.teamName && (
                <p className="text-sm text-slate-600">Team: {league.teamName}</p>
              )}
            </div>
            <Button
              onClick={() => handleSelectLeague(league)}
              className="w-full btn-primary"
              data-testid={`select-league-${league.leagueKey}`}
            >
              Select League
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
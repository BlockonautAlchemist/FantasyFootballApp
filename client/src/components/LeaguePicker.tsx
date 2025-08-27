import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { listYahooLeagues, linkYahooLeague } from "@/services/auth";
import { useLeague } from "@/context/LeagueContext";

interface League {
  id: string;
  leagueKey: string;
  leagueName: string;
  season: string;
  teamKey?: string;
  teamName?: string;
  isLinked: boolean;
}

interface LeaguePickerProps {
  onLeagueSelected: () => void;
}

export default function LeaguePicker({ onLeagueSelected }: LeaguePickerProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
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

  const handleSelectLeague = async (league: League) => {
    setLinking(league.id);
    try {
      const linkedLeague = await linkYahooLeague(league.id);
      setLinkedLeague(linkedLeague);
      onLeagueSelected();
    } catch (error) {
      console.error('Failed to link league:', error);
    } finally {
      setLinking(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8" data-testid="loading-leagues">
        <i className="fas fa-spinner fa-spin text-2xl text-textDim mb-2"></i>
        <p className="text-textDim">Loading your leagues...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-text mb-4">Select Your League</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((league) => (
          <div 
            key={league.leagueKey} 
            className="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            data-testid={`league-card-${league.leagueKey}`}
          >
            <div className="mb-4">
              <h4 className="font-semibold text-text text-lg mb-2">{league.leagueName}</h4>
              <p className="text-sm text-textDim mb-1">Season: {league.season}</p>
              {league.teamName && (
                <p className="text-sm text-textDim">Team: {league.teamName}</p>
              )}
            </div>
            <Button
              onClick={() => handleSelectLeague(league)}
              disabled={linking === league.id}
              className="w-full btn-primary"
              data-testid={`select-league-${league.leagueKey}`}
            >
              {linking === league.id ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Linking...
                </>
              ) : league.isLinked ? (
                'Currently Selected'
              ) : (
                'Select League'
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { useLeague } from "@/context/LeagueContext";

type League = {
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  url?: string;
  scoring_type?: string;
  num_teams?: number;
};

interface LeaguePickerProps {
  onLeagueSelected?: () => void;
}

export default function LeaguePicker({ onLeagueSelected }: LeaguePickerProps) {
  const [, setLocation] = useLocation();
  const [leagues, setLeagues] = useState<League[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { setLinkedLeague, refreshData } = useLeague();

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const res = await fetch('/api/yahoo/leagues', { cache: 'no-store' });
      const ct = res.headers.get('content-type') || '';
      let payload: any = ct.includes('application/json') ? await res.json() : { error: 'non_json', snippet: await res.text() };

      if (!res.ok) {
        throw new Error(payload?.error || `fetch_failed_${res.status}`);
      }
      setLeagues(payload.leagues ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'failed_fetch');
    } finally {
      setLoading(false);
    }
  };

  const onContinue = async () => {
    if (!selected) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/league', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ league_key: selected }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error ?? 'save_failed');
      }

      // Find the selected league to update context
      const selectedLeague = leagues?.find(l => l.league_key === selected);
      if (selectedLeague) {
        setLinkedLeague({
          leagueKey: selectedLeague.league_key,
          leagueName: selectedLeague.name,
          season: selectedLeague.season,
        });
      }

      // Refresh data from backend
      await refreshData();
      
      if (onLeagueSelected) {
        onLeagueSelected();
      } else {
        // Default behavior - redirect to dashboard
        setLocation('/');
      }
    } catch (e: any) {
      setError(e?.message ?? 'save_failed');
    } finally {
      setSaving(false);
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

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">
          <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Error: {error}</p>
        </div>
        <Button onClick={loadLeagues} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-info-circle text-2xl text-textDim mb-2"></i>
        <p className="text-textDim">No leagues found for NFL.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-text">Select your league</div>
      <div className="space-y-2">
        {leagues.map((l) => (
          <label 
            key={l.league_key} 
            className="flex items-center gap-3 p-3 rounded-xl border border-neutral-700 hover:bg-neutral-900 cursor-pointer transition-colors"
          >
            <input
              type="radio"
              name="league"
              value={l.league_key}
              checked={selected === l.league_key}
              onChange={() => setSelected(l.league_key)}
              className="text-primary"
            />
            <div className="flex flex-col flex-1">
              <span className="font-medium text-text">{l.name}</span>
              <span className="text-xs opacity-70 text-textDim">
                {l.season} • {l.scoring_type ?? 'scoring'} • {l.num_teams ?? '?'} teams
              </span>
            </div>
          </label>
        ))}
      </div>
      <Button
        onClick={onContinue}
        disabled={!selected || saving}
        className="w-full px-4 py-2 rounded-xl bg-yellow-400/90 disabled:opacity-50 text-black font-semibold"
      >
        {saving ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Saving...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
}
import { PlayerSummary } from "@/services/types";

interface PlayerCardProps {
  player: PlayerSummary;
  variant?: "default" | "compact";
  showTeam?: boolean;
}

export default function PlayerCard({ player, variant = "default", showTeam = true }: PlayerCardProps) {
  const initials = player.name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  if (variant === "compact") {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
          {initials}
        </div>
        <div>
          <h4 className="font-medium text-slate-800">{player.name}</h4>
          {showTeam && (
            <p className="text-sm text-slate-600">{player.team} {player.pos}</p>
          )}
          {player.status && (
            <p className="text-xs text-warning">{player.status}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
          {initials}
        </div>
        <div>
          <h4 className="font-medium text-slate-800">{player.name}</h4>
          {showTeam && (
            <p className="text-sm text-slate-600">{player.team} {player.pos}</p>
          )}
        </div>
      </div>
      {player.status && (
        <div className="text-xs">
          <span className={player.status === "Healthy" ? "text-secondary" : "text-warning"}>
            {player.status}
          </span>
        </div>
      )}
      {player.bye && (
        <div className="text-xs text-slate-500 mt-1">
          Bye: Week {player.bye}
        </div>
      )}
    </div>
  );
}

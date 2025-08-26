import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLeague } from "@/context/LeagueContext";

export default function UserBadge() {
  const { connected, user, linkedLeague, disconnect } = useLeague();

  if (!connected || !user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="chip chip-gray text-sm" data-testid="status-not-linked">
          Not Linked
        </span>
        <Link href="/connect">
          <Button variant="outline" size="sm" data-testid="button-connect">
            Connect
          </Button>
        </Link>
      </div>
    );
  }

  const userInitials = user.displayName
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center space-x-3">
      {linkedLeague ? (
        <span className="chip chip-success text-sm" data-testid="status-linked">
          Linked: {linkedLeague.leagueName}
        </span>
      ) : (
        <span className="chip chip-warning text-sm" data-testid="status-connected">
          Connected
        </span>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
          {userInitials}
        </div>
        <div className="hidden md:block text-sm text-text">
          {user.displayName}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {linkedLeague && (
          <Link href="/connect">
            <Button variant="outline" size="sm" data-testid="button-change-league">
              Change
            </Button>
          </Link>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnect}
          data-testid="button-disconnect"
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
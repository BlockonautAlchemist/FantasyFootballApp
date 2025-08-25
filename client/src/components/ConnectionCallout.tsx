import { Link } from "wouter";
import Callout from "@/components/Callout";
import { Button } from "@/components/ui/button";
import { useLeague } from "@/context/LeagueContext";

export default function ConnectionCallout() {
  const { connected, linkedLeague } = useLeague();

  if (!connected || !linkedLeague) {
    return (
      <Callout variant="info" icon="fas fa-info-circle" title="Connect Your Yahoo Account">
        <p className="mb-3">
          This page is showing demo data. Connect your Yahoo Fantasy account to see your real league information.
        </p>
        <Link href="/connect">
          <Button className="btn-primary" data-testid="callout-connect-button">
            Connect Yahoo Account
          </Button>
        </Link>
      </Callout>
    );
  }

  return (
    <Callout variant="warning" icon="fas fa-flask" title="Demo Mode Active">
      <p>
        Demo mode: data is mocked. Real data will load after you connect the backend.
        Currently connected to <strong>{linkedLeague.leagueName}</strong>.
      </p>
    </Callout>
  );
}
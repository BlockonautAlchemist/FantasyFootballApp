import { Link } from "wouter";
import { Info, Beaker, CheckCircle2 } from "lucide-react";
import Callout from "@/components/Callout";
import { Button } from "@/components/ui/button";
import { useLeague } from "@/context/LeagueContext";

export default function ConnectionCallout() {
  const { connected, linkedLeague } = useLeague();

  if (!connected || !linkedLeague) {
    return (
      <Callout 
        variant="info" 
        icon={<Info className="w-5 h-5" />} 
        title="Connect Your Yahoo Account"
      >
        <p className="mb-4 text-lg leading-relaxed">
          This page is showing demo data. Connect your Yahoo Fantasy account to see your real league information and unlock the full power of your fantasy arsenal.
        </p>
        <Link href="/connect">
          <Button className="btn-primary text-lg px-8 py-3" data-testid="callout-connect-button">
            Connect Yahoo Account
          </Button>
        </Link>
      </Callout>
    );
  }

  return (
    <Callout 
      variant="warning" 
      icon={<Beaker className="w-5 h-5" />} 
      title="Demo Mode Active"
    >
      <p className="text-lg leading-relaxed">
        Demo mode: data is mocked. Real data will load after you connect the backend.
        Currently connected to <strong className="text-white">{linkedLeague.leagueName}</strong>.
      </p>
    </Callout>
  );
}
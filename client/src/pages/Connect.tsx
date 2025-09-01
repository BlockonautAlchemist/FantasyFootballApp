import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import PageHeader from "@/components/PageHeader";
import YahooConnectionStatus from "@/components/YahooConnectionStatus";
import LeaguePicker from "@/components/LeaguePicker";
import Callout from "@/components/Callout";
import { Button } from "@/components/ui/button";
import { useLeague } from "@/context/LeagueContext";

export default function Connect() {
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { connected, linkedLeague, loading } = useLeague();
  const [location] = useLocation();

  useEffect(() => {
    console.log('Connect page - connected:', connected, 'linkedLeague:', linkedLeague, 'loading:', loading);
    
    // Check for OAuth success parameter
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus === 'success' && connected && !linkedLeague) {
      // OAuth successful but no league selected yet - show league picker
      setShowLeaguePicker(true);
    }
  }, [connected, linkedLeague, loading]);

  const handleConnected = () => {
    setShowLeaguePicker(true);
  };

  const handleLeagueSelected = () => {
    setShowSuccess(true);
    setShowLeaguePicker(false);
  };

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="pt-24 px-4">
          <PageHeader 
            title="Yahoo Connection" 
            subtitle="Manage your Yahoo Fantasy account connection" 
          />
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-textDim mb-2"></i>
            <p className="text-textDim">Checking connection status...</p>
          </div>
        </div>
      </div>
    );
  }

  // If already connected and has league, show success immediately
  if (connected && linkedLeague && !showLeaguePicker) {
    return (
      <div>
        <PageHeader 
          title="Yahoo Connection" 
          subtitle="Manage your Yahoo Fantasy account connection" 
        />

        <Callout variant="success" icon="fas fa-check-circle" title="Successfully Connected">
          <p className="mb-4">
            You're connected to <strong>{linkedLeague.leagueName}</strong> as <strong>{linkedLeague.teamName}</strong>.
          </p>
          <div className="flex gap-3">
            <Link href="/">
              <Button className="btn-primary" data-testid="button-go-dashboard">
                Go to Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setShowLeaguePicker(true)}
              data-testid="button-change-league"
            >
              Change League
            </Button>
          </div>
        </Callout>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-24 px-4">
        <PageHeader 
          title="Yahoo Connection" 
          subtitle="Manage your Yahoo Fantasy account connection" 
        />

      {!showLeaguePicker && !connected && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center mb-8">
          <YahooConnectionStatus onConnected={handleConnected} />
        </div>
      )}

      {(connected && showLeaguePicker) || (connected && !linkedLeague) ? (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <LeaguePicker onLeagueSelected={handleLeagueSelected} />
        </div>
      ) : null}

      {showSuccess && (
        <Callout variant="success" icon="fas fa-check-circle" title="League Selected Successfully">
          <p className="mb-4">
            You've successfully connected to <strong>{linkedLeague?.leagueName}</strong>. 
            You can now access all fantasy tools with your real league data.
          </p>
          <Link href="/">
            <Button className="btn-primary" data-testid="button-go-dashboard-success">
              Go to Dashboard
            </Button>
          </Link>
        </Callout>
      )}





      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="text-center p-6">
          <i className="fas fa-shield-alt text-3xl text-primary mb-3"></i>
          <h4 className="font-semibold text-text mb-2">Secure Connection</h4>
          <p className="text-sm text-textDim">
            Your Yahoo credentials are never stored. We use secure OAuth for authentication.
          </p>
        </div>
        <div className="text-center p-6">
          <i className="fas fa-sync text-3xl text-primary mb-3"></i>
          <h4 className="font-semibold text-text mb-2">Real-Time Data</h4>
          <p className="text-sm text-textDim">
            Get live updates from your Yahoo league including rosters, scores, and transactions.
          </p>
        </div>
        <div className="text-center p-6">
          <i className="fas fa-users text-3xl text-primary mb-3"></i>
          <h4 className="font-semibold text-text mb-2">Multiple Leagues</h4>
          <p className="text-sm text-textDim">
            Manage multiple fantasy leagues from a single dashboard. Switch between leagues easily.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
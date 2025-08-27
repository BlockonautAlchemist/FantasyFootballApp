import { useState, useEffect } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/PageHeader";
import ConnectYahooButton from "@/components/ConnectYahooButton";
import LeaguePicker from "@/components/LeaguePicker";
import Callout from "@/components/Callout";
import { Button } from "@/components/ui/button";
import { useLeague } from "@/context/LeagueContext";
import { checkYahooConfig } from "@/services/auth";

export default function Connect() {
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [configStatus, setConfigStatus] = useState<{ configured: boolean; clientId?: string } | null>(null);
  const { connected, linkedLeague, loading } = useLeague();

  useEffect(() => {
    console.log('Connect page - connected:', connected, 'linkedLeague:', linkedLeague, 'loading:', loading);
    checkConfiguration();
  }, [connected, linkedLeague, loading]);

  const checkConfiguration = async () => {
    const status = await checkYahooConfig();
    console.log('Config status:', status);
    setConfigStatus(status);
  };

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
            title="Connect Your Yahoo Account" 
            subtitle="Link your Yahoo Fantasy account to access your leagues and rosters" 
          />
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-textDim mb-2"></i>
            <p className="text-textDim">Loading...</p>
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
          title="Connect Your Yahoo Account" 
          subtitle="Link your Yahoo Fantasy account to access your leagues and rosters" 
        />

      {!connected && !showLeaguePicker && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center mb-8">
          <div className="mb-6">
            <i className="fab fa-yahoo text-6xl text-purple-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect with Yahoo Fantasy
            </h3>
            <p className="text-gray-300">
              Authorize access to import your fantasy leagues and manage your teams
            </p>
            
            {/* Configuration Status */}
            {configStatus !== null && (
              <div className="mt-4 p-3 rounded-lg border">
                {configStatus.configured ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <i className="fas fa-check-circle"></i>
                    <span className="text-sm">Yahoo OAuth configured ({configStatus.clientId})</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span className="text-sm">Yahoo OAuth not configured</span>
                  </div>
                )}
              </div>
            )}
            
            {configStatus === null && (
              <div className="mt-4 p-3 rounded-lg border border-gray-300">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span className="text-sm">Checking configuration...</span>
                </div>
              </div>
            )}
          </div>
          <ConnectYahooButton onConnected={handleConnected} />
        </div>
      )}

      {connected && showLeaguePicker && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <LeaguePicker onLeagueSelected={handleLeagueSelected} />
        </div>
      )}

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

      {/* Setup Guide */}
      {!connected && configStatus !== null && !configStatus.configured && (
        <div className="bg-surface border border-border rounded-2xl p-6 mt-8">
          <h3 className="text-xl font-semibold text-text mb-4">
            <i className="fas fa-cog mr-2"></i>
            Yahoo OAuth Setup Required
          </h3>
          <p className="text-textDim mb-4">
            To connect with Yahoo Fantasy Sports, you'll need to configure Yahoo OAuth credentials in your environment. 
            Follow these steps:
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <div>
                <p className="text-text font-medium">Create a Yahoo Developer App</p>
                <p className="text-textDim">Visit <a href="https://developer.yahoo.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">developer.yahoo.com</a> and create a new app with Fantasy Sports API access</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <div>
                <p className="text-text font-medium">Configure Environment Variables</p>
                <p className="text-textDim">Copy .env.example to .env and add your Yahoo Client ID and Secret</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <div>
                <p className="text-text font-medium">Restart the Server</p>
                <p className="text-textDim">Restart your development server to load the new environment variables</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <i className="fas fa-info-circle mr-2"></i>
              See <strong>YAHOO_OAUTH_SETUP.md</strong> for detailed setup instructions
            </p>
          </div>
        </div>
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
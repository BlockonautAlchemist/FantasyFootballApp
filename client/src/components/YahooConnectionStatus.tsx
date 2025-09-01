import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth";
import { useLeague } from "@/context/LeagueContext";

interface YahooConnectionStatusProps {
  onConnected?: () => void;
}

export default function YahooConnectionStatus({ onConnected }: YahooConnectionStatusProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { connected, user, disconnect } = useLeague();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Call authorize endpoint with explicit scopes
      const response = await fetch('/api/auth/yahoo/authorize?scope=fspt-r%20fspt-w', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to get authorization URL: ${response.status}`);
      }

      const { authorizeUrl } = await response.json();
      
      if (!authorizeUrl) {
        throw new Error('No authorization URL received');
      }
      
      // Redirect to Yahoo OAuth
      window.location.href = authorizeUrl;
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Unable to connect to Yahoo at this time. Please try again later or contact support if the issue persists.');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    
    try {
      await disconnect();
      // State will be updated by the context
    } catch (error) {
      console.error('Disconnect failed:', error);
      alert('Unable to disconnect from Yahoo. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (connected && user) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <i className="fab fa-yahoo text-4xl text-purple-600"></i>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white">
                Connected to Yahoo Fantasy
              </h3>
              <p className="text-sm text-gray-300">
                Logged in as <strong>{user.displayName}</strong>
              </p>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3"
          data-testid="disconnect-yahoo-button"
        >
          {isDisconnecting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Disconnecting...
            </>
          ) : (
            <>
              <i className="fas fa-sign-out-alt mr-2"></i>
              Disconnect Yahoo
            </>
          )}
        </Button>
        
        <p className="text-sm text-textDim mt-3">
          Disconnect your Yahoo Fantasy account to stop syncing data
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <i className="fab fa-yahoo text-6xl text-purple-600 mb-4"></i>
        <h3 className="text-xl font-semibold text-white mb-2">
          Connect with Yahoo Fantasy
        </h3>
        <p className="text-gray-300">
          Authorize access to import your fantasy leagues and manage your teams
        </p>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
        data-testid="connect-yahoo-button"
      >
        {isConnecting ? (
          <>
            <i className="fas fa-spinner fa-spin mr-3"></i>
            Redirecting to Yahoo...
          </>
        ) : (
          <>
            <i className="fab fa-yahoo mr-3"></i>
            Connect with Yahoo
          </>
        )}
      </Button>
      
      <p className="text-sm text-textDim mt-3">
        Connect your Yahoo Fantasy account to import your leagues and rosters
      </p>
    </div>
  );
}

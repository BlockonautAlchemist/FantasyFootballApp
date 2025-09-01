import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { completeYahooConnect, checkOAuthReturn, clearOAuthReturn, isConnecting as getIsConnecting } from "@/services/auth";
import { useLeague } from "@/context/LeagueContext";

interface ConnectYahooButtonProps {
  onConnected: () => void;
}

export default function ConnectYahooButton({ onConnected }: ConnectYahooButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setConnected, setUser } = useLeague();

  useEffect(() => {
    // Check if we're returning from OAuth
    const { success, error } = checkOAuthReturn();
    
    if (success) {
      // OAuth success - complete the connection
      handleOAuthSuccess();
      clearOAuthReturn();
    } else if (error) {
      // OAuth error
      setIsConnecting(false);
      console.error('OAuth authentication failed');
      clearOAuthReturn();
    }

    // Check if we're in the middle of connecting
    if (getIsConnecting()) {
      setIsConnecting(true);
    }
  }, []);

  const handleOAuthSuccess = async () => {
    setIsConnecting(true);
    
    try {
      const user = await completeYahooConnect();
      setConnected(true);
      setUser(user);
      onConnected();
    } catch (error) {
      console.error('Connection completion failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simple, reliable: let the server set cookies & redirect
    const YAHOO_SCOPE = 'openid profile email fspt-w';
    window.location.href = `/api/auth/yahoo/start?scope=${encodeURIComponent(YAHOO_SCOPE)}`;
  };

  return (
    <div className="text-center">
      <Button
        type="button"
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
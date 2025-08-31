import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { startYahooConnect, completeYahooConnect, checkOAuthReturn, clearOAuthReturn, isConnecting as getIsConnecting } from "@/services/auth";
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

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      await startYahooConnect();
      // The user will be redirected to Yahoo OAuth, so this component will unmount
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Unable to connect to Yahoo at this time. Please try again later or contact support if the issue persists.');
      setIsConnecting(false);
    }
  };

  return (
    <div className="text-center">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
        data-testid="connect-yahoo-button"
      >
        {isConnecting ? (
          <>
            <i className="fas fa-spinner fa-spin mr-3"></i>
            Connecting to Yahoo...
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
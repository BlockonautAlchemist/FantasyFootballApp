import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completeYahooConnect } from "@/services/auth";
import { useLeague } from "@/context/LeagueContext";

interface ConnectYahooButtonProps {
  onConnected: () => void;
}

export default function ConnectYahooButton({ onConnected }: ConnectYahooButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setConnected, setUser } = useLeague();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = await completeYahooConnect();
      setConnected(true);
      setUser(user);
      onConnected();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
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
      <p className="text-sm text-slate-600 mt-3">
        Connect your Yahoo Fantasy account to import your leagues and rosters
      </p>
    </div>
  );
}
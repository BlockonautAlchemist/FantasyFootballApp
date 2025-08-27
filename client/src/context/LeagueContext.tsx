import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, getLinkedLeague, logout } from "@/services/auth";

interface User {
  id: string;
  displayName: string;
  yahooUserId?: string;
}

interface LinkedLeague {
  id?: string;
  leagueKey: string;
  leagueName: string;
  season?: string;
  teamKey?: string;
  teamName?: string;
  teamLogo?: string;
  isLinked?: boolean;
}

interface LeagueContextType {
  connected: boolean;
  user: User | null;
  linkedLeague: LinkedLeague | null;
  loading: boolean;
  setConnected: (connected: boolean) => void;
  setUser: (user: User | null) => void;
  setLinkedLeague: (league: LinkedLeague | null) => void;
  disconnect: () => void;
  refreshData: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const STORAGE_KEYS = {
  connected: 'fantasy-assistant-connected',
  user: 'fantasy-assistant-user',
  linkedLeague: 'fantasy-assistant-league'
};

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [connected, setConnectedState] = useState<boolean>(false);
  const [user, setUserState] = useState<User | null>(null);
  const [linkedLeague, setLinkedLeagueState] = useState<LinkedLeague | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    setLoading(true);
    try {
      // Check if user is already authenticated via session
      const sessionUser = await getCurrentUser();
      
      if (sessionUser) {
        setConnectedState(true);
        setUserState(sessionUser);
        
        // Get linked league from backend
        const backendLinkedLeague = await getLinkedLeague();
        if (backendLinkedLeague) {
          setLinkedLeagueState(backendLinkedLeague);
        } else {
          // Fallback to localStorage for backward compatibility
          const savedLeague = localStorage.getItem(STORAGE_KEYS.linkedLeague);
          if (savedLeague) {
            setLinkedLeagueState(JSON.parse(savedLeague));
          }
        }
      } else {
        // No session, check localStorage for fallback
        const savedConnected = localStorage.getItem(STORAGE_KEYS.connected);
        const savedUser = localStorage.getItem(STORAGE_KEYS.user);
        const savedLeague = localStorage.getItem(STORAGE_KEYS.linkedLeague);

        if (savedConnected && savedUser) {
          setConnectedState(JSON.parse(savedConnected));
          setUserState(JSON.parse(savedUser));
        }
        if (savedLeague) {
          setLinkedLeagueState(JSON.parse(savedLeague));
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      // Clear any stale localStorage data
      localStorage.removeItem(STORAGE_KEYS.connected);
      localStorage.removeItem(STORAGE_KEYS.user);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const sessionUser = await getCurrentUser();
      if (sessionUser) {
        setUserState(sessionUser);
        
        const backendLinkedLeague = await getLinkedLeague();
        setLinkedLeagueState(backendLinkedLeague);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const setConnected = (connected: boolean) => {
    setConnectedState(connected);
    localStorage.setItem(STORAGE_KEYS.connected, JSON.stringify(connected));
  };

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  };

  const setLinkedLeague = (league: LinkedLeague | null) => {
    setLinkedLeagueState(league);
    if (league) {
      localStorage.setItem(STORAGE_KEYS.linkedLeague, JSON.stringify(league));
    } else {
      localStorage.removeItem(STORAGE_KEYS.linkedLeague);
    }
  };

  const disconnect = async () => {
    try {
      // Call backend logout
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear frontend state
    setConnectedState(false);
    setUserState(null);
    setLinkedLeagueState(null);
    localStorage.removeItem(STORAGE_KEYS.connected);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.linkedLeague);
  };

  return (
    <LeagueContext.Provider value={{
      connected,
      user,
      linkedLeague,
      loading,
      setConnected,
      setUser,
      setLinkedLeague,
      disconnect,
      refreshData
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
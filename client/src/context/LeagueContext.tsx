import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  displayName: string;
}

interface LinkedLeague {
  leagueKey: string;
  leagueName: string;
  teamKey?: string;
  teamName?: string;
}

interface LeagueContextType {
  connected: boolean;
  user: User | null;
  linkedLeague: LinkedLeague | null;
  setConnected: (connected: boolean) => void;
  setUser: (user: User | null) => void;
  setLinkedLeague: (league: LinkedLeague | null) => void;
  disconnect: () => void;
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

  // Load from localStorage on mount
  useEffect(() => {
    const savedConnected = localStorage.getItem(STORAGE_KEYS.connected);
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);
    const savedLeague = localStorage.getItem(STORAGE_KEYS.linkedLeague);

    if (savedConnected) {
      setConnectedState(JSON.parse(savedConnected));
    }
    if (savedUser) {
      setUserState(JSON.parse(savedUser));
    }
    if (savedLeague) {
      setLinkedLeagueState(JSON.parse(savedLeague));
    }
  }, []);

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

  const disconnect = () => {
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
      setConnected,
      setUser,
      setLinkedLeague,
      disconnect
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
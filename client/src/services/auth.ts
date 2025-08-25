// LocalStorage-only stubs for Yahoo auth flow
// In production, replace these with real Yahoo OAuth calls

export interface League {
  leagueKey: string;
  leagueName: string;
  season: string;
  teamKey?: string;
  teamName?: string;
  teamLogo?: string;
}

export interface User {
  id: string;
  displayName: string;
}

export async function startYahooConnect(): Promise<void> {
  // In real implementation, this would redirect to Yahoo OAuth
  // For now, just set a connecting flag
  localStorage.setItem('fantasy-assistant-connecting', 'true');
  return Promise.resolve();
}

export async function completeYahooConnect(): Promise<User> {
  // Simulate successful OAuth return
  const mockUser: User = {
    id: "demo-user-123",
    displayName: "Blockonaut"
  };
  
  localStorage.removeItem('fantasy-assistant-connecting');
  return Promise.resolve(mockUser);
}

export async function listYahooLeagues(): Promise<League[]> {
  // Import and return mock leagues
  const mockData = await import("../mocks/mockLeagues.json");
  return Promise.resolve(mockData.default);
}

export async function setLinkedLeague(league: {
  leagueKey: string;
  leagueName: string;
  teamKey?: string;
  teamName?: string;
}): Promise<void> {
  // In real implementation, this would save the selection to the backend
  // For now, this is handled by the LeagueContext
  return Promise.resolve();
}

export function isConnecting(): boolean {
  return localStorage.getItem('fantasy-assistant-connecting') === 'true';
}
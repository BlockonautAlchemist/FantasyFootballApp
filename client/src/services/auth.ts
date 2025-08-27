// Yahoo OAuth and League Management

export interface League {
  id: string;
  leagueKey: string;
  leagueName: string;
  season: string;
  teamKey?: string;
  teamName?: string;
  teamLogo?: string;
  isLinked: boolean;
}

export interface User {
  id: string;
  displayName: string;
  yahooUserId?: string;
}

/**
 * Start Yahoo OAuth flow by redirecting to authorization URL
 */
export async function startYahooConnect(): Promise<void> {
  try {
    const response = await fetch('/api/auth/yahoo/start', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to start Yahoo authentication');
    }

    const { authUrl } = await response.json();
    
    // Store connecting state
    localStorage.setItem('fantasy-assistant-connecting', 'true');
    
    // Redirect to Yahoo OAuth
    window.location.href = authUrl;
  } catch (error) {
    localStorage.removeItem('fantasy-assistant-connecting');
    console.error('Error starting Yahoo OAuth:', error);
    throw error;
  }
}

/**
 * Check OAuth completion and get user data
 */
export async function completeYahooConnect(): Promise<User> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Authentication failed or user not found');
    }

    const user = await response.json();
    localStorage.removeItem('fantasy-assistant-connecting');
    
    return user;
  } catch (error) {
    localStorage.removeItem('fantasy-assistant-connecting');
    console.error('Error completing Yahoo OAuth:', error);
    throw error;
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 401) {
      return null; // Not authenticated
    }

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Logout user and clear session
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
  
  // Clear local storage
  localStorage.removeItem('fantasy-assistant-connecting');
  localStorage.removeItem('fantasy-assistant-connected');
  localStorage.removeItem('fantasy-assistant-user');
  localStorage.removeItem('fantasy-assistant-league');
}

/**
 * Get user's Yahoo leagues
 */
export async function listYahooLeagues(): Promise<League[]> {
  try {
    const response = await fetch('/api/yahoo/leagues', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get Yahoo leagues');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Yahoo leagues:', error);
    throw error;
  }
}

/**
 * Link a specific Yahoo league
 */
export async function linkYahooLeague(leagueId: string): Promise<League> {
  try {
    const response = await fetch(`/api/yahoo/leagues/${leagueId}/link`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to link Yahoo league');
    }

    return await response.json();
  } catch (error) {
    console.error('Error linking Yahoo league:', error);
    throw error;
  }
}

/**
 * Get currently linked league
 */
export async function getLinkedLeague(): Promise<League | null> {
  try {
    const response = await fetch('/api/yahoo/leagues/linked', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get linked league');
    }

    const league = await response.json();
    return league || null;
  } catch (error) {
    console.error('Error getting linked league:', error);
    return null;
  }
}

/**
 * Legacy function for compatibility - now sets linked league on backend
 */
export async function setLinkedLeague(league: {
  id?: string;
  leagueKey: string;
  leagueName: string;
  teamKey?: string;
  teamName?: string;
}): Promise<void> {
  if (!league.id) {
    throw new Error('League ID is required to link league');
  }
  
  await linkYahooLeague(league.id);
}

/**
 * Check if OAuth flow is in progress
 */
export function isConnecting(): boolean {
  return localStorage.getItem('fantasy-assistant-connecting') === 'true';
}

/**
 * Check Yahoo OAuth configuration status
 */
export async function checkYahooConfig(): Promise<{ configured: boolean; clientId?: string }> {
  try {
    const response = await fetch('/api/auth/yahoo/config', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { configured: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking Yahoo config:', error);
    return { configured: false };
  }
}

/**
 * Check for OAuth return parameters in URL
 */
export function checkOAuthReturn(): { success: boolean; error: boolean } {
  const urlParams = new URLSearchParams(window.location.search);
  const authStatus = urlParams.get('auth');
  
  return {
    success: authStatus === 'success',
    error: authStatus === 'error'
  };
}

/**
 * Clear OAuth return parameters from URL
 */
export function clearOAuthReturn(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('auth');
  window.history.replaceState({}, document.title, url.toString());
}
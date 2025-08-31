import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle different HTTP methods and routes
  if (req.method === 'GET' && req.url === '/api/yahoo/leagues') {
    return handleGetLeagues(req, res);
  } else if (req.method === 'GET' && req.url === '/api/yahoo/leagues/linked') {
    return handleGetLinkedLeague(req, res);
  } else if (req.method === 'POST' && req.url?.includes('/api/yahoo/leagues/') && req.url?.includes('/link')) {
    return handleLinkLeague(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetLeagues(req: VercelRequest, res: VercelResponse) {
  // Read access token from cookie
  const accessToken = req.cookies.yahoo_access;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'no_access_token',
      error_description: 'No access token found in cookies. Please authenticate first.'
    });
  }

  try {
    // Make request to Yahoo Fantasy API to get user's leagues
    const response = await fetch('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'FantasyFootballApp/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({
          error: 'invalid_token',
          error_description: 'Access token is invalid or expired. Please re-authenticate.'
        });
      }
      
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'yahoo_api_error',
        error_description: errorText
      });
    }

    const data = await response.json();
    
    // Transform Yahoo API response to our League format
    const leagues = [];
    if (data.fantasy_content?.users?.[0]?.user?.[1]?.games) {
      const games = data.fantasy_content.users[0].user[1].games;
      for (const gameKey in games) {
        if (gameKey === 'count') continue;
        const game = games[gameKey];
        if (game.game[1].leagues) {
          for (const leagueKey in game.game[1].leagues) {
            if (leagueKey === 'count') continue;
            const league = game.game[1].leagues[leagueKey].league[0];
            const leagueData = game.game[1].leagues[leagueKey].league[1];
            
            leagues.push({
              id: league.league_id,
              leagueKey: league.league_key,
              leagueName: league.name,
              season: league.season,
              teamKey: leagueData.teams ? Object.keys(leagueData.teams).find(key => key !== 'count') : undefined,
              teamName: leagueData.teams ? Object.values(leagueData.teams).find((team: any) => team?.team?.[0]?.name)?.team?.[0]?.name : undefined,
              teamLogo: leagueData.teams ? Object.values(leagueData.teams).find((team: any) => team?.team?.[0]?.logo)?.team?.[0]?.logo : undefined,
              isLinked: false
            });
          }
        }
      }
    }
    
    return res.status(200).json(leagues);

  } catch (error) {
    console.error('Yahoo API error:', error);
    return res.status(500).json({
      error: 'internal_error',
      error_description: 'Failed to connect to Yahoo API'
    });
  }
}

async function handleGetLinkedLeague(req: VercelRequest, res: VercelResponse) {
  // For now, return null as we don't have persistent storage
  // In a real implementation, this would check a database for the linked league
  return res.status(200).json(null);
}

async function handleLinkLeague(req: VercelRequest, res: VercelResponse) {
  // Extract league ID from URL
  const urlParts = req.url?.split('/');
  const leagueId = urlParts?.[urlParts.length - 2]; // Get the ID before 'link'
  
  if (!leagueId) {
    return res.status(400).json({ error: 'League ID is required' });
  }

  // Read access token from cookie
  const accessToken = req.cookies.yahoo_access;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'no_access_token',
      error_description: 'No access token found in cookies. Please authenticate first.'
    });
  }

  try {
    // For now, just return a mock linked league
    // In a real implementation, this would store the linked league in a database
    const linkedLeague = {
      id: leagueId,
      leagueKey: `nfl.l.${leagueId}`,
      leagueName: `League ${leagueId}`,
      season: '2024',
      teamKey: `nfl.l.${leagueId}.t.1`,
      teamName: 'My Team',
      teamLogo: undefined,
      isLinked: true
    };
    
    return res.status(200).json(linkedLeague);

  } catch (error) {
    console.error('Error linking league:', error);
    return res.status(500).json({
      error: 'internal_error',
      error_description: 'Failed to link league'
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
              teamName: leagueData.teams ? Object.values(leagueData.teams).find((team: any) => team.team[0].name)?.team[0].name : undefined,
              teamLogo: leagueData.teams ? Object.values(leagueData.teams).find((team: any) => team.team[0].logo)?.team[0].logo : undefined,
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

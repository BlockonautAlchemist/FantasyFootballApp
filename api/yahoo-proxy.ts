import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildOptimalLineup, generateStartSitRecommendations } from '../shared/scoring';
import type { LeagueSlots, RosteredPlayer, OptimalLineup } from '../shared/types';
import { makeYahooRequest } from '../shared/oauth';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

// Parse Yahoo's nested roster structure
function parseRosterFromYahooJson(json: any): RosteredPlayer[] {
  const players: RosteredPlayer[] = [];
  
  const fantasyContent = json?.fantasy_content;
  if (!fantasyContent) return players;

  // Navigate through the nested structure
  const team = fantasyContent.team?.[0]?.team || fantasyContent.team?.[1]?.team;
  if (!team) return players;

  const roster = team.find((item: any) => item?.roster)?.roster;
  if (!roster) return players;

  const count = Number(roster.count || 0);
  for (let i = 0; i < count; i++) {
    const playerNode = roster[i]?.players?.[0]?.player;
    if (!playerNode) continue;

    // Extract player data from the nested structure
    const playerData = Object.assign({}, ...playerNode.filter((x: any) => x && typeof x === 'object'));
    
    if (playerData.player_key && playerData.name) {
      players.push({
        player_key: playerData.player_key,
        name: playerData.name.full || playerData.name,
        status: playerData.status,
        editorial_team_abbr: playerData.editorial_team_abbr,
        eligible_positions: playerData.eligible_positions || [],
        selected_position: playerData.selected_position?.position || 'BN'
      });
    }
  }

  return players;
}

// Parse Yahoo's league settings structure
function parseLeagueSettingsFromYahooJson(json: any): LeagueSlots {
  const slots: LeagueSlots = {};
  
  const fantasyContent = json?.fantasy_content;
  if (!fantasyContent) return slots;

  const league = fantasyContent.league?.[0]?.league || fantasyContent.league?.[1]?.league;
  if (!league) return slots;

  const settings = league.find((item: any) => item?.settings)?.settings;
  if (!settings) return slots;

  const rosterPositions = settings.find((item: any) => item?.roster_positions)?.roster_positions;
  if (!rosterPositions) return slots;

  const count = Number(rosterPositions.count || 0);
  for (let i = 0; i < count; i++) {
    const positionNode = rosterPositions[i]?.roster_position;
    if (!positionNode) continue;

    const positionData = Object.assign({}, ...positionNode.filter((x: any) => x && typeof x === 'object'));
    if (positionData.position && positionData.count) {
      slots[positionData.position] = Number(positionData.count);
    }
  }

  return slots;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  
  const action = String(req.query.action || '');
  
  if (!action) return res.status(400).json({ error: 'missing_action' });

  // Get OAuth tokens from cookies
  const oauth_token = getCookie(req, 'yahoo_access_token');
  const oauth_token_secret = getCookie(req, 'yahoo_access_token_secret');

  if (!oauth_token || !oauth_token_secret) {
    return res.status(401).json({ 
      error: 'not_authenticated',
      message: 'No Yahoo OAuth tokens found. Please connect your Yahoo account first.'
    });
  }

  // Get OAuth credentials
  const consumer_key = process.env.YAHOO_CLIENT_ID;
  const consumer_secret = process.env.YAHOO_CLIENT_SECRET;

  if (!consumer_key || !consumer_secret) {
    return res.status(500).json({ 
      error: 'oauth_not_configured',
      message: 'Yahoo OAuth credentials not configured'
    });
  }

  try {
    
    switch (action) {
      case 'leagues':
        const leaguesUrl = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json';
        const leaguesData = await makeYahooRequest(
          leaguesUrl,
          consumer_key,
          consumer_secret,
          oauth_token,
          oauth_token_secret
        );
        return res.json(leaguesData);
        
      case 'league-settings':
        const league_key = String(req.query.league_key || '');
        if (!league_key) return res.status(400).json({ error: 'missing_league_key' });
        
        const settingsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${league_key}/settings?format=json`;
        const settingsData = await makeYahooRequest(
          settingsUrl,
          consumer_key,
          consumer_secret,
          oauth_token,
          oauth_token_secret
        );
        return res.json(settingsData);
        
      case 'team-roster':
        const team_key = String(req.query.team_key || '');
        if (!team_key) return res.status(400).json({ error: 'missing_team_key' });
        
        const date = req.query.date ? `;date=${req.query.date}` : '';
        const rosterUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${team_key}/roster${date}?format=json`;
        const rosterData = await makeYahooRequest(
          rosterUrl,
          consumer_key,
          consumer_secret,
          oauth_token,
          oauth_token_secret
        );
        return res.json(rosterData);
        
      case 'optimal-lineup':
        const lineup_league_key = String(req.query.league_key || '');
        const lineup_team_key = String(req.query.team_key || '');
        if (!lineup_league_key || !lineup_team_key) {
          return res.status(400).json({ error: 'missing_league_key_or_team_key' });
        }
        
        // Fetch league settings and team roster in parallel
        const [settingsResponse, rosterResponse] = await Promise.all([
          makeYahooRequest(
            `https://fantasysports.yahooapis.com/fantasy/v2/league/${lineup_league_key}/settings?format=json`,
            consumer_key,
            consumer_secret,
            oauth_token,
            oauth_token_secret
          ),
          makeYahooRequest(
            `https://fantasysports.yahooapis.com/fantasy/v2/team/${lineup_team_key}/roster?format=json`,
            consumer_key,
            consumer_secret,
            oauth_token,
            oauth_token_secret
          )
        ]);

        const slots = parseLeagueSettingsFromYahooJson(settingsResponse);
        const roster = parseRosterFromYahooJson(rosterResponse);

        if (Object.keys(slots).length === 0 || roster.length === 0) {
          return res.status(500).json({ error: 'parse_error', detail: 'Failed to parse Yahoo data' });
        }

        // Build optimal lineup
        const optimalLineup = buildOptimalLineup(slots, roster);
        
        // Generate start/sit recommendations
        const recommendations = generateStartSitRecommendations(optimalLineup, roster);

        const result: OptimalLineup = {
          starters: optimalLineup.starters,
          bench: optimalLineup.bench,
          recommendations
        };

        return res.json(result);
        
      default:
        return res.status(400).json({ 
          error: 'invalid_action', 
          valid_actions: ['leagues', 'league-settings', 'team-roster', 'optimal-lineup'] 
        });
    }
  } catch (error) {
    console.error('Yahoo proxy error:', error);
    return res.status(500).json({ 
      error: 'internal_error', 
      detail: String(error),
      message: 'Yahoo API request failed'
    });
  }
}

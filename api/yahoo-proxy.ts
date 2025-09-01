import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildOptimalLineup, generateStartSitRecommendations } from '../shared/scoring';
import type { LeagueSlots, RosteredPlayer, OptimalLineup } from '../shared/types';

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
  
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || getCookie(req, 'yahoo_access');
  const action = String(req.query.action || '');
  
  if (!token) return res.status(401).json({ error: 'missing_token' });
  if (!action) return res.status(400).json({ error: 'missing_action' });

  try {
    let yahooUrl: string;
    let params: Record<string, string> = {};

    // Map actions to Yahoo API endpoints
    switch (action) {
      case 'leagues':
        yahooUrl = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json';
        break;
        
      case 'league-settings':
        const league_key = String(req.query.league_key || '');
        if (!league_key) return res.status(400).json({ error: 'missing_league_key' });
        yahooUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${league_key}/settings?format=json`;
        break;
        
      case 'team-roster':
        const team_key = String(req.query.team_key || '');
        if (!team_key) return res.status(400).json({ error: 'missing_team_key' });
        const date = req.query.date ? `;date=${req.query.date}` : '';
        yahooUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${team_key}/roster${date}?format=json`;
        break;
        
      case 'optimal-lineup':
        const lineup_league_key = String(req.query.league_key || '');
        const lineup_team_key = String(req.query.team_key || '');
        if (!lineup_league_key || !lineup_team_key) {
          return res.status(400).json({ error: 'missing_league_key_or_team_key' });
        }
        
        // Fetch league settings and team roster in parallel
        const [settingsResponse, rosterResponse] = await Promise.all([
          fetch(`https://fantasysports.yahooapis.com/fantasy/v2/league/${lineup_league_key}/settings?format=json`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`https://fantasysports.yahooapis.com/fantasy/v2/team/${lineup_team_key}/roster?format=json`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Check for errors
        if (!settingsResponse.ok || !rosterResponse.ok) {
          const error = !settingsResponse.ok ? 'settings' : 'roster';
          return res.status(500).json({ error: `yahoo_${error}_error` });
        }

        // Parse responses
        const settingsJson = await settingsResponse.json();
        const rosterJson = await rosterResponse.json();

        const slots = parseLeagueSettingsFromYahooJson(settingsJson);
        const roster = parseRosterFromYahooJson(rosterJson);

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
        return res.status(400).json({ error: 'invalid_action', valid_actions: ['leagues', 'league-settings', 'team-roster', 'optimal-lineup'] });
    }

    // Make request to Yahoo API
    const response = await fetch(yahooUrl, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    
    if (!response.ok || !contentType.includes('application/json')) {
      console.error('Yahoo API error:', response.status, text.slice(0, 200));
      return res.status(response.status).json({ error: 'yahoo_error', snippet: text.slice(0,200) });
    }
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('Yahoo proxy error:', error);
    return res.status(500).json({ error: 'internal_error', detail: String(error) });
  }
}

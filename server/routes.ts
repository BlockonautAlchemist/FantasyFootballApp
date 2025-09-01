import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { yahooApi } from "./yahoo-api.js";
import yahooAuthRouter from "./authYahoo.js";
import session from "express-session";
import fetch from "node-fetch";
import "./types.js"; // Import session type declarations

/**
 * Make a request to Yahoo Fantasy Sports API using OAuth 2.0 Bearer token
 */
async function makeYahooApiRequest(path: string, accessToken: string): Promise<any> {
  const url = `https://fantasysports.yahooapis.com/fantasy/v2/${path}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'User-Agent': 'FantasyFootballApp/1.0'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401 - Token expired or invalid');
    }
    throw new Error(`Yahoo API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Parse Yahoo's nested JSON structure to extract leagues
 */
function parseLeaguesFromYahooJson(json: any): Array<{
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  url?: string;
  scoring_type?: string;
  num_teams?: number;
}> {
  const out: Array<{
    league_key: string;
    league_id: string;
    name: string;
    season: string;
    url?: string;
    scoring_type?: string;
    num_teams?: number;
  }> = [];
  
  const users = json?.fantasy_content?.users;
  if (!users) return out;

  // users["0"].user[1].games is commonly where the games live
  const userObj = users?.[0]?.user ?? users?.['0']?.user ?? null;
  if (!userObj) return out;

  // find games node
  const gamesNode = userObj.find((n: any) => n?.games) ?? userObj?.[1]?.games;
  const games = gamesNode?.[0] ?? gamesNode; // tolerate structures

  if (!games) return out;

  // traverse games -> leagues
  const gameCount = Number(games?.count ?? Object.keys(games).length ?? 0);
  for (let gi = 0; gi < gameCount; gi++) {
    const game = games?.[gi]?.game;
    if (!game) continue;

    const leaguesNode = game.find((n: any) => n?.leagues)?.leagues;
    if (!leaguesNode) continue;

    const leagueCount = Number(leaguesNode?.count ?? Object.keys(leaguesNode).length ?? 0);
    for (let li = 0; li < leagueCount; li++) {
      const league = leaguesNode?.[li]?.league;
      if (!league) continue;

      // league is an array; its [0] often has key props
      const meta = Object.assign({}, ...league.filter((x: any) => typeof x === 'object'));
      const league_key = meta?.league_key ?? meta?.['league_key'];
      const league_id = meta?.league_id ?? '';
      const name = meta?.name ?? '';
      const season = meta?.season ?? meta?.season_value ?? '';
      const url = meta?.url;
      const scoring_type = meta?.scoring_type;
      const num_teams = Number(meta?.num_teams ?? 0);

      if (league_key && name) {
        out.push({ league_key, league_id, name, season: String(season), url, scoring_type, num_teams });
      }
    }
  }
  return out;
}

export async function registerRoutes(app: Express): Promise<Server | void> {
  // Session middleware for OAuth state management
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Yahoo OAuth 2.0 Routes
  app.use('/api/auth/yahoo', yahooAuthRouter);

  // Check Yahoo OAuth configuration
  app.get('/api/auth/yahoo/config', (req, res) => {
    const isConfigured = !!(
      process.env.YAHOO_CLIENT_ID &&
      process.env.YAHOO_CLIENT_SECRET &&
      process.env.YAHOO_REDIRECT_URI
    );

    // Debug logging
    console.log('Environment check:', {
      hasClientId: !!process.env.YAHOO_CLIENT_ID,
      hasClientSecret: !!process.env.YAHOO_CLIENT_SECRET,
      hasRedirectUri: !!process.env.YAHOO_REDIRECT_URI,
      clientIdPreview: process.env.YAHOO_CLIENT_ID ? `${process.env.YAHOO_CLIENT_ID.substring(0, 8)}...` : 'null',
      redirectUri: process.env.YAHOO_REDIRECT_URI
    });

    res.json({
      configured: isConfigured,
      clientId: process.env.YAHOO_CLIENT_ID ? `${process.env.YAHOO_CLIENT_ID.substring(0, 8)}...` : null,
      hasClientSecret: !!process.env.YAHOO_CLIENT_SECRET,
      redirectUri: process.env.YAHOO_REDIRECT_URI
    });
  });

  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    try {
      console.log('GET /api/auth/me - Session:', req.session);
      const userId = req.session.userId;
      if (!userId) {
        console.log('No userId in session');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      console.log('Getting user with ID:', userId);
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('User not found for ID:', userId);
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('User found:', { id: user.id, displayName: user.displayName });
      // Return user data without sensitive information
      res.json({
        id: user.id,
        displayName: user.displayName,
        yahooUserId: user.yahooUserId,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user', details: (error as Error).message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  // Yahoo League Routes
  
  // Get user's Yahoo leagues
  app.get('/api/yahoo/leagues', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const token = await storage.getYahooToken(userId);
      if (!token) {
        return res.status(401).json({ error: 'Yahoo token not found' });
      }

      // Get leagues from Yahoo API using OAuth 2.0
      const yahooLeagues = await makeYahooApiRequest(
        'users;use_login=1/games;game_keys=nfl/leagues?format=json',
        token.accessToken
      );
      
      // Parse the leagues using the safe parser
      const leagues = parseLeaguesFromYahooJson(yahooLeagues);

      res.json(leagues);
    } catch (error) {
      console.error('Get Yahoo leagues error:', error);
      if (error instanceof Error && error.message?.includes('401')) {
        return res.status(401).json({ error: 'Yahoo token expired' });
      }
      res.status(500).json({ error: 'Failed to get Yahoo leagues' });
    }
  });

  // Link a Yahoo league
  app.post('/api/yahoo/leagues/:leagueId/link', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { leagueId } = req.params;
      const success = await storage.linkYahooLeague(userId, leagueId);
      
      if (!success) {
        return res.status(400).json({ error: 'Failed to link league' });
      }

      const linkedLeague = await storage.getYahooLeague(leagueId);
      res.json({
        id: linkedLeague?.id,
        leagueKey: linkedLeague?.leagueKey,
        leagueName: linkedLeague?.leagueName,
        season: linkedLeague?.season,
        teamKey: linkedLeague?.teamKey,
        teamName: linkedLeague?.teamName,
        teamLogo: linkedLeague?.teamLogo,
        isLinked: true,
      });
    } catch (error) {
      console.error('Link Yahoo league error:', error);
      res.status(500).json({ error: 'Failed to link league' });
    }
  });

  // Get linked league
  app.get('/api/yahoo/leagues/linked', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const linkedLeague = await storage.getLinkedYahooLeague(userId);
      
      if (!linkedLeague) {
        return res.json(null);
      }

      res.json({
        id: linkedLeague.id,
        leagueKey: linkedLeague.leagueKey,
        leagueName: linkedLeague.leagueName,
        season: linkedLeague.season,
        teamKey: linkedLeague.teamKey,
        teamName: linkedLeague.teamName,
        teamLogo: linkedLeague.teamLogo,
        isLinked: true,
      });
    } catch (error) {
      console.error('Get linked league error:', error);
      res.status(500).json({ error: 'Failed to get linked league' });
    }
  });

  // Yahoo API proxy for client-side requests
  app.get('/api/yahoo/proxy', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { path } = req.query;
      if (!path || typeof path !== 'string') {
        return res.status(400).json({ error: 'Path parameter required' });
      }

      const token = await storage.getYahooToken(userId);
      if (!token) {
        return res.status(401).json({ error: 'Yahoo token not found' });
      }

      // Make request to Yahoo API using OAuth 2.0 Bearer token
      const yahooResponse = await makeYahooApiRequest(path, token.accessToken);
      res.json(yahooResponse);
    } catch (error) {
      console.error('Yahoo API proxy error:', error);
      if (error instanceof Error && error.message?.includes('401')) {
        return res.status(401).json({ error: 'Yahoo token expired' });
      }
      res.status(500).json({ error: 'Failed to fetch from Yahoo API' });
    }
  });

  // Set selected league (new endpoint for league selector)
  app.post('/api/league', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { league_key } = req.body;
      if (!league_key || typeof league_key !== 'string') {
        return res.status(400).json({ error: 'invalid_league_key' });
      }

      // Find the league by league_key
      const userLeagues = await storage.getUserYahooLeagues(userId);
      const league = userLeagues.find(l => l.leagueKey === league_key);
      
      if (!league) {
        return res.status(404).json({ error: 'League not found' });
      }

      // Link the league
      const success = await storage.linkYahooLeague(userId, league.id);
      if (!success) {
        return res.status(400).json({ error: 'Failed to link league' });
      }

      // Set HTTP-only cookie for additional persistence
      res.cookie('yahoo_league_key', league_key, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      });

      res.json({ ok: true });
    } catch (error) {
      console.error('Set league error:', error);
      res.status(500).json({ error: 'Failed to set league' });
    }
  });

  // Only create HTTP server in development
  if (process.env.NODE_ENV !== 'production') {
    const httpServer = createServer(app);
    return httpServer;
  }
  
  // In production (Vercel), just return void
  return;
}

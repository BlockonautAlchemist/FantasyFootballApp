import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { yahooApi } from "./yahoo-api.js";
import yahooAuthRouter from "./authYahoo.js";
import session from "express-session";
import "./types.js"; // Import session type declarations

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
      clientIdPreview: process.env.YAHOO_CLIENT_ID ? `${process.env.YAHOO_CLIENT_ID.substring(0, 8)}...` : 'null'
    });

    res.json({
      configured: isConfigured,
      clientId: process.env.YAHOO_CLIENT_ID ? `${process.env.YAHOO_CLIENT_ID.substring(0, 8)}...` : null
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

      // Get leagues from Yahoo API
      const yahooLeagues = await yahooApi.getUserLeagues(token, 'nfl'); // Focus on NFL for now
      
      // Transform and store leagues
      const leagues = [];
      const fantasyContent = yahooLeagues.fantasy_content;
      
      if (fantasyContent?.users?.[0]?.user?.[0]?.games?.[0]?.game?.[0]?.leagues) {
        const yahooLeagueData = fantasyContent.users[0].user[0].games[0].game[0].leagues[0].league;
        
        for (const leagueData of yahooLeagueData) {
          const leagueKey = leagueData.league_key[0];
          const leagueName = leagueData.name[0];
          const season = leagueData.season[0];
          
          // Get team information
          let teamKey = '';
          let teamName = '';
          
          if (leagueData.teams?.[0]?.team?.[0]) {
            teamKey = leagueData.teams[0].team[0].team_key[0];
            teamName = leagueData.teams[0].team[0].name[0];
          }

          // Create or update league in storage
          const existingLeagues = await storage.getUserYahooLeagues(userId);
          const existingLeague = existingLeagues.find(l => l.leagueKey === leagueKey);
          
          let savedLeague;
          if (existingLeague) {
            savedLeague = await storage.updateYahooLeague(existingLeague.id, {
              leagueName,
              season,
              teamKey,
              teamName,
              leagueData: leagueData,
            });
          } else {
            savedLeague = await storage.createYahooLeague({
              userId,
              leagueKey,
              leagueName,
              season,
              teamKey,
              teamName,
              teamLogo: null,
              isLinked: 'false',
              gameCode: 'nfl',
              leagueData: leagueData,
            });
          }

          if (savedLeague) {
            leagues.push({
              id: savedLeague.id,
              leagueKey: savedLeague.leagueKey,
              leagueName: savedLeague.leagueName,
              season: savedLeague.season,
              teamKey: savedLeague.teamKey,
              teamName: savedLeague.teamName,
              teamLogo: savedLeague.teamLogo,
              isLinked: savedLeague.isLinked === 'true',
            });
          }
        }
      }

      res.json(leagues);
    } catch (error) {
      console.error('Get Yahoo leagues error:', error);
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

  // Only create HTTP server in development
  if (process.env.NODE_ENV !== 'production') {
    const httpServer = createServer(app);
    return httpServer;
  }
  
  // In production (Vercel), just return void
  return;
}

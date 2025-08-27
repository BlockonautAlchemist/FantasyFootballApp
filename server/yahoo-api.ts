import { OAuth } from 'oauth';
import fetch from 'node-fetch';
import { storage } from './storage';
import type { YahooToken, User } from '../shared/schema';

const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';
const YAHOO_LOGIN_BASE = 'https://api.login.yahoo.com/oauth/v2';

export class YahooAPIClient {
  private oauth: OAuth;

  constructor() {
    this.oauth = new OAuth(
      `${YAHOO_LOGIN_BASE}/get_request_token`,
      `${YAHOO_LOGIN_BASE}/get_token`,
      process.env.YAHOO_CLIENT_ID!,
      process.env.YAHOO_CLIENT_SECRET!,
      '1.0A',
      process.env.YAHOO_REDIRECT_URI!,
      'HMAC-SHA1'
    );
  }

  /**
   * Step 1: Get request token and authorization URL
   */
  async getAuthUrl(): Promise<{ authUrl: string; requestToken: string; requestSecret: string }> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthRequestToken((error, requestToken, requestSecret) => {
        if (error) {
          reject(new Error(`Error getting request token: ${(error as any).data || (error as any).message || error}`));
          return;
        }

        const authUrl = `https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=${requestToken}`;
        resolve({ authUrl, requestToken, requestSecret });
      });
    });
  }

  /**
   * Step 2: Exchange authorization code for access token
   */
  async getAccessToken(
    requestToken: string,
    requestSecret: string,
    verifier: string
  ): Promise<{ accessToken: string; accessSecret: string; sessionHandle: string }> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(
        requestToken,
        requestSecret,
        verifier,
        (error, accessToken, accessSecret, results) => {
          if (error) {
            reject(new Error(`Error getting access token: ${(error as any).data || (error as any).message || error}`));
            return;
          }

          const sessionHandle = results?.oauth_session_handle || '';
          resolve({ accessToken, accessSecret, sessionHandle });
        }
      );
    });
  }

  /**
   * Refresh an expired access token using session handle
   */
  async refreshToken(token: YahooToken): Promise<{ accessToken: string; accessSecret: string }> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(
        token.accessToken,
        token.tokenSecret,
        token.sessionHandle,
        (error, accessToken, accessSecret) => {
          if (error) {
            reject(new Error(`Error refreshing token: ${(error as any).data || (error as any).message || error}`));
            return;
          }

          resolve({ accessToken, accessSecret });
        }
      );
    });
  }

  /**
   * Make authenticated API request to Yahoo Fantasy Sports
   */
  async makeRequest(url: string, token: YahooToken, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const fullUrl = url.startsWith('http') ? url : `${YAHOO_API_BASE}${url}`;
      
      if (method === 'GET') {
        this.oauth.get(fullUrl, token.accessToken, token.tokenSecret, (error, data) => {
          if (error) {
            // Try refreshing token if 401
            if (error.statusCode === 401) {
              this.handleTokenRefresh(token, url, method, data)
                .then(resolve)
                .catch(reject);
              return;
            }
            reject(new Error(`API request failed: ${(error as any).data || (error as any).message || error}`));
            return;
          }

          try {
            const result = typeof data === 'string' ? JSON.parse(data) : data;
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse API response: ${parseError}`));
          }
        });
      } else {
        // POST request
        const postBody = data ? JSON.stringify(data) : '';
        this.oauth.post(
          fullUrl,
          token.accessToken,
          token.tokenSecret,
          postBody,
          'application/json',
          (error, data) => {
            if (error) {
              if (error.statusCode === 401) {
                this.handleTokenRefresh(token, url, method, data)
                  .then(resolve)
                  .catch(reject);
                return;
              }
              reject(new Error(`API request failed: ${(error as any).data || (error as any).message || error}`));
              return;
            }

            try {
              const result = typeof data === 'string' ? JSON.parse(data) : data;
              resolve(result);
            } catch (parseError) {
              reject(new Error(`Failed to parse API response: ${parseError}`));
            }
          }
        );
      }
    });
  }

  /**
   * Handle token refresh and retry request
   */
  private async handleTokenRefresh(token: YahooToken, url: string, method: 'GET' | 'POST', data?: any): Promise<any> {
    try {
      const { accessToken, accessSecret } = await this.refreshToken(token);
      
      // Update token in database
      await storage.updateYahooToken(token.userId, {
        accessToken,
        tokenSecret: accessSecret,
        updatedAt: new Date(),
      });

      // Retry the original request with new token
      const updatedToken = { ...token, accessToken, tokenSecret: accessSecret };
      return this.makeRequest(url, updatedToken, method, data);
    } catch (refreshError) {
      throw new Error(`Token refresh failed: ${refreshError}`);
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(token: YahooToken): Promise<any> {
    const url = '/users;use_login=1';
    return this.makeRequest(url, token);
  }

  /**
   * Get user's fantasy games
   */
  async getUserGames(token: YahooToken): Promise<any> {
    const url = '/users;use_login=1/games';
    return this.makeRequest(url, token);
  }

  /**
   * Get user's leagues for a specific game
   */
  async getUserLeagues(token: YahooToken, gameKey?: string): Promise<any> {
    let url = '/users;use_login=1/games';
    if (gameKey) {
      url += `;game_keys=${gameKey}`;
    }
    url += '/leagues';
    return this.makeRequest(url, token);
  }

  /**
   * Get league information
   */
  async getLeague(token: YahooToken, leagueKey: string): Promise<any> {
    const url = `/league/${leagueKey}`;
    return this.makeRequest(url, token);
  }

  /**
   * Get teams in a league
   */
  async getLeagueTeams(token: YahooToken, leagueKey: string): Promise<any> {
    const url = `/league/${leagueKey}/teams`;
    return this.makeRequest(url, token);
  }

  /**
   * Get user's team in a league
   */
  async getUserTeam(token: YahooToken, teamKey: string): Promise<any> {
    const url = `/team/${teamKey}`;
    return this.makeRequest(url, token);
  }

  /**
   * Get team roster
   */
  async getTeamRoster(token: YahooToken, teamKey: string, week?: number): Promise<any> {
    let url = `/team/${teamKey}/roster`;
    if (week) {
      url += `;week=${week}`;
    }
    return this.makeRequest(url, token);
  }

  /**
   * Get league free agents
   */
  async getLeagueFreeAgents(token: YahooToken, leagueKey: string, position?: string, count?: number): Promise<any> {
    let url = `/league/${leagueKey}/players;status=A`; // A = Available
    if (position) {
      url += `;position=${position}`;
    }
    if (count) {
      url += `;count=${count}`;
    }
    return this.makeRequest(url, token);
  }

  /**
   * Get league transactions
   */
  async getLeagueTransactions(token: YahooToken, leagueKey: string, count?: number): Promise<any> {
    let url = `/league/${leagueKey}/transactions`;
    if (count) {
      url += `;count=${count}`;
    }
    return this.makeRequest(url, token);
  }

  /**
   * Add/Drop players (waiver claim)
   */
  async addDropPlayers(
    token: YahooToken,
    leagueKey: string,
    transactions: Array<{
      type: 'add' | 'drop' | 'add/drop';
      playerKey?: string;
      destinationTeamKey?: string;
      sourceTeamKey?: string;
      faabBid?: number;
    }>
  ): Promise<any> {
    const url = `/league/${leagueKey}/transactions`;
    
    // Build XML payload for transactions
    const transactionXml = this.buildTransactionXml(transactions);
    
    return this.makeRequest(url, token, 'POST', transactionXml);
  }

  /**
   * Build XML payload for transactions
   */
  private buildTransactionXml(transactions: Array<any>): string {
    // This is a simplified version - in production you'd want a proper XML builder
    let xml = '<?xml version="1.0"?><fantasy_content>';
    
    for (const transaction of transactions) {
      xml += '<transaction>';
      xml += `<type>${transaction.type}</type>`;
      
      if (transaction.faabBid) {
        xml += `<faab_bid>${transaction.faabBid}</faab_bid>`;
      }
      
      if (transaction.type === 'add/drop') {
        xml += '<players>';
        // Add player
        xml += '<player>';
        xml += `<player_key>${transaction.addPlayerKey}</player_key>`;
        xml += '<transaction_data>';
        xml += '<type>add</type>';
        xml += `<destination_team_key>${transaction.destinationTeamKey}</destination_team_key>`;
        xml += '</transaction_data>';
        xml += '</player>';
        // Drop player
        xml += '<player>';
        xml += `<player_key>${transaction.dropPlayerKey}</player_key>`;
        xml += '<transaction_data>';
        xml += '<type>drop</type>';
        xml += `<source_team_key>${transaction.sourceTeamKey}</source_team_key>`;
        xml += '</transaction_data>';
        xml += '</player>';
        xml += '</players>';
      } else {
        xml += '<player>';
        xml += `<player_key>${transaction.playerKey}</player_key>`;
        xml += '<transaction_data>';
        xml += `<type>${transaction.type}</type>`;
        if (transaction.destinationTeamKey) {
          xml += `<destination_team_key>${transaction.destinationTeamKey}</destination_team_key>`;
        }
        if (transaction.sourceTeamKey) {
          xml += `<source_team_key>${transaction.sourceTeamKey}</source_team_key>`;
        }
        xml += '</transaction_data>';
        xml += '</player>';
      }
      
      xml += '</transaction>';
    }
    
    xml += '</fantasy_content>';
    return xml;
  }
}

export const yahooApi = new YahooAPIClient();

import { 
  type User, 
  type InsertUser, 
  type YahooToken, 
  type InsertYahooToken,
  type YahooLeague,
  type InsertYahooLeague
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByYahooId(yahooUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Yahoo Token methods
  getYahooToken(userId: string): Promise<YahooToken | undefined>;
  createYahooToken(token: InsertYahooToken): Promise<YahooToken>;
  updateYahooToken(userId: string, updates: Partial<YahooToken>): Promise<YahooToken | undefined>;
  deleteYahooToken(userId: string): Promise<boolean>;
  
  // Yahoo League methods
  getUserYahooLeagues(userId: string): Promise<YahooLeague[]>;
  getYahooLeague(id: string): Promise<YahooLeague | undefined>;
  getLinkedYahooLeague(userId: string): Promise<YahooLeague | undefined>;
  createYahooLeague(league: InsertYahooLeague): Promise<YahooLeague>;
  updateYahooLeague(id: string, updates: Partial<YahooLeague>): Promise<YahooLeague | undefined>;
  linkYahooLeague(userId: string, leagueId: string): Promise<boolean>;
  unlinkYahooLeagues(userId: string): Promise<boolean>;
  deleteYahooLeague(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private yahooTokens: Map<string, YahooToken>;
  private yahooLeagues: Map<string, YahooLeague>;

  constructor() {
    this.users = new Map();
    this.yahooTokens = new Map();
    this.yahooLeagues = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByYahooId(yahooUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.yahooUserId === yahooUserId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      yahooUserId: null,
      displayName: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Yahoo Token methods
  async getYahooToken(userId: string): Promise<YahooToken | undefined> {
    return Array.from(this.yahooTokens.values()).find(
      (token) => token.userId === userId,
    );
  }

  async createYahooToken(insertToken: InsertYahooToken): Promise<YahooToken> {
    const id = randomUUID();
    const now = new Date();
    const token: YahooToken = { 
      ...insertToken, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.yahooTokens.set(id, token);
    return token;
  }

  async updateYahooToken(userId: string, updates: Partial<YahooToken>): Promise<YahooToken | undefined> {
    const token = await this.getYahooToken(userId);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates, updatedAt: new Date() };
    this.yahooTokens.set(token.id, updatedToken);
    return updatedToken;
  }

  async deleteYahooToken(userId: string): Promise<boolean> {
    const token = await this.getYahooToken(userId);
    if (!token) return false;
    
    return this.yahooTokens.delete(token.id);
  }

  // Yahoo League methods
  async getUserYahooLeagues(userId: string): Promise<YahooLeague[]> {
    return Array.from(this.yahooLeagues.values()).filter(
      (league) => league.userId === userId,
    );
  }

  async getYahooLeague(id: string): Promise<YahooLeague | undefined> {
    return this.yahooLeagues.get(id);
  }

  async getLinkedYahooLeague(userId: string): Promise<YahooLeague | undefined> {
    return Array.from(this.yahooLeagues.values()).find(
      (league) => league.userId === userId && league.isLinked === 'true',
    );
  }

  async createYahooLeague(insertLeague: InsertYahooLeague): Promise<YahooLeague> {
    const id = randomUUID();
    const now = new Date();
    const league: YahooLeague = { 
      ...insertLeague, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.yahooLeagues.set(id, league);
    return league;
  }

  async updateYahooLeague(id: string, updates: Partial<YahooLeague>): Promise<YahooLeague | undefined> {
    const league = this.yahooLeagues.get(id);
    if (!league) return undefined;
    
    const updatedLeague = { ...league, ...updates, updatedAt: new Date() };
    this.yahooLeagues.set(id, updatedLeague);
    return updatedLeague;
  }

  async linkYahooLeague(userId: string, leagueId: string): Promise<boolean> {
    // First unlink all other leagues for this user
    await this.unlinkYahooLeagues(userId);
    
    // Then link the specified league
    const league = this.yahooLeagues.get(leagueId);
    if (!league || league.userId !== userId) return false;
    
    const updatedLeague = { ...league, isLinked: 'true', updatedAt: new Date() };
    this.yahooLeagues.set(leagueId, updatedLeague);
    return true;
  }

  async unlinkYahooLeagues(userId: string): Promise<boolean> {
    const userLeagues = await this.getUserYahooLeagues(userId);
    
    for (const league of userLeagues) {
      if (league.isLinked === 'true') {
        const updatedLeague = { ...league, isLinked: 'false', updatedAt: new Date() };
        this.yahooLeagues.set(league.id, updatedLeague);
      }
    }
    
    return true;
  }

  async deleteYahooLeague(id: string): Promise<boolean> {
    return this.yahooLeagues.delete(id);
  }
}

export const storage = new MemStorage();

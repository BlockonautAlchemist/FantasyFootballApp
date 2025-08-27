import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  yahooUserId: text("yahoo_user_id").unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const yahooTokens = pgTable("yahoo_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenSecret: text("token_secret").notNull(),
  sessionHandle: text("session_handle").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const yahooLeagues = pgTable("yahoo_leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  leagueKey: text("league_key").notNull(),
  leagueName: text("league_name").notNull(),
  season: text("season").notNull(),
  teamKey: text("team_key"),
  teamName: text("team_name"),
  teamLogo: text("team_logo"),
  isLinked: text("is_linked").default("false"),
  gameCode: text("game_code").notNull(), // e.g., "nfl", "mlb", etc.
  leagueData: json("league_data"), // Store additional league metadata
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertYahooTokenSchema = createInsertSchema(yahooTokens);
export const insertYahooLeagueSchema = createInsertSchema(yahooLeagues);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type YahooToken = typeof yahooTokens.$inferSelect;
export type YahooLeague = typeof yahooLeagues.$inferSelect;
export type InsertYahooToken = z.infer<typeof insertYahooTokenSchema>;
export type InsertYahooLeague = z.infer<typeof insertYahooLeagueSchema>;

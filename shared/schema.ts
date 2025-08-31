import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const icoStages = pgTable("ico_stages", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  tokenPrice: decimal("token_price", { precision: 10, scale: 6 }).notNull(),
  totalTokens: integer("total_tokens").notNull(),
  soldTokens: integer("sold_tokens").default(0).notNull(),
  minPurchase: integer("min_purchase").notNull(),
  maxPurchase: integer("max_purchase").notNull(),
  status: text("status").notNull().default('upcoming'), // upcoming, active, completed
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  tokenBalance: integer("token_balance").default(0).notNull(),
  totalInvested: decimal("total_invested", { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  stageId: varchar("stage_id").references(() => icoStages.id).notNull(),
  amountUSD: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
  tokens: integer("tokens").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default('pending'), // pending, completed, failed
  paymentMethod: text("payment_method"), // crypto, card, etc
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default('default'),
  isIcoActive: boolean("is_ico_active").default(true).notNull(),
  currentStageId: varchar("current_stage_id").references(() => icoStages.id).notNull(),
  features: jsonb("features").notNull().$type<{
    wallet: boolean;
    purchase: boolean;
    dashboard: boolean;
    tokenomics: boolean;
    pioneers: boolean;
    history: boolean;
  }>(),
  apiKeys: jsonb("api_keys").notNull().$type<{
    rewonApiKey?: string;
    nowpaymentsApiKey?: string;
    nowpaymentsPublicKey?: string;
  }>(),
  adminWallets: jsonb("admin_wallets").default('[]').notNull().$type<string[]>(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const aiModelPools = pgTable("ai_model_pools", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // LLM, Computer Vision, etc.
  description: text("description").notNull(),
  minCpuCores: integer("min_cpu_cores").notNull(),
  minGpuMemory: integer("min_gpu_memory").notNull(),
  minRamGb: integer("min_ram_gb").notNull(),
  rewardPerHour: decimal("reward_per_hour", { precision: 10, scale: 6 }).notNull(),
  status: text("status").notNull().default('active'), // active, training, completed
  trainingProgress: integer("training_progress").default(0).notNull(),
  participantCount: integer("participant_count").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const resourceContributions = pgTable("resource_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  poolId: varchar("pool_id").references(() => aiModelPools.id).notNull(),
  cpuCoresAllocated: integer("cpu_cores_allocated").notNull(),
  gpuMemoryAllocated: integer("gpu_memory_allocated").notNull(),
  ramAllocated: integer("ram_allocated").notNull(),
  hoursContributed: decimal("hours_contributed", { precision: 10, scale: 2 }).default('0').notNull(),
  rewardsEarned: decimal("rewards_earned", { precision: 10, scale: 6 }).default('0').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const resourceStats = pgTable("resource_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  totalCpuHours: decimal("total_cpu_hours", { precision: 15, scale: 2 }).default('0').notNull(),
  totalGpuHours: decimal("total_gpu_hours", { precision: 15, scale: 2 }).default('0').notNull(),
  totalEarnings: decimal("total_earnings", { precision: 15, scale: 6 }).default('0').notNull(),
  networkRank: integer("network_rank").default(0).notNull(),
  uptimePercentage: decimal("uptime_percentage", { precision: 5, scale: 2 }).default('0').notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertIcoStageSchema = createInsertSchema(icoStages);
export const insertParticipantSchema = createInsertSchema(participants).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertPlatformSettingsSchema = createInsertSchema(platformSettings).omit({ id: true, updatedAt: true });
export const insertAiModelPoolSchema = createInsertSchema(aiModelPools);
export const insertResourceContributionSchema = createInsertSchema(resourceContributions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertResourceStatsSchema = createInsertSchema(resourceStats).omit({ id: true, createdAt: true, updatedAt: true });

export type IcoStage = typeof icoStages.$inferSelect;
export type InsertIcoStage = z.infer<typeof insertIcoStageSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type PlatformSettings = typeof platformSettings.$inferSelect;
export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type AiModelPool = typeof aiModelPools.$inferSelect;
export type InsertAiModelPool = z.infer<typeof insertAiModelPoolSchema>;
export type ResourceContribution = typeof resourceContributions.$inferSelect;
export type InsertResourceContribution = z.infer<typeof insertResourceContributionSchema>;
export type ResourceStats = typeof resourceStats.$inferSelect;
export type InsertResourceStats = z.infer<typeof insertResourceStatsSchema>;
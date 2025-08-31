import { type IcoStage, type InsertIcoStage, type Participant, type InsertParticipant, type Transaction, type InsertTransaction, type PlatformSettings, type InsertPlatformSettings, type AiModelPool, type InsertAiModelPool, type ResourceContribution, type InsertResourceContribution, type ResourceStats, type InsertResourceStats, icoStages, participants, transactions, platformSettings, aiModelPools, resourceContributions, resourceStats } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // ICO Stages
  getIcoStages(): Promise<IcoStage[]>;
  getIcoStageById(id: string): Promise<IcoStage | undefined>;
  createIcoStage(stage: InsertIcoStage): Promise<IcoStage>;
  updateIcoStage(id: string, stage: Partial<IcoStage>): Promise<IcoStage | undefined>;

  // Participants
  getParticipantByWallet(walletAddress: string): Promise<Participant | undefined>;
  getParticipantById(id: string): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(id: string, participant: Partial<Participant>): Promise<Participant | undefined>;

  // Transactions
  getTransactionsByParticipant(participantId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;

  // Platform Settings
  getPlatformSettings(): Promise<PlatformSettings>;
  updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings>;

  // AI Model Pools
  getAiModelPools(): Promise<AiModelPool[]>;
  getAiModelPoolById(id: string): Promise<AiModelPool | null>;
  createAiModelPool(data: InsertAiModelPool): Promise<AiModelPool>;
  updateAiModelPool(id: string, data: Partial<InsertAiModelPool>): Promise<AiModelPool | null>;
  initializeSampleModels(): Promise<AiModelPool[]>;

  // Resource Contributions
  createResourceContribution(data: InsertResourceContribution): Promise<ResourceContribution>;
  getResourceContributionsByParticipant(participantId: string): Promise<ResourceContribution[]>;
  getActiveResourceContributions(): Promise<ResourceContribution[]>;
  updateResourceContribution(id: string, data: Partial<InsertResourceContribution>): Promise<ResourceContribution | null>;

  // Resource Stats
  getResourceStats(participantId: string): Promise<ResourceStats | null>;
  createOrUpdateResourceStats(participantId: string, data: Partial<InsertResourceStats>): Promise<ResourceStats>;
  getTopResourceContributors(limit?: number): Promise<ResourceStats[]>;

  // Model torrent methods (for decentralized training)
  saveModelTorrent(torrent: any): Promise<void>;
  updateModelTorrent(modelId: string, updates: any): Promise<void>;

  // Model Checkpoint Methods (for decentralized training)
  saveModelCheckpoint(poolId: string, checkpoint: any): Promise<void>;
  getLatestModelCheckpoint(poolId: string): Promise<any | null>;
  getModelCheckpointHistory(poolId: string): Promise<any[]>;

  // Database cleanup methods
  cleanDatabase(): Promise<void>;
  resetDatabase(): Promise<void>;
}

export class MemStorage implements IStorage {
  private stages: Map<string, IcoStage> = new Map();
  private participants: Map<string, Participant> = new Map();
  private participantsByWallet: Map<string, Participant> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private settings!: PlatformSettings;
  private resourceContributions: Map<string, ResourceContribution> = new Map();
  private resourceStats: Map<string, ResourceStats> = new Map();

  constructor() {
    // No mock data initialization - use live database only
  }

  async getIcoStages(): Promise<IcoStage[]> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async getIcoStageById(id: string): Promise<IcoStage | undefined> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async createIcoStage(stage: InsertIcoStage): Promise<IcoStage> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async updateIcoStage(id: string, updates: Partial<IcoStage>): Promise<IcoStage | undefined> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async getParticipantByWallet(walletAddress: string): Promise<Participant | undefined> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async getParticipantById(id: string): Promise<Participant | undefined> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async getTransactionsByParticipant(participantId: string): Promise<Transaction[]> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async getAllTransactions(): Promise<Transaction[]> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  // AI Model Pools
  async getAiModelPools(): Promise<AiModelPool[]> {
    // In-memory storage for AI Model Pools is removed. This method should not be called directly.
    // For database operations, use DatabaseStorage.
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for AI Model Pools.");
  }

  async getAiModelPoolById(id: string): Promise<AiModelPool | null> {
    // In-memory storage for AI Model Pools is removed.
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for AI Model Pools.");
  }

  async createAiModelPool(data: InsertAiModelPool): Promise<AiModelPool> {
    // In-memory storage for AI Model Pools is removed.
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for AI Model Pools.");
  }

  async updateAiModelPool(id: string, data: Partial<InsertAiModelPool>): Promise<AiModelPool | null> {
    // In-memory storage for AI Model Pools is removed.
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for AI Model Pools.");
  }

  async initializeSampleModels(): Promise<AiModelPool[]> {
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for AI Model Pools.");
  }

  // Resource Contributions
  async createResourceContribution(data: InsertResourceContribution): Promise<ResourceContribution> {
    const id = randomUUID();
    const newContribution: ResourceContribution = {
      id,
      participantId: data.participantId,
      poolId: data.poolId,
      cpuCoresAllocated: data.cpuCoresAllocated,
      gpuMemoryAllocated: data.gpuMemoryAllocated,
      ramAllocated: data.ramAllocated,
      hoursContributed: data.hoursContributed || '0',
      rewardsEarned: data.rewardsEarned || '0',
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.resourceContributions.set(id, newContribution);
    return newContribution;
  }

  async getResourceContributionsByParticipant(participantId: string): Promise<ResourceContribution[]> {
    return Array.from(this.resourceContributions.values())
      .filter(contribution => contribution.participantId === participantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getActiveResourceContributions(): Promise<ResourceContribution[]> {
    return Array.from(this.resourceContributions.values())
      .filter(contribution => contribution.isActive);
  }

  async updateResourceContribution(id: string, data: Partial<InsertResourceContribution>): Promise<ResourceContribution | null> {
    const existing = this.resourceContributions.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.resourceContributions.set(id, updated);
    return updated;
  }

  // Resource Stats
  async getResourceStats(participantId: string): Promise<ResourceStats | null> {
    return this.resourceStats.get(participantId) || null;
  }

  async createOrUpdateResourceStats(participantId: string, data: Partial<InsertResourceStats>): Promise<ResourceStats> {
    const existing = this.resourceStats.get(participantId);
    const now = new Date();

    if (existing) {
      const updatedStats: ResourceStats = {
        ...existing,
        ...data,
        updatedAt: now
      };
      this.resourceStats.set(participantId, updatedStats);
      return updatedStats;
    } else {
      const newStats: ResourceStats = {
        id: randomUUID(),
        participantId,
        totalCpuHours: data.totalCpuHours || '0',
        totalGpuHours: data.totalGpuHours || '0',
        totalEarnings: data.totalEarnings || '0',
        networkRank: data.networkRank || 0,
        uptimePercentage: data.uptimePercentage || '0',
        createdAt: now,
        updatedAt: now
      };
      this.resourceStats.set(participantId, newStats);
      return newStats;
    }
  }

  async getTopResourceContributors(limit: number = 10): Promise<ResourceStats[]> {
    return Array.from(this.resourceStats.values())
      .sort((a, b) => parseFloat(b.totalEarnings || '0') - parseFloat(a.totalEarnings || '0'))
      .slice(0, limit);
  }

  // Model torrent methods (Not implemented in MemStorage)
  async saveModelTorrent(torrent: any): Promise<void> {
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for model torrents.");
  }

  async updateModelTorrent(modelId: string, updates: any): Promise<void> {
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for model torrents.");
  }

  // Model checkpoint methods (Not implemented in MemStorage)
  async saveModelCheckpoint(poolId: string, checkpoint: any): Promise<void> {
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for model checkpoints.");
  }

  async getLatestModelCheckpoint(poolId: string): Promise<any | null> {
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for model checkpoints.");
  }

  async getModelCheckpointHistory(poolId: string): Promise<any[]> {
    throw new Error("Method not implemented in MemStorage. Use DatabaseStorage for model checkpoints.");
  }

  async cleanDatabase(): Promise<void> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }

  async resetDatabase(): Promise<void> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for all operations.");
  }
}

export class DatabaseStorage implements IStorage {
  async getIcoStages(): Promise<IcoStage[]> {
    return await db.select().from(icoStages);
  }

  async getIcoStageById(id: string): Promise<IcoStage | undefined> {
    const [stage] = await db.select().from(icoStages).where(eq(icoStages.id, id));
    return stage || undefined;
  }

  async createIcoStage(stage: InsertIcoStage): Promise<IcoStage> {
    const [newStage] = await db
      .insert(icoStages)
      .values({
        ...stage,
        status: stage.status || 'upcoming',
        soldTokens: stage.soldTokens || 0,
      })
      .returning();
    return newStage;
  }

  async updateIcoStage(id: string, updates: Partial<IcoStage>): Promise<IcoStage | undefined> {
    const [updatedStage] = await db
      .update(icoStages)
      .set(updates)
      .where(eq(icoStages.id, id))
      .returning();
    return updatedStage || undefined;
  }

  async getParticipantByWallet(walletAddress: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.walletAddress, walletAddress.toLowerCase()));
    return participant || undefined;
  }

  async getParticipantById(id: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));
    return participant || undefined;
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const [newParticipant] = await db
      .insert(participants)
      .values({
        ...participant,
        walletAddress: participant.walletAddress.toLowerCase(),
        tokenBalance: participant.tokenBalance || 0,
        totalInvested: participant.totalInvested || '0',
      })
      .returning();
    return newParticipant;
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const [updatedParticipant] = await db
      .update(participants)
      .set(updates)
      .where(eq(participants.id, id))
      .returning();
    return updatedParticipant || undefined;
  }

  async getTransactionsByParticipant(participantId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.participantId, participantId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        ...transaction,
        status: transaction.status || 'pending',
      })
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    const [settings] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, 'default'));

    // Create default settings if they don't exist
    if (!settings) {
      // First initialize ICO stages
      await this.initializeIcoStages();

      const defaultSettings = {
        id: 'default',
        isIcoActive: true,
        currentStageId: 'stage3',
        features: {
          wallet: true,
          purchase: true,
          dashboard: true,
          tokenomics: true,
          pioneers: true,
          history: true
        },
        apiKeys: {
          rewonApiKey: undefined,
          nowpaymentsApiKey: undefined,
          nowpaymentsPublicKey: undefined
        },
        adminWallets: ['0x988f90a2b05356b4b626c27e10bfdde352bac8a0'.toLowerCase()]
      };

      const [newSettings] = await db
        .insert(platformSettings)
        .values(defaultSettings)
        .returning();
      return newSettings;
    }

    return settings;
  }

  private async initializeIcoStages(): Promise<void> {
    try {
      const existingStages = await db.select().from(icoStages);
      if (existingStages.length > 0) {
        return;
      }

      const stages = [
        {
          id: 'stage1',
          name: 'Private Sale',
          tokenPrice: '0.05',
          totalTokens: 50000000,
          soldTokens: 50000000,
          minPurchase: 10000,
          maxPurchase: 1000000,
          status: 'completed' as const
        },
        {
          id: 'stage2',
          name: 'Presale Round 1',
          tokenPrice: '0.065',
          totalTokens: 75000000,
          soldTokens: 75000000,
          minPurchase: 5000,
          maxPurchase: 500000,
          status: 'completed' as const
        },
        {
          id: 'stage3',
          name: 'Presale Round 2',
          tokenPrice: '0.075',
          totalTokens: 100000000,
          soldTokens: 0,
          minPurchase: 1000,
          maxPurchase: 250000,
          status: 'active' as const
        },
        {
          id: 'stage4',
          name: 'Public Sale',
          tokenPrice: '0.10',
          totalTokens: 75000000,
          soldTokens: 0,
          minPurchase: 500,
          maxPurchase: 100000,
          status: 'upcoming' as const
        }
      ];

      for (const stage of stages) {
        await db.insert(icoStages).values(stage);
      }
    } catch (error) {
      console.error("Error initializing ICO stages:", error);
    }
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    // Normalize admin wallet addresses to lowercase if they exist
    if (updates.adminWallets) {
      updates.adminWallets = updates.adminWallets.map(wallet => wallet.toLowerCase());
    }

    const [updatedSettings] = await db
      .update(platformSettings)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(platformSettings.id, 'default'))
      .returning();
    return updatedSettings;
  }

  async getAiModelPools(): Promise<AiModelPool[]> {
    return await db.select().from(aiModelPools);
  }

  async getAiModelPoolById(id: string): Promise<AiModelPool | null> {
    const [pool] = await db.select().from(aiModelPools).where(eq(aiModelPools.id, id));
    return pool || null;
  }

  async createAiModelPool(data: InsertAiModelPool): Promise<AiModelPool> {
    const [pool] = await db.insert(aiModelPools).values(data).returning();
    return pool;
  }

  async initializeSampleModels(): Promise<AiModelPool[]> {
    try {
      const existingModels = await this.getAiModelPools();
      if (existingModels.length > 0) {
        return existingModels;
      }

      // Initialize required database entries for a working application
      const sampleModels = [
        {
          id: "stellarium-gpt-v2",
          name: "Stellarium GPT v2",
          type: "Large Language Model",
          description: "Advanced language model for writing, analysis, and conversation with astronomical knowledge",
          minCpuCores: 4,
          minGpuMemory: 8,
          minRamGb: 16,
          rewardPerHour: "0.50",
          status: "active" as const,
          trainingProgress: 100,
          participantCount: 234
        },
        {
          id: "stellar-vision",
          name: "StellarVision",
          type: "Computer Vision",
          description: "High-quality image generation and editing model specialized in space imagery",
          minCpuCores: 8,
          minGpuMemory: 16,
          minRamGb: 32,
          rewardPerHour: "1.20",
          status: "active" as const,
          trainingProgress: 100,
          participantCount: 156
        },
        {
          id: "cosmos-coder",
          name: "Cosmos Coder",
          type: "Code Generation",
          description: "Specialized coding assistant for multiple programming languages with space science focus",
          minCpuCores: 6,
          minGpuMemory: 12,
          minRamGb: 24,
          rewardPerHour: "0.80",
          status: "active" as const,
          trainingProgress: 100,
          participantCount: 189
        }
      ];

      const createdModels = [];
      for (const model of sampleModels) {
        const [created] = await db.insert(aiModelPools).values(model).returning();
        createdModels.push(created);
      }

      return createdModels;
    } catch (error) {
      console.error("Error initializing sample models:", error);
      return [];
    }
  }

  async updateAiModelPool(id: string, data: Partial<InsertAiModelPool>): Promise<AiModelPool | null> {
    const [updatedPool] = await db
      .update(aiModelPools)
      .set(data)
      .where(eq(aiModelPools.id, id))
      .returning();
    return updatedPool || null;
  }

  async createResourceContribution(data: InsertResourceContribution): Promise<ResourceContribution> {
    const [newContribution] = await db
      .insert(resourceContributions)
      .values({
        ...data,
        hoursContributed: data.hoursContributed || '0',
        rewardsEarned: data.rewardsEarned || '0',
        isActive: data.isActive ?? true,
      })
      .returning();
    return newContribution;
  }

  async getResourceContributionsByParticipant(participantId: string): Promise<ResourceContribution[]> {
    return await db
      .select()
      .from(resourceContributions)
      .where(eq(resourceContributions.participantId, participantId))
      .orderBy(desc(resourceContributions.createdAt));
  }

  async getActiveResourceContributions(): Promise<ResourceContribution[]> {
    return await db
      .select()
      .from(resourceContributions)
      .where(eq(resourceContributions.isActive, true));
  }

  async updateResourceContribution(id: string, data: Partial<InsertResourceContribution>): Promise<ResourceContribution | null> {
    const [updatedContribution] = await db
      .update(resourceContributions)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(resourceContributions.id, id))
      .returning();
    return updatedContribution || null;
  }

  async getResourceStats(participantId: string): Promise<ResourceStats | null> {
    const [stats] = await db
      .select()
      .from(resourceStats)
      .where(eq(resourceStats.participantId, participantId));
    return stats || null;
  }

  async createOrUpdateResourceStats(participantId: string, data: Partial<InsertResourceStats>): Promise<ResourceStats> {
    const existing = await this.getResourceStats(participantId);

    if (existing) {
      const [updatedStats] = await db
        .update(resourceStats)
        .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(resourceStats.participantId, participantId))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(resourceStats)
        .values({
          participantId,
          totalCpuHours: data.totalCpuHours || '0',
          totalGpuHours: data.totalGpuHours || '0',
          totalEarnings: data.totalEarnings || '0',
          networkRank: data.networkRank || 0,
          uptimePercentage: data.uptimePercentage || '0',
        })
        .returning();
      return newStats;
    }
  }

  async getTopResourceContributors(limit: number = 10): Promise<ResourceStats[]> {
    return await db
      .select()
      .from(resourceStats)
      .orderBy(desc(sql`CAST(${resourceStats.totalEarnings} AS NUMERIC)`))
      .limit(limit);
  }

  // Model torrent methods
  async saveModelTorrent(torrent: any): Promise<void> {
    // Store torrent info in memory for now
    console.log(`Saving torrent for model ${torrent.modelId}`);
    // In a real implementation, you would save this to a dedicated torrents table
    // Example: await db.insert(modelTorrents).values(torrent).returning();
  }

  async updateModelTorrent(modelId: string, updates: any): Promise<void> {
    console.log(`Updating torrent for model ${modelId}`, updates);
    // In a real implementation, you would update the torrent info in the database
    // Example: await db.update(modelTorrents).set(updates).where(eq(modelTorrents.modelId, modelId));
  }

  // Model checkpoint methods
  async saveModelCheckpoint(poolId: string, checkpoint: any): Promise<void> {
    console.log(`Saving checkpoint for pool ${poolId}`, checkpoint);
    // In a real implementation, you would save this to a dedicated checkpoints table
    // Example: await db.insert(modelCheckpoints).values({ poolId, ...checkpoint }).returning();
  }

  async getLatestModelCheckpoint(poolId: string): Promise<any> {
    // In a real implementation, this would query the checkpoints table, ordered by version or timestamp
    // For now, return a mock checkpoint
    console.log(`Getting latest checkpoint for pool ${poolId}`);
    return {
      poolId,
      version: 1,
      timestamp: new Date(),
      trainingMetrics: {
        loss: Math.random() * 0.5,
        accuracy: 0.7 + Math.random() * 0.3
      }
    };
  }

  async getModelCheckpointHistory(poolId: string): Promise<any[]> {
    // In a real implementation, this would return all checkpoints for a model, ordered
    console.log(`Getting checkpoint history for pool ${poolId}`);
    const history = [];
    const latestVersion = 1; // Mock version

    for (let i = Math.max(1, latestVersion - 10); i <= latestVersion; i++) {
      history.push({
        poolId,
        version: i,
        timestamp: new Date(Date.now() - (latestVersion - i) * 60000),
        trainingMetrics: {
          loss: Math.random() * 0.5,
          accuracy: 0.6 + (i / latestVersion) * 0.4
        }
      });
    }

    return history;
  }

  // Database cleanup methods
  async cleanDatabase(): Promise<void> {
    try {
      // Delete all data from tables in correct order (respecting foreign keys)
      // First delete dependent tables
      await db.delete(resourceContributions);
      await db.delete(resourceStats);
      await db.delete(aiModelPools);
      await db.delete(transactions);
      await db.delete(participants);

      // Delete platform_settings before ico_stages since it references ico_stages
      await db.delete(platformSettings);
      await db.delete(icoStages);

      console.log('Database cleaned successfully - all data removed');
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      // Clean the database first
      await this.cleanDatabase();

      // Reinitialize with fresh data
      await this.initializeIcoStages();
      await this.getPlatformSettings(); // This will create default settings
      await this.initializeSampleModels();

      console.log('Database reset successfully - clean slate with initial data');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
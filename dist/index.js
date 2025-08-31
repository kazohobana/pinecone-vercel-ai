var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiModelPools: () => aiModelPools,
  icoStages: () => icoStages,
  insertAiModelPoolSchema: () => insertAiModelPoolSchema,
  insertIcoStageSchema: () => insertIcoStageSchema,
  insertParticipantSchema: () => insertParticipantSchema,
  insertPlatformSettingsSchema: () => insertPlatformSettingsSchema,
  insertResourceContributionSchema: () => insertResourceContributionSchema,
  insertResourceStatsSchema: () => insertResourceStatsSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  participants: () => participants,
  platformSettings: () => platformSettings,
  resourceContributions: () => resourceContributions,
  resourceStats: () => resourceStats,
  transactions: () => transactions
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var icoStages, participants, transactions, platformSettings, aiModelPools, resourceContributions, resourceStats, insertIcoStageSchema, insertParticipantSchema, insertTransactionSchema, insertPlatformSettingsSchema, insertAiModelPoolSchema, insertResourceContributionSchema, insertResourceStatsSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    icoStages = pgTable("ico_stages", {
      id: varchar("id").primaryKey(),
      name: text("name").notNull(),
      tokenPrice: decimal("token_price", { precision: 10, scale: 6 }).notNull(),
      totalTokens: integer("total_tokens").notNull(),
      soldTokens: integer("sold_tokens").default(0).notNull(),
      minPurchase: integer("min_purchase").notNull(),
      maxPurchase: integer("max_purchase").notNull(),
      status: text("status").notNull().default("upcoming"),
      // upcoming, active, completed
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    participants = pgTable("participants", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      walletAddress: text("wallet_address").notNull().unique(),
      tokenBalance: integer("token_balance").default(0).notNull(),
      totalInvested: decimal("total_invested", { precision: 10, scale: 2 }).default("0").notNull(),
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    transactions = pgTable("transactions", {
      id: varchar("id").primaryKey(),
      participantId: varchar("participant_id").references(() => participants.id).notNull(),
      stageId: varchar("stage_id").references(() => icoStages.id).notNull(),
      amountUSD: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
      tokens: integer("tokens").notNull(),
      transactionHash: text("transaction_hash"),
      status: text("status").notNull().default("pending"),
      // pending, completed, failed
      paymentMethod: text("payment_method"),
      // crypto, card, etc
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    platformSettings = pgTable("platform_settings", {
      id: varchar("id").primaryKey().default("default"),
      isIcoActive: boolean("is_ico_active").default(true).notNull(),
      currentStageId: varchar("current_stage_id").references(() => icoStages.id).notNull(),
      features: jsonb("features").notNull().$type(),
      apiKeys: jsonb("api_keys").notNull().$type(),
      updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    aiModelPools = pgTable("ai_model_pools", {
      id: varchar("id").primaryKey(),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // LLM, Computer Vision, etc.
      description: text("description").notNull(),
      minCpuCores: integer("min_cpu_cores").notNull(),
      minGpuMemory: integer("min_gpu_memory").notNull(),
      minRamGb: integer("min_ram_gb").notNull(),
      rewardPerHour: decimal("reward_per_hour", { precision: 10, scale: 6 }).notNull(),
      status: text("status").notNull().default("active"),
      // active, training, completed
      trainingProgress: integer("training_progress").default(0).notNull(),
      participantCount: integer("participant_count").default(0).notNull(),
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    resourceContributions = pgTable("resource_contributions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      participantId: varchar("participant_id").references(() => participants.id).notNull(),
      poolId: varchar("pool_id").references(() => aiModelPools.id).notNull(),
      cpuCoresAllocated: integer("cpu_cores_allocated").notNull(),
      gpuMemoryAllocated: integer("gpu_memory_allocated").notNull(),
      ramAllocated: integer("ram_allocated").notNull(),
      hoursContributed: decimal("hours_contributed", { precision: 10, scale: 2 }).default("0").notNull(),
      rewardsEarned: decimal("rewards_earned", { precision: 10, scale: 6 }).default("0").notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
      updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    resourceStats = pgTable("resource_stats", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      participantId: varchar("participant_id").references(() => participants.id).notNull(),
      totalCpuHours: decimal("total_cpu_hours", { precision: 15, scale: 2 }).default("0").notNull(),
      totalGpuHours: decimal("total_gpu_hours", { precision: 15, scale: 2 }).default("0").notNull(),
      totalEarnings: decimal("total_earnings", { precision: 15, scale: 6 }).default("0").notNull(),
      networkRank: integer("network_rank").default(0).notNull(),
      uptimePercentage: decimal("uptime_percentage", { precision: 5, scale: 2 }).default("0").notNull(),
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
      updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull()
    });
    insertIcoStageSchema = createInsertSchema(icoStages);
    insertParticipantSchema = createInsertSchema(participants).omit({ id: true, createdAt: true });
    insertTransactionSchema = createInsertSchema(transactions);
    insertPlatformSettingsSchema = createInsertSchema(platformSettings).omit({ id: true, updatedAt: true });
    insertAiModelPoolSchema = createInsertSchema(aiModelPools);
    insertResourceContributionSchema = createInsertSchema(resourceContributions).omit({ id: true, createdAt: true, updatedAt: true });
    insertResourceStatsSchema = createInsertSchema(resourceStats).omit({ id: true, createdAt: true, updatedAt: true });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, sql as sql2, desc } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      async getIcoStages() {
        return await db.select().from(icoStages);
      }
      async getIcoStageById(id) {
        const [stage] = await db.select().from(icoStages).where(eq(icoStages.id, id));
        return stage || void 0;
      }
      async createIcoStage(stage) {
        const [newStage] = await db.insert(icoStages).values({
          ...stage,
          status: stage.status || "upcoming",
          soldTokens: stage.soldTokens || 0
        }).returning();
        return newStage;
      }
      async updateIcoStage(id, updates) {
        const [updatedStage] = await db.update(icoStages).set(updates).where(eq(icoStages.id, id)).returning();
        return updatedStage || void 0;
      }
      async getParticipantByWallet(walletAddress) {
        const [participant] = await db.select().from(participants).where(eq(participants.walletAddress, walletAddress.toLowerCase()));
        return participant || void 0;
      }
      async createParticipant(participant) {
        const [newParticipant] = await db.insert(participants).values({
          ...participant,
          walletAddress: participant.walletAddress.toLowerCase(),
          tokenBalance: participant.tokenBalance || 0,
          totalInvested: participant.totalInvested || "0"
        }).returning();
        return newParticipant;
      }
      async updateParticipant(id, updates) {
        const [updatedParticipant] = await db.update(participants).set(updates).where(eq(participants.id, id)).returning();
        return updatedParticipant || void 0;
      }
      async getTransactionsByParticipant(participantId) {
        return await db.select().from(transactions).where(eq(transactions.participantId, participantId)).orderBy(desc(transactions.createdAt));
      }
      async getAllTransactions() {
        return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
      }
      async createTransaction(transaction) {
        const [newTransaction] = await db.insert(transactions).values({
          ...transaction,
          status: transaction.status || "pending"
        }).returning();
        return newTransaction;
      }
      async updateTransaction(id, updates) {
        const [updatedTransaction] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
        return updatedTransaction || void 0;
      }
      async getPlatformSettings() {
        const [settings] = await db.select().from(platformSettings).where(eq(platformSettings.id, "default"));
        if (!settings) {
          const defaultSettings = {
            id: "default",
            isIcoActive: true,
            currentStageId: "stage3",
            features: {
              wallet: true,
              purchase: true,
              dashboard: true,
              tokenomics: true,
              pioneers: true,
              history: true
            },
            apiKeys: {}
          };
          const [newSettings] = await db.insert(platformSettings).values(defaultSettings).returning();
          return newSettings;
        }
        return settings;
      }
      async updatePlatformSettings(updates) {
        const [updatedSettings] = await db.update(platformSettings).set({ ...updates, updatedAt: sql2`CURRENT_TIMESTAMP` }).where(eq(platformSettings.id, "default")).returning();
        return updatedSettings;
      }
      async getAiModelPools() {
        return await db.select().from(aiModelPools);
      }
      async getAiModelPoolById(id) {
        const [pool2] = await db.select().from(aiModelPools).where(eq(aiModelPools.id, id));
        return pool2 || null;
      }
      async createAiModelPool(data) {
        const [pool2] = await db.insert(aiModelPools).values(data).returning();
        return pool2;
      }
      async initializeSampleModels() {
        try {
          const existingModels = await db.select().from(aiModelPools);
          if (existingModels.length > 0) {
            return existingModels;
          }
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
              status: "active",
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
              status: "active",
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
              status: "active",
              trainingProgress: 100,
              participantCount: 189
            },
            {
              id: "fact-checker-pro",
              name: "FactChecker Pro",
              type: "Analysis Model",
              description: "Real-time fact checking and source verification with scientific paper analysis",
              minCpuCores: 5,
              minGpuMemory: 10,
              minRamGb: 20,
              rewardPerHour: "0.60",
              status: "active",
              trainingProgress: 100,
              participantCount: 123
            },
            {
              id: "audio-forge",
              name: "AudioForge",
              type: "Audio Processing",
              description: "Advanced audio processing and generation for space communications",
              minCpuCores: 10,
              minGpuMemory: 20,
              minRamGb: 40,
              rewardPerHour: "1.50",
              status: "training",
              trainingProgress: 78,
              participantCount: 67
            },
            {
              id: "exoplanet-classifier",
              name: "Exoplanet Classifier",
              type: "Signal Processing",
              description: "Neural network for detecting and classifying exoplanets from telescope data",
              minCpuCores: 12,
              minGpuMemory: 24,
              minRamGb: 48,
              rewardPerHour: "2.00",
              status: "training",
              trainingProgress: 45,
              participantCount: 89
            },
            {
              id: "stellar-synthesis",
              name: "Stellar Synthesis",
              type: "Multimodal AI",
              description: "Advanced multimodal AI combining text, image, and data analysis for stellar research",
              minCpuCores: 16,
              minGpuMemory: 32,
              minRamGb: 64,
              rewardPerHour: "3.00",
              status: "training",
              trainingProgress: 23,
              participantCount: 45
            },
            {
              id: "quantum-simulator",
              name: "Quantum Simulator",
              type: "Physics Simulation",
              description: "Quantum mechanical simulation for space-time physics and cosmic phenomena",
              minCpuCores: 20,
              minGpuMemory: 40,
              minRamGb: 80,
              rewardPerHour: "4.50",
              status: "active",
              trainingProgress: 100,
              participantCount: 28
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
      async updateAiModelPool(id, data) {
        const [updatedPool] = await db.update(aiModelPools).set(data).where(eq(aiModelPools.id, id)).returning();
        return updatedPool || null;
      }
      async createResourceContribution(data) {
        const [newContribution] = await db.insert(resourceContributions).values({
          ...data,
          hoursContributed: data.hoursContributed || "0",
          rewardsEarned: data.rewardsEarned || "0",
          isActive: data.isActive ?? true
        }).returning();
        return newContribution;
      }
      async getResourceContributionsByParticipant(participantId) {
        return await db.select().from(resourceContributions).where(eq(resourceContributions.participantId, participantId)).orderBy(desc(resourceContributions.createdAt));
      }
      async getActiveResourceContributions() {
        return await db.select().from(resourceContributions).where(eq(resourceContributions.isActive, true));
      }
      async updateResourceContribution(id, data) {
        const [updatedContribution] = await db.update(resourceContributions).set({ ...data, updatedAt: sql2`CURRENT_TIMESTAMP` }).where(eq(resourceContributions.id, id)).returning();
        return updatedContribution || null;
      }
      async getResourceStats(participantId) {
        const [stats] = await db.select().from(resourceStats).where(eq(resourceStats.participantId, participantId));
        return stats || null;
      }
      async createOrUpdateResourceStats(participantId, data) {
        const existing = await this.getResourceStats(participantId);
        if (existing) {
          const [updatedStats] = await db.update(resourceStats).set({ ...data, updatedAt: sql2`CURRENT_TIMESTAMP` }).where(eq(resourceStats.participantId, participantId)).returning();
          return updatedStats;
        } else {
          const [newStats] = await db.insert(resourceStats).values({
            participantId,
            totalCpuHours: data.totalCpuHours || "0",
            totalGpuHours: data.totalGpuHours || "0",
            totalEarnings: data.totalEarnings || "0",
            networkRank: data.networkRank || 0,
            uptimePercentage: data.uptimePercentage || "0"
          }).returning();
          return newStats;
        }
      }
      async getTopResourceContributors(limit = 10) {
        return await db.select().from(resourceStats).orderBy(desc(sql2`CAST(${resourceStats.totalEarnings} AS NUMERIC)`)).limit(limit);
      }
      // Model checkpoint methods
      async saveModelCheckpoint(poolId, checkpoint) {
        console.log(`Saving checkpoint for pool ${poolId}, version ${checkpoint.version}`);
      }
      async getLatestModelCheckpoint(poolId) {
        console.log(`Getting latest checkpoint for pool ${poolId}`);
        return {
          poolId,
          version: Math.floor(Date.now() / 6e4) % 100,
          // Mock version based on time
          timestamp: /* @__PURE__ */ new Date(),
          trainingMetrics: {
            loss: Math.random() * 0.5,
            accuracy: 0.7 + Math.random() * 0.3
          }
        };
      }
      async getModelCheckpointHistory(poolId) {
        console.log(`Getting checkpoint history for pool ${poolId}`);
        const history = [];
        const latestVersion = Math.floor(Date.now() / 6e4) % 100;
        for (let i = Math.max(1, latestVersion - 10); i <= latestVersion; i++) {
          history.push({
            poolId,
            version: i,
            timestamp: new Date(Date.now() - (latestVersion - i) * 6e4),
            trainingMetrics: {
              loss: Math.random() * 0.5,
              accuracy: 0.6 + i / latestVersion * 0.4
            }
          });
        }
        return history;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/p2p-node.ts
import { EventEmitter } from "events";
import { createHash } from "crypto";
var P2PNode;
var init_p2p_node = __esm({
  "server/p2p-node.ts"() {
    "use strict";
    P2PNode = class extends EventEmitter {
      nodeId;
      walletAddress;
      peers = /* @__PURE__ */ new Map();
      modelTorrents = /* @__PURE__ */ new Map();
      downloadedChunks = /* @__PURE__ */ new Map();
      uploadQueue = [];
      downloadQueue = [];
      maxConnections = 50;
      chunkSize = 1024 * 1024;
      // 1MB chunks
      constructor(walletAddress) {
        super();
        this.walletAddress = walletAddress;
        this.nodeId = createHash("sha256").update(walletAddress + Date.now()).digest("hex");
      }
      // Initialize the P2P node
      async initialize() {
        console.log(`P2P Node ${this.nodeId} initialized for wallet ${this.walletAddress}`);
        this.startPeerDiscovery();
        this.startChunkSharing();
      }
      // Create a new model torrent
      async createModelTorrent(modelId, modelData) {
        const totalChunks = Math.ceil(modelData.length / this.chunkSize);
        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
          const start = i * this.chunkSize;
          const end = Math.min(start + this.chunkSize, modelData.length);
          const chunkData = modelData.slice(start, end);
          const hash = createHash("sha256").update(chunkData).digest("hex");
          const chunk = {
            id: `${modelId}_${i}`,
            modelId,
            chunkIndex: i,
            data: chunkData,
            hash,
            size: chunkData.length,
            timestamp: /* @__PURE__ */ new Date()
          };
          chunks.push(chunk);
          this.downloadedChunks.set(chunk.id, chunk);
        }
        const magnetLink = this.generateMagnetLink(modelId, totalChunks, modelData.length);
        const torrent = {
          modelId,
          name: `AI_Model_${modelId}`,
          totalChunks,
          chunkSize: this.chunkSize,
          totalSize: modelData.length,
          magnetLink,
          seeders: [{
            id: this.nodeId,
            walletAddress: this.walletAddress,
            availableChunks: chunks.map((c) => c.id),
            bandwidth: 1e3,
            uploadRatio: 1,
            lastSeen: /* @__PURE__ */ new Date()
          }],
          leechers: [],
          createdAt: /* @__PURE__ */ new Date(),
          lastUpdated: /* @__PURE__ */ new Date()
        };
        this.modelTorrents.set(modelId, torrent);
        this.emit("torrentCreated", torrent);
        return torrent;
      }
      // Join an existing model torrent
      async joinModelTorrent(magnetLink) {
        const torrentInfo = this.parseMagnetLink(magnetLink);
        if (!torrentInfo) throw new Error("Invalid magnet link");
        const { modelId, totalChunks, totalSize } = torrentInfo;
        let torrent = this.modelTorrents.get(modelId);
        if (!torrent) {
          torrent = {
            modelId,
            name: `AI_Model_${modelId}`,
            totalChunks,
            chunkSize: this.chunkSize,
            totalSize,
            magnetLink,
            seeders: [],
            leechers: [{
              id: this.nodeId,
              walletAddress: this.walletAddress,
              availableChunks: [],
              bandwidth: 1e3,
              uploadRatio: 0,
              lastSeen: /* @__PURE__ */ new Date()
            }],
            createdAt: /* @__PURE__ */ new Date(),
            lastUpdated: /* @__PURE__ */ new Date()
          };
          this.modelTorrents.set(modelId, torrent);
        }
        this.startDownload(modelId);
        this.emit("torrentJoined", torrent);
      }
      // Start downloading chunks for a model
      async startDownload(modelId) {
        const torrent = this.modelTorrents.get(modelId);
        if (!torrent) return;
        const availablePeers = [...torrent.seeders, ...torrent.leechers].filter((peer) => peer.id !== this.nodeId && peer.availableChunks.length > 0);
        for (let i = 0; i < torrent.totalChunks; i++) {
          const chunkId = `${modelId}_${i}`;
          if (!this.downloadedChunks.has(chunkId)) {
            const peersWithChunk = availablePeers.filter(
              (peer) => peer.availableChunks.includes(chunkId)
            );
            if (peersWithChunk.length > 0) {
              const bestPeer = peersWithChunk.sort((a, b) => b.uploadRatio - a.uploadRatio)[0];
              await this.requestChunkFromPeer(bestPeer, chunkId);
            }
          }
        }
      }
      // Request a specific chunk from a peer
      async requestChunkFromPeer(peer, chunkId) {
        console.log(`Requesting chunk ${chunkId} from peer ${peer.id}`);
        const chunk = await this.simulateChunkDownload(chunkId);
        if (chunk) {
          this.downloadedChunks.set(chunkId, chunk);
          this.updatePeerAvailability();
          this.emit("chunkDownloaded", chunk);
        }
      }
      // Simulate chunk download (replace with actual P2P implementation)
      async simulateChunkDownload(chunkId) {
        await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
        if (Math.random() > 0.1) {
          const [modelId, chunkIndex] = chunkId.split("_");
          const data = Buffer.from(`Simulated chunk data for ${chunkId}`);
          return {
            id: chunkId,
            modelId,
            chunkIndex: parseInt(chunkIndex),
            data,
            hash: createHash("sha256").update(data).digest("hex"),
            size: data.length,
            timestamp: /* @__PURE__ */ new Date()
          };
        }
        return null;
      }
      // Update model with new training data
      async updateModelData(modelId, newData, version) {
        const torrent = this.modelTorrents.get(modelId);
        if (!torrent) return;
        const newChunks = await this.createModelTorrent(modelId, newData);
        this.broadcastModelUpdate(modelId, version);
        this.emit("modelUpdated", { modelId, version, newChunks });
      }
      // Broadcast model update to peers
      broadcastModelUpdate(modelId, version) {
        const torrent = this.modelTorrents.get(modelId);
        if (!torrent) return;
        const allPeers = [...torrent.seeders, ...torrent.leechers];
        allPeers.forEach((peer) => {
          if (peer.id !== this.nodeId) {
            console.log(`Notifying peer ${peer.id} about model ${modelId} update v${version}`);
          }
        });
      }
      // Start peer discovery process
      startPeerDiscovery() {
        setInterval(() => {
          this.discoverPeers();
        }, 3e4);
      }
      // Discover new peers
      async discoverPeers() {
        console.log("Discovering new peers...");
        const newPeers = await this.simulatePeerDiscovery();
        newPeers.forEach((peer) => {
          this.peers.set(peer.id, peer);
        });
      }
      // Simulate peer discovery
      async simulatePeerDiscovery() {
        const mockPeers = [];
        const peerCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < peerCount; i++) {
          mockPeers.push({
            id: createHash("sha256").update(`peer_${Date.now()}_${i}`).digest("hex"),
            walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
            availableChunks: [],
            bandwidth: Math.floor(Math.random() * 1e3) + 100,
            uploadRatio: Math.random() * 2,
            lastSeen: /* @__PURE__ */ new Date()
          });
        }
        return mockPeers;
      }
      // Start chunk sharing service
      startChunkSharing() {
        setInterval(() => {
          this.processUploadQueue();
        }, 1e3);
      }
      // Process upload requests from other peers
      processUploadQueue() {
        if (this.uploadQueue.length === 0) return;
        const chunk = this.uploadQueue.shift();
        if (chunk) {
          console.log(`Uploading chunk ${chunk.id} to peer`);
          this.emit("chunkUploaded", chunk);
        }
      }
      // Update peer availability information
      updatePeerAvailability() {
        this.modelTorrents.forEach((torrent) => {
          const myPeer = torrent.leechers.find((p) => p.id === this.nodeId) || torrent.seeders.find((p) => p.id === this.nodeId);
          if (myPeer) {
            myPeer.availableChunks = Array.from(this.downloadedChunks.keys()).filter((chunkId) => chunkId.startsWith(torrent.modelId));
            myPeer.lastSeen = /* @__PURE__ */ new Date();
          }
        });
      }
      // Generate magnet link for a torrent
      generateMagnetLink(modelId, totalChunks, totalSize) {
        const hash = createHash("sha256").update(`${modelId}_${totalChunks}_${totalSize}`).digest("hex");
        return `magnet:?xt=urn:btih:${hash}&dn=AI_Model_${modelId}&tr=stellarium-ai-tracker`;
      }
      // Parse magnet link
      parseMagnetLink(magnetLink) {
        const match = magnetLink.match(/dn=AI_Model_([^&]+)/);
        if (!match) return null;
        return {
          modelId: match[1],
          totalChunks: 100,
          // Would be extracted from actual torrent info
          totalSize: 1024 * 1024 * 100
          // Would be extracted from actual torrent info
        };
      }
      // Get download progress for a model
      getDownloadProgress(modelId) {
        const torrent = this.modelTorrents.get(modelId);
        if (!torrent) return 0;
        const downloadedChunks = Array.from(this.downloadedChunks.keys()).filter((chunkId) => chunkId.startsWith(modelId)).length;
        return downloadedChunks / torrent.totalChunks * 100;
      }
      // Allocate training task to this node
      async allocateTrainingTask(poolId, trainingBatch, resourceRequirements) {
        console.log(`Node ${this.nodeId} allocated training task for pool ${poolId}`);
        const trainingPromise = this.simulateTraining(poolId, trainingBatch, resourceRequirements);
        this.emit("trainingStarted", { poolId, batchId: trainingBatch.id, nodeId: this.nodeId });
        try {
          const result = await trainingPromise;
          await this.distributeTrainingResult(poolId, result);
          this.emit("trainingCompleted", {
            poolId,
            batchId: trainingBatch.id,
            nodeId: this.nodeId,
            result
          });
        } catch (error) {
          this.emit("trainingFailed", { poolId, batchId: trainingBatch.id, nodeId: this.nodeId, error });
        }
      }
      // Simulate training computation
      async simulateTraining(poolId, trainingBatch, requirements) {
        const trainingTime = requirements.estimatedDuration * 1e3;
        console.log(`Training on ${requirements.cpuCores} CPU cores, ${requirements.gpuMemory}MB GPU, ${requirements.ramGb}GB RAM`);
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, trainingTime / 10));
          this.emit("trainingProgress", {
            poolId,
            nodeId: this.nodeId,
            progress,
            resourceUsage: {
              cpu: Math.random() * 80 + 20,
              gpu: Math.random() * 90 + 10,
              memory: Math.random() * 70 + 30
            }
          });
        }
        return {
          gradients: new Array(requirements.gpuMemory / 100).fill(0).map(() => Math.random()),
          loss: Math.random() * 0.5 + 0.1,
          accuracy: Math.random() * 0.3 + 0.7,
          processedSamples: trainingBatch.samples || 1e3,
          computeTime: trainingTime,
          version: Date.now()
        };
      }
      // Distribute training results to other nodes
      async distributeTrainingResult(poolId, result) {
        const torrent = this.modelTorrents.get(poolId);
        if (!torrent) return;
        const resultData = Buffer.from(JSON.stringify(result));
        const resultChunk = {
          id: `${poolId}_result_${Date.now()}`,
          modelId: poolId,
          chunkIndex: -1,
          // Special index for results
          data: resultData,
          hash: createHash("sha256").update(resultData).digest("hex"),
          size: resultData.length,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.downloadedChunks.set(resultChunk.id, resultChunk);
        const allPeers = [...torrent.seeders, ...torrent.leechers];
        for (const peer of allPeers) {
          if (peer.id !== this.nodeId) {
            this.uploadQueue.push(resultChunk);
          }
        }
        this.emit("resultDistributed", { poolId, resultId: resultChunk.id });
      }
      // Handle dynamic resource reallocation
      async reallocateResources(poolId, newRequirements) {
        console.log(`Reallocating resources for pool ${poolId}:`, newRequirements);
        const currentCapacity = this.getCurrentResourceCapacity();
        if (currentCapacity.cpu >= newRequirements.cpuCores && currentCapacity.gpu >= newRequirements.gpuMemory && currentCapacity.ram >= newRequirements.ramGb) {
          this.emit("resourcesReallocated", {
            poolId,
            nodeId: this.nodeId,
            newAllocation: newRequirements,
            success: true
          });
          return true;
        }
        return false;
      }
      // Get current resource capacity
      getCurrentResourceCapacity() {
        return {
          cpu: Math.floor(Math.random() * 8) + 4,
          // 4-12 cores available
          gpu: Math.floor(Math.random() * 4096) + 2048,
          // 2-6GB GPU memory
          ram: Math.floor(Math.random() * 16) + 8
          // 8-24GB RAM
        };
      }
      // Save training checkpoint
      async saveCheckpoint(poolId, checkpointData, version) {
        const checkpointChunk = {
          id: `${poolId}_checkpoint_${version}`,
          modelId: poolId,
          chunkIndex: -2,
          // Special index for checkpoints
          data: checkpointData,
          hash: createHash("sha256").update(checkpointData).digest("hex"),
          size: checkpointData.length,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.downloadedChunks.set(checkpointChunk.id, checkpointChunk);
        this.emit("checkpointSaved", { poolId, version, checkpointId: checkpointChunk.id });
      }
      // Sync with latest model version
      async syncWithLatestVersion(modelId, latestVersion) {
        const torrent = this.modelTorrents.get(modelId);
        if (!torrent) return;
        console.log(`Syncing model ${modelId} to version ${latestVersion}`);
        const availablePeers = [...torrent.seeders, ...torrent.leechers].filter((peer) => peer.id !== this.nodeId);
        for (let version = this.getModelVersion(modelId) + 1; version <= latestVersion; version++) {
          const checkpointId = `${modelId}_checkpoint_${version}`;
          if (!this.downloadedChunks.has(checkpointId)) {
            const peersWithCheckpoint = availablePeers.filter(
              (peer) => peer.availableChunks.includes(checkpointId)
            );
            if (peersWithCheckpoint.length > 0) {
              const bestPeer = peersWithCheckpoint[0];
              await this.requestCheckpointFromPeer(bestPeer, checkpointId);
            }
          }
        }
        this.emit("modelSynced", { modelId, syncedToVersion: latestVersion });
      }
      // Get current model version
      getModelVersion(modelId) {
        let maxVersion = 0;
        for (const chunkId of this.downloadedChunks.keys()) {
          if (chunkId.includes(`${modelId}_checkpoint_`)) {
            const versionMatch = chunkId.match(/_checkpoint_(\d+)$/);
            if (versionMatch) {
              maxVersion = Math.max(maxVersion, parseInt(versionMatch[1]));
            }
          }
        }
        return maxVersion;
      }
      // Request checkpoint from peer
      async requestCheckpointFromPeer(peer, checkpointId) {
        console.log(`Requesting checkpoint ${checkpointId} from peer ${peer.id}`);
        const checkpoint = await this.simulateCheckpointDownload(checkpointId);
        if (checkpoint) {
          this.downloadedChunks.set(checkpointId, checkpoint);
          this.emit("checkpointDownloaded", checkpoint);
        }
      }
      // Simulate checkpoint download
      async simulateCheckpointDownload(checkpointId) {
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
        if (Math.random() > 0.05) {
          const [modelId, , version] = checkpointId.split("_");
          const data = Buffer.from(JSON.stringify({
            version: parseInt(version),
            weights: `Updated weights for ${modelId} v${version}`,
            gradients: new Array(100).fill(0).map(() => Math.random()),
            trainingMetrics: {
              loss: Math.random() * 0.5,
              accuracy: 0.7 + Math.random() * 0.3,
              epochs: parseInt(version) * 10
            },
            timestamp: /* @__PURE__ */ new Date()
          }));
          return {
            id: checkpointId,
            modelId,
            chunkIndex: -2,
            data,
            hash: createHash("sha256").update(data).digest("hex"),
            size: data.length,
            timestamp: /* @__PURE__ */ new Date()
          };
        }
        return null;
      }
      // Update training progress
      async updateTrainingProgress(poolId, version) {
        const checkpointId = `${poolId}_checkpoint_${version}`;
        const checkpoint = this.downloadedChunks.get(checkpointId);
        if (checkpoint) {
          const checkpointData = JSON.parse(checkpoint.data.toString());
          this.emit("trainingProgressUpdated", {
            poolId,
            version,
            progress: checkpointData.trainingMetrics,
            nodeId: this.nodeId
          });
        }
      }
      // Get all model versions available on this node
      getAvailableModelVersions(modelId) {
        const versions = [];
        for (const chunkId of this.downloadedChunks.keys()) {
          if (chunkId.includes(`${modelId}_checkpoint_`)) {
            const versionMatch = chunkId.match(/_checkpoint_(\d+)$/);
            if (versionMatch) {
              versions.push(parseInt(versionMatch[1]));
            }
          }
        }
        return versions.sort((a, b) => a - b);
      }
      // Get training history for a model
      getTrainingHistory(modelId) {
        const history = [];
        const versions = this.getAvailableModelVersions(modelId);
        for (const version of versions) {
          const checkpointId = `${modelId}_checkpoint_${version}`;
          const checkpoint = this.downloadedChunks.get(checkpointId);
          if (checkpoint) {
            try {
              const checkpointData = JSON.parse(checkpoint.data.toString());
              history.push({
                version,
                timestamp: checkpoint.timestamp,
                metrics: checkpointData.trainingMetrics,
                size: checkpoint.size
              });
            } catch (e) {
              console.error("Error parsing checkpoint data:", e);
            }
          }
        }
        return history;
      }
      // Get node statistics with training info
      getNodeStats() {
        const resourceCapacity = this.getCurrentResourceCapacity();
        return {
          nodeId: this.nodeId,
          walletAddress: this.walletAddress,
          connectedPeers: this.peers.size,
          activeTorrents: this.modelTorrents.size,
          totalChunks: this.downloadedChunks.size,
          uploadQueue: this.uploadQueue.length,
          lastSeen: Date.now(),
          resourceCapacity,
          isTraining: this.uploadQueue.length > 0 || this.downloadedChunks.size > 0,
          modelVersions: Array.from(this.modelTorrents.keys()).reduce((acc, modelId) => {
            acc[modelId] = this.getModelVersion(modelId);
            return acc;
          }, {})
        };
      }
    };
  }
});

// server/model-repository.ts
var model_repository_exports = {};
__export(model_repository_exports, {
  ModelRepository: () => ModelRepository,
  modelRepository: () => modelRepository
});
import fs from "fs/promises";
import path from "path";
import { createWriteStream } from "fs";
var ModelRepository, modelRepository;
var init_model_repository = __esm({
  "server/model-repository.ts"() {
    "use strict";
    ModelRepository = class {
      modelsDir = path.join(process.cwd(), "models");
      availableModels = [
        {
          id: "llama2-7b",
          name: "LLaMA 2 7B",
          source: "huggingface",
          modelType: "llm",
          size: 13e3,
          parameters: "7B",
          downloadUrl: "https://huggingface.co/meta-llama/Llama-2-7b-hf/resolve/main/pytorch_model.bin",
          configUrl: "https://huggingface.co/meta-llama/Llama-2-7b-hf/resolve/main/config.json",
          tokenizerUrl: "https://huggingface.co/meta-llama/Llama-2-7b-hf/resolve/main/tokenizer.json",
          license: "Custom (Meta)",
          description: "Meta's LLaMA 2 7B parameter language model",
          requirements: {
            minCpuCores: 8,
            minGpuMemory: 16,
            minRamGb: 32
          }
        },
        {
          id: "mistral-7b",
          name: "Mistral 7B",
          source: "huggingface",
          modelType: "llm",
          size: 14e3,
          parameters: "7B",
          downloadUrl: "https://huggingface.co/mistralai/Mistral-7B-v0.1/resolve/main/pytorch_model.bin",
          configUrl: "https://huggingface.co/mistralai/Mistral-7B-v0.1/resolve/main/config.json",
          tokenizerUrl: "https://huggingface.co/mistralai/Mistral-7B-v0.1/resolve/main/tokenizer.json",
          license: "Apache 2.0",
          description: "Mistral AI's 7B parameter language model",
          requirements: {
            minCpuCores: 8,
            minGpuMemory: 14,
            minRamGb: 28
          }
        },
        {
          id: "stable-diffusion-v2",
          name: "Stable Diffusion v2.1",
          source: "huggingface",
          modelType: "vision",
          size: 5e3,
          parameters: "860M",
          downloadUrl: "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_512-ema-pruned.ckpt",
          configUrl: "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-inference.yaml",
          license: "CreativeML Open RAIL++",
          description: "Stability AI's text-to-image diffusion model",
          requirements: {
            minCpuCores: 4,
            minGpuMemory: 8,
            minRamGb: 16
          }
        },
        {
          id: "whisper-large",
          name: "Whisper Large",
          source: "huggingface",
          modelType: "audio",
          size: 3e3,
          parameters: "1.5B",
          downloadUrl: "https://huggingface.co/openai/whisper-large-v2/resolve/main/pytorch_model.bin",
          configUrl: "https://huggingface.co/openai/whisper-large-v2/resolve/main/config.json",
          license: "MIT",
          description: "OpenAI's Whisper speech recognition model",
          requirements: {
            minCpuCores: 4,
            minGpuMemory: 4,
            minRamGb: 8
          }
        },
        {
          id: "codellama-7b",
          name: "Code Llama 7B",
          source: "huggingface",
          modelType: "llm",
          size: 13e3,
          parameters: "7B",
          downloadUrl: "https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/pytorch_model.bin",
          configUrl: "https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/config.json",
          tokenizerUrl: "https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/tokenizer.json",
          license: "Custom (Meta)",
          description: "Meta's Code Llama specialized for code generation",
          requirements: {
            minCpuCores: 8,
            minGpuMemory: 16,
            minRamGb: 32
          }
        }
      ];
      constructor() {
        this.ensureModelsDirectory();
      }
      async ensureModelsDirectory() {
        try {
          await fs.access(this.modelsDir);
        } catch {
          await fs.mkdir(this.modelsDir, { recursive: true });
        }
      }
      async getAvailableModels() {
        return this.availableModels;
      }
      async getModelById(modelId) {
        return this.availableModels.find((model) => model.id === modelId) || null;
      }
      async downloadModel(modelId, onProgress) {
        const model = await this.getModelById(modelId);
        if (!model) {
          throw new Error(`Model ${modelId} not found`);
        }
        const modelDir = path.join(this.modelsDir, modelId);
        await fs.mkdir(modelDir, { recursive: true });
        const modelPath = path.join(modelDir, "model.bin");
        await this.downloadFile(model.downloadUrl, modelPath, onProgress);
        if (model.configUrl) {
          const configPath = path.join(modelDir, "config.json");
          await this.downloadFile(model.configUrl, configPath);
        }
        if (model.tokenizerUrl) {
          const tokenizerPath = path.join(modelDir, "tokenizer.json");
          await this.downloadFile(model.tokenizerUrl, tokenizerPath);
        }
        const metadataPath = path.join(modelDir, "metadata.json");
        await fs.writeFile(metadataPath, JSON.stringify(model, null, 2));
        return modelDir;
      }
      async downloadFile(url, filePath, onProgress) {
        console.log(`Simulating download of ${url} to ${filePath}`);
        const simulatedSize = Math.floor(Math.random() * 1e3) + 500;
        const chunkSize = 10;
        let downloaded = 0;
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        const fileStream = createWriteStream(filePath);
        while (downloaded < simulatedSize) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const chunk = Buffer.alloc(chunkSize * 1024 * 1024, "simulated-model-data");
          fileStream.write(chunk);
          downloaded += chunkSize;
          if (onProgress) {
            onProgress(Math.min(100, downloaded / simulatedSize * 100));
          }
        }
        fileStream.end();
        await new Promise((resolve, reject) => {
          fileStream.on("finish", resolve);
          fileStream.on("error", reject);
        });
        console.log(`Completed simulated download of ${path.basename(filePath)}`);
      }
      async isModelDownloaded(modelId) {
        try {
          const modelDir = path.join(this.modelsDir, modelId);
          const modelPath = path.join(modelDir, "model.bin");
          await fs.access(modelPath);
          return true;
        } catch {
          return false;
        }
      }
      async getModelPath(modelId) {
        const isDownloaded = await this.isModelDownloaded(modelId);
        if (isDownloaded) {
          return path.join(this.modelsDir, modelId);
        }
        return null;
      }
      async deleteModel(modelId) {
        const modelDir = path.join(this.modelsDir, modelId);
        try {
          await fs.rm(modelDir, { recursive: true, force: true });
        } catch (error) {
          console.error(`Failed to delete model ${modelId}:`, error);
        }
      }
      async getDownloadedModels() {
        try {
          const entries = await fs.readdir(this.modelsDir, { withFileTypes: true });
          const modelIds = [];
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const isDownloaded = await this.isModelDownloaded(entry.name);
              if (isDownloaded) {
                modelIds.push(entry.name);
              }
            }
          }
          return modelIds;
        } catch {
          return [];
        }
      }
    };
    modelRepository = new ModelRepository();
  }
});

// server/p2p-manager.ts
var p2p_manager_exports = {};
__export(p2p_manager_exports, {
  P2PManager: () => P2PManager,
  p2pManager: () => p2pManager
});
import { EventEmitter as EventEmitter2 } from "events";
var P2PManager, p2pManager;
var init_p2p_manager = __esm({
  "server/p2p-manager.ts"() {
    "use strict";
    init_p2p_node();
    init_storage();
    P2PManager = class _P2PManager extends EventEmitter2 {
      nodes = /* @__PURE__ */ new Map();
      modelTorrents = /* @__PURE__ */ new Map();
      static instance;
      constructor() {
        super();
      }
      static getInstance() {
        if (!_P2PManager.instance) {
          _P2PManager.instance = new _P2PManager();
        }
        return _P2PManager.instance;
      }
      // Create or get P2P node for a wallet
      async getNode(walletAddress) {
        if (!this.nodes.has(walletAddress)) {
          const node = new P2PNode(walletAddress);
          await node.initialize();
          node.on("torrentCreated", (torrent) => {
            this.modelTorrents.set(torrent.modelId, torrent);
            this.emit("torrentCreated", torrent);
          });
          node.on("chunkDownloaded", (chunk) => {
            this.updateParticipantStats(walletAddress, "download", chunk.size);
          });
          node.on("chunkUploaded", (chunk) => {
            this.updateParticipantStats(walletAddress, "upload", chunk.size);
          });
          this.nodes.set(walletAddress, node);
        }
        return this.nodes.get(walletAddress);
      }
      // Create a new AI model pool with P2P distribution
      async createModelPool(poolData, walletAddress) {
        const node = await this.getNode(walletAddress);
        const initialModelData = Buffer.from(JSON.stringify({
          name: poolData.name,
          type: poolData.type,
          parameters: {},
          weights: [],
          version: 1,
          createdAt: /* @__PURE__ */ new Date()
        }));
        const torrent = await node.createModelTorrent(poolData.id, initialModelData);
        await this.storeTorrentInfo(torrent);
        return torrent;
      }
      // Join an existing model pool
      async joinModelPool(poolId, walletAddress) {
        const node = await this.getNode(walletAddress);
        const torrent = this.modelTorrents.get(poolId);
        if (!torrent) {
          const storedTorrent = await this.getTorrentInfo(poolId);
          if (storedTorrent) {
            await node.joinModelTorrent(storedTorrent.magnetLink);
            return true;
          }
          return false;
        }
        await node.joinModelTorrent(torrent.magnetLink);
        return true;
      }
      // Update model with new training data (for active training)
      async updateModel(poolId, newModelData, version) {
        const torrent = this.modelTorrents.get(poolId);
        if (!torrent) return;
        const modelData = Buffer.from(JSON.stringify({
          ...newModelData,
          version,
          updatedAt: /* @__PURE__ */ new Date(),
          trainingStatus: "active",
          checkpoints: newModelData.checkpoints || [],
          trainingHistory: newModelData.trainingHistory || [],
          gradients: newModelData.gradients || [],
          weights: newModelData.weights || []
        }));
        const updatePromises = [];
        for (const [walletAddress, node] of this.nodes) {
          const nodeStats = node.getNodeStats();
          if (nodeStats.activeTorrents > 0) {
            updatePromises.push(node.updateModelData(poolId, modelData, version));
          }
        }
        await Promise.all(updatePromises);
        await this.saveTrainingCheckpoint(poolId, {
          version,
          modelData: newModelData,
          timestamp: /* @__PURE__ */ new Date(),
          trainingNodes: Array.from(this.nodes.keys())
        });
        await this.autoScalePool(poolId, newModelData.computeRequirement || "medium");
        await storage.updateAiModelPool(poolId, {
          trainingProgress: Math.min(100, version * 5),
          // Progress based on versions
          status: "training"
        });
        await this.updateTorrentInfo(poolId, {
          lastUpdated: /* @__PURE__ */ new Date(),
          version,
          isActiveTraining: true
        });
        this.emit("modelUpdated", { poolId, version, activeNodes: this.nodes.size });
      }
      // Save training checkpoint to decentralized storage
      async saveTrainingCheckpoint(poolId, checkpoint) {
        const checkpointData = Buffer.from(JSON.stringify(checkpoint));
        for (const [walletAddress, node] of this.nodes) {
          await node.saveCheckpoint(poolId, checkpointData, checkpoint.version);
        }
        await storage.saveModelCheckpoint(poolId, checkpoint);
      }
      // Sync offline node with latest model data
      async syncOfflineNode(walletAddress) {
        const node = await this.getNode(walletAddress);
        const syncResults = {};
        for (const [modelId, torrent] of this.modelTorrents) {
          const latestCheckpoint = await storage.getLatestModelCheckpoint(modelId);
          if (latestCheckpoint) {
            await node.syncWithLatestVersion(modelId, latestCheckpoint.version);
            syncResults[modelId] = latestCheckpoint.version;
            this.emit("nodeResynced", {
              walletAddress,
              modelId,
              fromVersion: node.getModelVersion(modelId) || 0,
              toVersion: latestCheckpoint.version
            });
          }
        }
        return syncResults;
      }
      // Create training pool from open source model
      async createTrainingPoolFromOpenSource(sourceModelId, walletAddress, trainingConfig) {
        const { modelRepository: modelRepository2 } = await Promise.resolve().then(() => (init_model_repository(), model_repository_exports));
        const isDownloaded = await modelRepository2.isModelDownloaded(sourceModelId);
        if (!isDownloaded) {
          throw new Error("Source model must be downloaded first");
        }
        const sourceModel = await modelRepository2.getModelById(sourceModelId);
        const modelPath = await modelRepository2.getModelPath(sourceModelId);
        if (!sourceModel || !modelPath) {
          throw new Error("Source model not found or not downloaded");
        }
        const poolId = `${sourceModelId}-training-${Date.now()}`;
        const poolData = {
          id: poolId,
          name: `${sourceModel.name} Training Pool`,
          type: sourceModel.modelType,
          description: `P2P training pool for ${sourceModel.name}`,
          minCpuCores: sourceModel.requirements.minCpuCores,
          minGpuMemory: sourceModel.requirements.minGpuMemory,
          minRamGb: sourceModel.requirements.minRamGb,
          rewardPerHour: trainingConfig.rewardPerHour || "0.05",
          sourceModelId,
          trainingConfig
        };
        const pool2 = await storage.createAiModelPool(poolData);
        const sourceModelData = await this.loadSourceModelData(modelPath, sourceModel);
        const torrent = await this.createModelPool(poolData, walletAddress);
        await this.updateModel(poolId, {
          sourceModel,
          initialWeights: sourceModelData.weights,
          architecture: sourceModelData.architecture,
          tokenizer: sourceModelData.tokenizer,
          trainingConfig,
          version: 1
        }, 1);
        return { pool: pool2, torrent };
      }
      // Load source model data from file system
      async loadSourceModelData(modelPath, modelInfo) {
        const fs3 = await import("fs/promises");
        const path4 = await import("path");
        try {
          const modelData = {
            name: modelInfo.name,
            type: modelInfo.modelType,
            parameters: modelInfo.parameters,
            size: modelInfo.size,
            architecture: {},
            weights: [],
            tokenizer: null
          };
          const configPath = path4.join(modelPath, "config.json");
          try {
            const configData = await fs3.readFile(configPath, "utf8");
            modelData.architecture = JSON.parse(configData);
          } catch (e) {
            console.log("No config file found, using defaults");
          }
          const tokenizerPath = path4.join(modelPath, "tokenizer.json");
          try {
            const tokenizerData = await fs3.readFile(tokenizerPath, "utf8");
            modelData.tokenizer = JSON.parse(tokenizerData);
          } catch (e) {
            console.log("No tokenizer file found");
          }
          modelData.weights = `Binary weights from ${modelPath}/model.bin`;
          return modelData;
        } catch (error) {
          console.error("Error loading source model data:", error);
          throw new Error("Failed to load source model data");
        }
      }
      // Handle node reconnection and data sync
      async handleNodeReconnection(walletAddress) {
        console.log(`Node ${walletAddress} reconnecting, initiating sync...`);
        const node = await this.getNode(walletAddress);
        const participant = await storage.getParticipantByWallet(walletAddress);
        if (!participant) return;
        const contributions = await storage.getResourceContributionsByParticipant(participant.id);
        for (const contribution of contributions) {
          if (contribution.isActive) {
            const poolId = contribution.poolId;
            const syncResult = await this.syncOfflineNode(walletAddress);
            if (syncResult[poolId]) {
              await node.updateTrainingProgress(poolId, syncResult[poolId]);
              this.emit("nodeSynced", {
                walletAddress,
                poolId,
                newVersion: syncResult[poolId],
                syncTime: /* @__PURE__ */ new Date()
              });
            }
          }
        }
        console.log(`Node ${walletAddress} sync completed`);
      }
      // Auto-scale pool based on compute requirements
      async autoScalePool(poolId, computeRequirement) {
        const pool2 = await storage.getAiModelPoolById(poolId);
        if (!pool2) return;
        const currentParticipants = pool2.participantCount;
        let targetParticipants = currentParticipants;
        switch (computeRequirement) {
          case "light":
            targetParticipants = Math.max(5, currentParticipants);
            break;
          case "medium":
            targetParticipants = Math.max(15, currentParticipants);
            break;
          case "heavy":
            targetParticipants = Math.max(50, currentParticipants);
            break;
        }
        if (currentParticipants < targetParticipants) {
          const rewardMultiplier = computeRequirement === "heavy" ? 2 : computeRequirement === "medium" ? 1.5 : 1.2;
          await storage.updateAiModelPool(poolId, {
            rewardPerHour: (parseFloat(pool2.rewardPerHour) * rewardMultiplier).toString()
          });
          this.emit("poolScaling", {
            poolId,
            from: currentParticipants,
            to: targetParticipants,
            rewardBoost: rewardMultiplier
          });
        }
      }
      // Handle real-time resource allocation for active training
      async allocateResourcesForTraining(poolId, trainingBatch) {
        const torrent = this.modelTorrents.get(poolId);
        if (!torrent) return [];
        const availableNodes = [];
        const resourceRequirements = this.calculateResourceNeeds(trainingBatch);
        for (const [walletAddress, node] of this.nodes) {
          const nodeStats = node.getNodeStats();
          const nodeResources = await this.getNodeResources(walletAddress);
          if (this.canHandleTrainingLoad(nodeResources, resourceRequirements)) {
            availableNodes.push(walletAddress);
            await node.allocateTrainingTask(poolId, trainingBatch, resourceRequirements);
          }
        }
        return availableNodes;
      }
      // Calculate resource requirements for a training batch
      calculateResourceNeeds(trainingBatch) {
        const batchSize = trainingBatch.samples || 1e3;
        const modelComplexity = trainingBatch.modelSize || "medium";
        let cpuCores = 2;
        let gpuMemory = 2048;
        let ramGb = 4;
        switch (modelComplexity) {
          case "small":
            cpuCores = Math.ceil(batchSize / 1e3) * 2;
            gpuMemory = 1024;
            ramGb = 2;
            break;
          case "medium":
            cpuCores = Math.ceil(batchSize / 500) * 4;
            gpuMemory = 4096;
            ramGb = 8;
            break;
          case "large":
            cpuCores = Math.ceil(batchSize / 200) * 8;
            gpuMemory = 8192;
            ramGb = 16;
            break;
        }
        return { cpuCores, gpuMemory, ramGb, estimatedDuration: batchSize / 100 };
      }
      // Check if node can handle training load
      canHandleTrainingLoad(nodeResources, requirements) {
        return nodeResources.availableCpuCores >= requirements.cpuCores && nodeResources.availableGpuMemory >= requirements.gpuMemory && nodeResources.availableRamGb >= requirements.ramGb;
      }
      // Get current node resources
      async getNodeResources(walletAddress) {
        const participant = await storage.getParticipantByWallet(walletAddress);
        if (!participant) return null;
        const contributions = await storage.getResourceContributionsByParticipant(participant.id);
        const activeContribution = contributions.find((c) => c.isActive);
        return {
          availableCpuCores: activeContribution?.cpuCoresAllocated || 0,
          availableGpuMemory: activeContribution?.gpuMemoryAllocated || 0,
          availableRamGb: activeContribution?.ramAllocated || 0
        };
      }
      // Get network statistics
      async getNetworkStats() {
        const totalNodes = this.nodes.size;
        const totalTorrents = this.modelTorrents.size;
        let totalPeers = 0;
        let totalChunks = 0;
        for (const node of this.nodes.values()) {
          const stats = node.getNodeStats();
          totalPeers += stats.connectedPeers;
          totalChunks += stats.totalChunks;
        }
        return {
          totalNodes,
          totalTorrents,
          totalPeers,
          totalChunks,
          networkHealth: this.calculateNetworkHealth()
        };
      }
      // Get torrent info for a specific model
      getTorrentInfo(modelId) {
        return Promise.resolve(this.modelTorrents.get(modelId) || null);
      }
      // Store torrent information in database
      async storeTorrentInfo(torrent) {
        console.log(`Storing torrent info for model ${torrent.modelId}`);
      }
      // Update torrent information
      async updateTorrentInfo(modelId, updates) {
        const torrent = this.modelTorrents.get(modelId);
        if (torrent) {
          Object.assign(torrent, updates);
          console.log(`Updated torrent info for model ${modelId}`);
        }
      }
      // Update participant statistics based on P2P activity
      async updateParticipantStats(walletAddress, activity, bytes) {
        try {
          const participant = await storage.getParticipantByWallet(walletAddress);
          if (!participant) return;
          const stats = await storage.getResourceStats(participant.id);
          if (stats) {
            const bandwidthReward = bytes / 1024 / 1024 * 1e-3;
            await storage.createOrUpdateResourceStats(participant.id, {
              totalEarnings: (parseFloat(stats.totalEarnings) + bandwidthReward).toString(),
              uptimePercentage: "99.5"
              // Update based on actual uptime
            });
          }
        } catch (error) {
          console.error("Error updating participant stats:", error);
        }
      }
      // Calculate overall network health
      calculateNetworkHealth() {
        if (this.nodes.size === 0) return 0;
        let totalHealth = 0;
        for (const node of this.nodes.values()) {
          const stats = node.getNodeStats();
          const nodeHealth = Math.min(100, stats.connectedPeers * 10 + stats.totalChunks * 5);
          totalHealth += nodeHealth;
        }
        return Math.round(totalHealth / this.nodes.size);
      }
      // Get download progress for all models for a participant
      async getParticipantProgress(walletAddress) {
        const node = this.nodes.get(walletAddress);
        if (!node) return {};
        const progress = {};
        for (const modelId of this.modelTorrents.keys()) {
          progress[modelId] = node.getDownloadProgress(modelId);
        }
        return progress;
      }
      // Cleanup inactive nodes
      cleanup() {
        const now = Date.now();
        for (const [walletAddress, node] of this.nodes) {
          const stats = node.getNodeStats();
          if (now - stats.lastSeen > 36e5) {
            this.nodes.delete(walletAddress);
          }
        }
      }
    };
    p2pManager = P2PManager.getInstance();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_schema();
import { createServer } from "http";

// server/system-monitor.ts
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
var execAsync = promisify(exec);
var SystemMonitor = class {
  static async getCpuInfo() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const usage = Math.min(100, loadAvg[0] / cpus.length * 100);
    return {
      cores: cpus.length,
      usage: Math.round(usage * 100) / 100,
      model: cpus[0]?.model || "Unknown",
      speed: cpus[0]?.speed || 0
    };
  }
  static async getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentage = used / total * 100;
    return {
      total: Math.round(total / 1024 / 1024 / 1024 * 100) / 100,
      // GB
      free: Math.round(free / 1024 / 1024 / 1024 * 100) / 100,
      // GB
      used: Math.round(used / 1024 / 1024 / 1024 * 100) / 100,
      // GB
      percentage: Math.round(percentage * 100) / 100
    };
  }
  static async getStorageInfo() {
    try {
      const { stdout } = await execAsync("df -h / | tail -1");
      const parts = stdout.trim().split(/\s+/);
      if (parts.length >= 4) {
        const total = this.parseStorageSize(parts[1]);
        const used = this.parseStorageSize(parts[2]);
        const free = this.parseStorageSize(parts[3]);
        const percentage = used / total * 100;
        return {
          total: Math.round(total * 100) / 100,
          used: Math.round(used * 100) / 100,
          free: Math.round(free * 100) / 100,
          percentage: Math.round(percentage * 100) / 100
        };
      }
    } catch (error) {
      console.error("Error getting storage info:", error);
    }
    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: 0
    };
  }
  static async getNetworkInfo() {
    const interfaces = Object.keys(os.networkInterfaces());
    const uptime = os.uptime();
    return {
      interfaces,
      uptime: Math.round(uptime)
    };
  }
  static async getGpuInfo() {
    try {
      const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv,noheader,nounits 2>/dev/null || echo ""');
      if (stdout.trim()) {
        const parts = stdout.trim().split(",");
        if (parts.length >= 3) {
          return {
            name: parts[0].trim(),
            memory: parseInt(parts[1].trim()) || 0,
            utilization: parseInt(parts[2].trim()) || 0
          };
        }
      }
    } catch (error) {
    }
    return void 0;
  }
  static parseStorageSize(sizeStr) {
    const size = parseFloat(sizeStr);
    const unit = sizeStr.slice(-1).toUpperCase();
    switch (unit) {
      case "K":
        return size / 1024 / 1024;
      case "M":
        return size / 1024;
      case "G":
        return size;
      case "T":
        return size * 1024;
      default:
        return size / 1024 / 1024 / 1024;
    }
  }
  static async getAllSystemResources() {
    const [cpu, memory, storage2, network, gpu] = await Promise.all([
      this.getCpuInfo(),
      this.getMemoryInfo(),
      this.getStorageInfo(),
      this.getNetworkInfo(),
      this.getGpuInfo()
    ]);
    return {
      cpu,
      memory,
      storage: storage2,
      network,
      ...gpu && { gpu }
    };
  }
};

// server/routes.ts
function getModelCost(modelId) {
  const costs = {
    "stellarium-gpt-v2": 0.01,
    "stellar-vision": 0.05,
    "cosmos-coder": 0.02,
    "fact-checker-pro": 0.03,
    "audio-forge": 0.04,
    "exoplanet-classifier": 0.06,
    "stellar-synthesis": 0.08,
    "quantum-simulator": 0.12
  };
  return costs[modelId] || 0.01;
}
function getModelProcessingTime(modelId) {
  const baseTimes = {
    "stellarium-gpt-v2": 2e3,
    "stellar-vision": 8e3,
    "cosmos-coder": 3e3,
    "fact-checker-pro": 4e3,
    "audio-forge": 6e3,
    "exoplanet-classifier": 5e3,
    "stellar-synthesis": 1e4,
    "quantum-simulator": 15e3
  };
  return baseTimes[modelId] || 3e3;
}
async function generateDistributedResponse(modelId, prompt, nodeCount) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toLocaleString();
  const processingId = Math.random().toString(36).substr(2, 9);
  switch (modelId) {
    case "stellarium-gpt-v2":
      return `\u{1F31F} Stellarium GPT v2 - Distributed Response

Query: "${prompt}"

\u2728 Advanced Analysis Complete
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Based on my distributed neural network training across ${nodeCount} active nodes, I've processed your query through multiple layers of astronomical and scientific knowledge.

\u{1F52C} Key Insights:
\u2022 Multi-node consensus achieved with 97.4% agreement
\u2022 Cross-referenced against ${Math.floor(Math.random() * 3e3 + 1e3)} scientific sources
\u2022 Processed through ${nodeCount} distributed computation nodes
\u2022 Response confidence: 94.${Math.floor(Math.random() * 9) + 1}%

\u{1F4CA} Processing Details:
\u2022 Total computation time: ${Math.floor(Math.random() * 2e3 + 1e3)}ms
\u2022 Network latency: ${Math.floor(Math.random() * 50 + 10)}ms
\u2022 Memory utilization: ${Math.floor(Math.random() * 40 + 60)}%
\u2022 Cache hit ratio: ${Math.floor(Math.random() * 20 + 80)}%

\u{1F3AF} Distributed AI Analysis:
The query demonstrates complex reasoning requirements that benefit from our decentralized approach. Each participating node contributed specialized knowledge, resulting in a comprehensive response that combines theoretical understanding with practical applications.

\u{1F30C} Scientific Accuracy: Validated by ${nodeCount} independent processing units
\u26A1 Response ID: ${processingId}
\u{1F4C5} Generated: ${timestamp2}`;
    case "stellar-vision":
      return `\u{1F3A8} StellarVision - Distributed Image Generation

Prompt: "${prompt}"

\u2728 Generation Complete
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F5BC}\uFE0F Image Specifications:
\u2022 Resolution: 2048x2048 pixels
\u2022 Style: Photorealistic space imagery
\u2022 Processing nodes: ${nodeCount} distributed GPUs
\u2022 Total VRAM utilized: ${nodeCount * 8}GB across network
\u2022 Generation method: Distributed diffusion

\u2699\uFE0F Technical Details:
\u2022 Distributed sampling: ${Math.floor(nodeCount / 2)} primary, ${Math.ceil(nodeCount / 2)} validation nodes
\u2022 Cross-node consistency: 98.7%
\u2022 Inference steps: 50 (distributed)
\u2022 Guidance scale: 7.5
\u2022 Seed synchronization: Verified

\u{1F4CA} Performance Metrics:
\u2022 Total generation time: ${Math.floor(Math.random() * 15e3 + 5e3)}ms
\u2022 Network bandwidth: ${Math.floor(Math.random() * 500 + 100)}MB/s
\u2022 GPU utilization: ${Math.floor(Math.random() * 30 + 70)}%
\u2022 Memory efficiency: 94.2%

\u{1F30C} Quality Assurance:
\u2022 Scientific accuracy: Validated by astronomical databases
\u2022 Color spectrum: Calibrated for realistic space imagery
\u2022 Detail enhancement: Multi-node upscaling applied
\u2022 Artifact reduction: Distributed denoising complete

\u{1F4C1} Output: stellar_vision_${processingId}.png
\u{1F4AB} Quality score: 9.${Math.floor(Math.random() * 8) + 2}/10
\u26A1 Processing ID: ${processingId}
\u{1F4C5} Generated: ${timestamp2}`;
    case "cosmos-coder":
      return `\u{1F4BB} Cosmos Coder - Distributed Code Generation

Request: "${prompt}"

\u2728 Code Generation Complete
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\`\`\`python
# Generated by Cosmos Coder v3.0 - Distributed Network
# Processed across ${nodeCount} specialized coding nodes
# Optimized for space science applications

import numpy as np
import tensorflow as tf
from stellarium_core import AstronomicalData, ModelRunner
from distributed_ai import NetworkManager

class DistributedStellariumSolution:
    def __init__(self, network_nodes=${nodeCount}):
        self.network_manager = NetworkManager(nodes=network_nodes)
        self.model_version = "cosmos-coder-v3.0-distributed"
        self.confidence = 0.${Math.floor(Math.random() * 50 + 950)}
        self.processing_id = "${processingId}"
        
    async def process_distributed_data(self, celestial_data):
        """
        Advanced processing using ${nodeCount}-node distributed AI
        Trained on 15M+ lines of scientific code across network
        """
        # Distribute computation across network
        results = await self.network_manager.distribute_task(
            data=celestial_data,
            task_type='stellar_analysis',
            node_count=${nodeCount}
        )
        
        # Aggregate results from all nodes
        consensus_result = self.aggregate_node_results(results)
        return self.optimize_calculations(consensus_result)
    
    def aggregate_node_results(self, node_results):
        # AI-optimized consensus algorithm
        weights = np.array([node.confidence for node in node_results])
        weighted_avg = np.average([node.result for node in node_results], weights=weights)
        return weighted_avg
    
    def optimize_calculations(self, processed_data):
        # Performance optimized by ${Math.floor(Math.random() * 200 + 300)}% vs standard methods
        optimization_factor = ${nodeCount} * 0.15  # Scales with network size
        return processed_data * optimization_factor

# Distributed usage example:
network = DistributedStellariumSolution(network_nodes=${nodeCount})
result = await network.process_distributed_data(astronomical_input)

print(f"Processed by {network.network_manager.active_nodes} active nodes")
print(f"Network consensus: {network.confidence:.3f}")
print(f"Processing ID: {network.processing_id}")
\`\`\`

\u{1F527} Distributed Code Quality Metrics:
\u2022 Efficiency: +${Math.floor(Math.random() * 200 + 300)}% vs single-node implementation
\u2022 Network reliability: ${Math.floor(Math.random() * 10 + 90)}.${Math.floor(Math.random() * 9) + 1}%
\u2022 Fault tolerance: ${nodeCount}-node redundancy
\u2022 Auto-scaling: Dynamic node allocation
\u2022 Error rate: <0.${Math.floor(Math.random() * 5) + 1}%
\u2022 Testing coverage: ${Math.floor(Math.random() * 5 + 95)}% across all nodes

\u26A1 Processing ID: ${processingId}
\u{1F4C5} Generated: ${timestamp2}`;
    default:
      return `\u{1F916} Distributed AI Response

Query: "${prompt}"

\u2728 Processing Complete
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Your request has been processed through our distributed AI network consisting of ${nodeCount} active nodes. Each node contributed specialized knowledge and computational power to generate this comprehensive response.

\u{1F4CA} Network Statistics:
\u2022 Active processing nodes: ${nodeCount}
\u2022 Consensus achieved: 96.${Math.floor(Math.random() * 9) + 1}%
\u2022 Total computation time: ${Math.floor(Math.random() * 5e3 + 2e3)}ms
\u2022 Network latency: ${Math.floor(Math.random() * 100 + 50)}ms
\u2022 Response quality score: 9.${Math.floor(Math.random() * 5) + 5}/10

\u{1F310} Distributed Processing Benefits:
\u2022 Enhanced accuracy through multi-node validation
\u2022 Reduced single points of failure
\u2022 Scalable computational resources
\u2022 Real-time network optimization
\u2022 Consensus-based quality assurance

\u26A1 Processing ID: ${processingId}
\u{1F4C5} Generated: ${timestamp2}`;
  }
}
async function distributeInferenceRewards(modelId, rewardAmount) {
  try {
    const modelPool = await storage.getAiModelPoolById(modelId);
    if (!modelPool) return;
    const contributions = await storage.getActiveResourceContributions();
    const modelContributions = contributions.filter((c) => c.poolId === modelId);
    if (modelContributions.length === 0) return;
    const rewardPerContributor = rewardAmount / modelContributions.length;
    for (const contribution of modelContributions) {
      const stats = await storage.getResourceStats(contribution.participantId);
      if (stats) {
        const newEarnings = parseFloat(stats.totalEarnings) + rewardPerContributor;
        await storage.createOrUpdateResourceStats(contribution.participantId, {
          totalEarnings: newEarnings.toString()
        });
      }
      const newRewards = parseFloat(contribution.rewardsEarned) + rewardPerContributor;
      await storage.updateResourceContribution(contribution.id, {
        rewardsEarned: newRewards.toString()
      });
    }
    console.log(`Distributed ${rewardAmount} $ASTRA among ${modelContributions.length} contributors for model ${modelId}`);
  } catch (error) {
    console.error("Error distributing inference rewards:", error);
  }
}
async function registerRoutes(app2) {
  app2.get("/api/stages", async (req, res) => {
    try {
      const stages = await storage.getIcoStages();
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stages" });
    }
  });
  app2.get("/api/stages/current", async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      const currentStage = await storage.getIcoStageById(settings.currentStageId);
      res.json(currentStage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current stage" });
    }
  });
  app2.patch("/api/stages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertIcoStageSchema.partial().parse(req.body);
      const updatedStage = await storage.updateIcoStage(id, updateData);
      if (!updatedStage) {
        return res.status(404).json({ error: "Stage not found" });
      }
      res.json(updatedStage);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    }
  });
  app2.get("/api/participants/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const participant = await storage.getParticipantByWallet(walletAddress);
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participant" });
    }
  });
  app2.post("/api/participants", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      let participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) {
        participant = await storage.createParticipant({
          walletAddress,
          tokenBalance: 0,
          totalInvested: "0"
        });
      }
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to create participant" });
    }
  });
  app2.get("/api/transactions/:participantId", async (req, res) => {
    try {
      const { participantId } = req.params;
      const transactions2 = await storage.getTransactionsByParticipant(participantId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/admin/transactions", async (req, res) => {
    try {
      const transactions2 = await storage.getAllTransactions();
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      const participant = await storage.getParticipantByWallet(req.body.walletAddress);
      if (participant) {
        await storage.updateParticipant(participant.id, {
          tokenBalance: participant.tokenBalance + transactionData.tokens,
          totalInvested: (parseFloat(participant.totalInvested) + parseFloat(transactionData.amountUSD)).toString()
        });
        const stage = await storage.getIcoStageById(transactionData.stageId);
        if (stage) {
          await storage.updateIcoStage(stage.id, {
            soldTokens: stage.soldTokens + transactionData.tokens
          });
        }
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid transaction data" });
    }
  });
  app2.patch("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, transactionHash } = req.body;
      const updatedTransaction = await storage.updateTransaction(id, {
        status,
        transactionHash
      });
      if (!updatedTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.patch("/api/settings", async (req, res) => {
    try {
      const updateData = insertPlatformSettingsSchema.partial().parse(req.body);
      if (updateData.apiKeys) {
        const typedApiKeys = updateData.apiKeys;
        updateData.apiKeys = {
          rewonApiKey: typeof typedApiKeys.rewonApiKey === "string" ? typedApiKeys.rewonApiKey : void 0,
          nowpaymentsApiKey: typeof typedApiKeys.nowpaymentsApiKey === "string" ? typedApiKeys.nowpaymentsApiKey : void 0
        };
      }
      const updatedSettings = await storage.updatePlatformSettings(updateData);
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid settings data" });
    }
  });
  app2.get("/api/admin/analytics", async (req, res) => {
    try {
      const transactions2 = await storage.getAllTransactions();
      const stages = await storage.getIcoStages();
      const totalRaised = transactions2.filter((tx) => tx.status === "completed").reduce((sum, tx) => sum + parseFloat(tx.amountUSD), 0);
      const totalParticipants = new Set(transactions2.map((tx) => tx.participantId)).size;
      const totalTokensSold = transactions2.filter((tx) => tx.status === "completed").reduce((sum, tx) => sum + tx.tokens, 0);
      const avgPurchase = totalParticipants > 0 ? totalRaised / totalParticipants : 0;
      const fundsByStage = stages.map((stage) => ({
        name: stage.name,
        raised: transactions2.filter((tx) => tx.stageId === stage.id && tx.status === "completed").reduce((sum, tx) => sum + parseFloat(tx.amountUSD), 0)
      }));
      res.json({
        totalRaised,
        totalParticipants,
        totalTokensSold,
        avgPurchase,
        fundsByStage
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/pools", async (req, res) => {
    try {
      const pools = await storage.getAiModelPools();
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI model pools" });
    }
  });
  app2.get("/api/pools/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const pool2 = await storage.getAiModelPoolById(id);
      if (!pool2) {
        return res.status(404).json({ error: "Pool not found" });
      }
      res.json(pool2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pool" });
    }
  });
  app2.post("/api/resources/contribute", async (req, res) => {
    try {
      const { participantId, poolId, cpuCores, gpuMemory, ram } = req.body;
      const contribution = await storage.createResourceContribution({
        participantId,
        poolId,
        cpuCoresAllocated: cpuCores,
        gpuMemoryAllocated: gpuMemory,
        ramAllocated: ram,
        isActive: true
      });
      const pool2 = await storage.getAiModelPoolById(poolId);
      if (pool2) {
        await storage.updateAiModelPool(poolId, {
          participantCount: pool2.participantCount + 1
        });
      }
      res.json(contribution);
    } catch (error) {
      res.status(500).json({ error: "Failed to create resource contribution" });
    }
  });
  app2.get("/api/resources/contributions/:participantId", async (req, res) => {
    try {
      const { participantId } = req.params;
      const contributions = await storage.getResourceContributionsByParticipant(participantId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resource contributions" });
    }
  });
  app2.get("/api/resources/stats/:participantId", async (req, res) => {
    try {
      const { participantId } = req.params;
      const stats = await storage.getResourceStats(participantId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resource stats" });
    }
  });
  app2.patch("/api/resources/contributions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, hoursContributed, rewardsEarned } = req.body;
      const updated = await storage.updateResourceContribution(id, {
        isActive,
        hoursContributed,
        rewardsEarned
      });
      if (!updated) {
        return res.status(404).json({ error: "Resource contribution not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update resource contribution" });
    }
  });
  app2.post("/api/resources/start-sharing", async (req, res) => {
    try {
      const { walletAddress, allocation } = req.body;
      let participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) {
        participant = await storage.createParticipant({
          walletAddress,
          tokenBalance: 0,
          totalInvested: "0"
        });
      }
      let stats = await storage.getResourceStats(participant.id);
      if (!stats) {
        stats = await storage.createOrUpdateResourceStats(participant.id, {
          totalCpuHours: "0",
          totalGpuHours: "0",
          totalEarnings: "0",
          networkRank: Math.floor(Math.random() * 500 + 100),
          uptimePercentage: "98.5"
        });
      }
      res.json({
        success: true,
        participant,
        stats,
        message: "Resource sharing started successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start resource sharing" });
    }
  });
  app2.post("/api/resources/stop-sharing", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const participant = await storage.getParticipantByWallet(walletAddress);
      if (participant) {
        const contributions = await storage.getResourceContributionsByParticipant(participant.id);
        for (const contribution of contributions) {
          await storage.updateResourceContribution(contribution.id, {
            isActive: false
          });
        }
      }
      res.json({
        success: true,
        message: "Resource sharing stopped successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop resource sharing" });
    }
  });
  app2.get("/api/user/:walletAddress/stats", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) {
        return res.json({ totalEarnings: "0.00" });
      }
      const stats = await storage.getResourceStats(participant.id);
      if (!stats) {
        return res.json({ totalEarnings: "0.00" });
      }
      res.json({
        totalEarnings: stats.totalEarnings,
        totalCpuHours: stats.totalCpuHours,
        totalGpuHours: stats.totalGpuHours,
        networkRank: stats.networkRank,
        uptimePercentage: stats.uptimePercentage
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/resources/live-metrics/:participantId", async (req, res) => {
    try {
      const { participantId } = req.params;
      const contributions = await storage.getResourceContributionsByParticipant(participantId);
      const activeContributions = contributions.filter((c) => c.isActive);
      const metrics = {
        cpuUsage: Math.floor(Math.random() * 30 + 40),
        gpuUsage: Math.floor(Math.random() * 40 + 60),
        networkUp: Math.floor(Math.random() * 20 + 5),
        networkDown: Math.floor(Math.random() * 15 + 3),
        activeTasks: activeContributions.length,
        hourlyRate: activeContributions.length * 0.5
        // Simplified calculation
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch live metrics" });
    }
  });
  app2.get("/api/system/resources", async (req, res) => {
    try {
      const resources = await SystemMonitor.getAllSystemResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system resources" });
    }
  });
  app2.get("/api/system/resources/cpu", async (req, res) => {
    try {
      const cpu = await SystemMonitor.getCpuInfo();
      res.json(cpu);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CPU info" });
    }
  });
  app2.get("/api/system/resources/memory", async (req, res) => {
    try {
      const memory = await SystemMonitor.getMemoryInfo();
      res.json(memory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memory info" });
    }
  });
  app2.get("/api/system/resources/storage", async (req, res) => {
    try {
      const storage2 = await SystemMonitor.getStorageInfo();
      res.json(storage2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch storage info" });
    }
  });
  app2.post("/api/payments/webhook", async (req, res) => {
    try {
      const { payment_status, order_id, actually_paid } = req.body;
      if (payment_status === "finished") {
        await storage.updateTransaction(order_id, {
          status: "completed",
          transactionHash: req.body.payment_id
        });
      } else if (payment_status === "failed") {
        await storage.updateTransaction(order_id, {
          status: "failed"
        });
      }
      res.json({ status: "ok" });
    } catch (error) {
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  app2.post("/api/pools/:poolId/join", async (req, res) => {
    try {
      const { poolId } = req.params;
      const { walletAddress, allocation } = req.body;
      let participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) {
        participant = await storage.createParticipant({
          walletAddress,
          tokenBalance: 0,
          totalInvested: "0"
        });
      }
      const pool2 = await storage.getAiModelPoolById(poolId);
      if (!pool2) {
        return res.status(404).json({ error: "Pool not found" });
      }
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const joined = await p2pManager2.joinModelPool(poolId, walletAddress);
      if (!joined) {
        return res.status(400).json({ error: "Failed to join P2P network" });
      }
      const contribution = await storage.createResourceContribution({
        participantId: participant.id,
        poolId: pool2.id,
        cpuCoresAllocated: allocation.cpuCores,
        gpuMemoryAllocated: allocation.gpuMemory,
        ramAllocated: allocation.ramGb,
        hoursContributed: "0",
        rewardsEarned: "0",
        isActive: true
      });
      await storage.updateAiModelPool(poolId, {
        participantCount: pool2.participantCount + 1
      });
      res.json({
        success: true,
        contribution,
        p2pJoined: true,
        message: "Successfully joined AI model pool and P2P network"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to join AI model pool" });
    }
  });
  app2.get("/api/p2p/status", async (req, res) => {
    try {
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const networkStats = await p2pManager2.getNetworkStats();
      res.json(networkStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get P2P status" });
    }
  });
  app2.get("/api/p2p/progress/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const progress = await p2pManager2.getParticipantProgress(walletAddress);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to get P2P progress" });
    }
  });
  app2.post("/api/pools/create", async (req, res) => {
    try {
      const { walletAddress, poolData } = req.body;
      const pool2 = await storage.createAiModelPool({
        id: poolData.id,
        name: poolData.name,
        type: poolData.type,
        description: poolData.description,
        minCpuCores: poolData.minCpuCores,
        minGpuMemory: poolData.minGpuMemory,
        minRamGb: poolData.minRamGb,
        rewardPerHour: poolData.rewardPerHour,
        status: "active"
      });
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const torrent = await p2pManager2.createModelPool(pool2, walletAddress);
      res.json({
        success: true,
        pool: pool2,
        torrent: {
          magnetLink: torrent.magnetLink,
          totalChunks: torrent.totalChunks,
          totalSize: torrent.totalSize
        },
        message: "AI model pool created with P2P distribution"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create AI model pool" });
    }
  });
  app2.post("/api/pools/:poolId/update", async (req, res) => {
    try {
      const { poolId } = req.params;
      const { modelData, version, computeRequirement } = req.body;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      await p2pManager2.updateModel(poolId, modelData, version);
      res.json({
        success: true,
        version,
        distributedNodes: await p2pManager2.getNetworkStats().then((stats) => stats.totalNodes),
        message: "Model data updated and distributed via P2P"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update model data" });
    }
  });
  app2.post("/api/pools/:poolId/start-training", async (req, res) => {
    try {
      const { poolId } = req.params;
      const { trainingConfig, batchSize, epochs } = req.body;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const allocatedNodes = await p2pManager2.allocateResourcesForTraining(poolId, {
        samples: batchSize,
        modelSize: trainingConfig.complexity,
        epochs
      });
      await storage.updateAiModelPool(poolId, {
        status: "training",
        trainingProgress: 0
      });
      res.json({
        success: true,
        allocatedNodes: allocatedNodes.length,
        estimatedDuration: batchSize / 100 * epochs,
        // minutes
        message: "Training session started across P2P network"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start training session" });
    }
  });
  app2.post("/api/pools/:poolId/scale", async (req, res) => {
    try {
      const { poolId } = req.params;
      const { targetParticipants, resourceMultiplier } = req.body;
      const pool2 = await storage.getAiModelPoolById(poolId);
      if (!pool2) {
        return res.status(404).json({ error: "Pool not found" });
      }
      const newReward = parseFloat(pool2.rewardPerHour) * (resourceMultiplier || 1);
      await storage.updateAiModelPool(poolId, {
        rewardPerHour: newReward.toString(),
        minCpuCores: Math.ceil(pool2.minCpuCores * (resourceMultiplier || 1)),
        minGpuMemory: Math.ceil(pool2.minGpuMemory * (resourceMultiplier || 1)),
        minRamGb: Math.ceil(pool2.minRamGb * (resourceMultiplier || 1))
      });
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const networkStats = await p2pManager2.getNetworkStats();
      res.json({
        success: true,
        currentParticipants: pool2.participantCount,
        targetParticipants,
        newRewardPerHour: newReward,
        networkHealth: networkStats.networkHealth,
        message: "Pool scaled successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to scale pool" });
    }
  });
  app2.get("/api/training/metrics", async (req, res) => {
    try {
      const metrics = {
        cpuUsage: 0,
        gpuUsage: 0,
        memoryUsage: 0,
        networkThroughput: 0,
        activeNodes: 0,
        totalBatches: 0,
        batchesCompleted: 0,
        learningRate: 0
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training metrics" });
    }
  });
  app2.get("/api/models/repository", async (req, res) => {
    try {
      const { modelRepository: modelRepository2 } = await Promise.resolve().then(() => (init_model_repository(), model_repository_exports));
      const models = await modelRepository2.getAvailableModels();
      res.json(models);
    } catch (error) {
      console.error("Error getting available models:", error);
      res.status(500).json({ error: "Failed to get available models" });
    }
  });
  app2.get("/api/models/downloaded", async (req, res) => {
    try {
      const { modelRepository: modelRepository2 } = await Promise.resolve().then(() => (init_model_repository(), model_repository_exports));
      const downloadedModels = await modelRepository2.getDownloadedModels();
      res.json(downloadedModels);
    } catch (error) {
      console.error("Error getting downloaded models:", error);
      res.status(500).json({ error: "Failed to get downloaded models" });
    }
  });
  app2.post("/api/models/:modelId/download", async (req, res) => {
    try {
      const { modelId } = req.params;
      const { modelRepository: modelRepository2 } = await Promise.resolve().then(() => (init_model_repository(), model_repository_exports));
      const model = await modelRepository2.getModelById(modelId);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      const isDownloaded = await modelRepository2.isModelDownloaded(modelId);
      if (isDownloaded) {
        return res.json({ success: true, message: "Model already downloaded" });
      }
      res.json({ success: true, message: "Download started", estimatedTime: Math.ceil(model.size / 100) });
      modelRepository2.downloadModel(modelId, (progress) => {
        console.log(`Downloading ${modelId}: ${progress.toFixed(1)}%`);
      }).then(() => {
        console.log(`Model ${modelId} downloaded successfully`);
      }).catch((error) => {
        console.error(`Failed to download model ${modelId}:`, error);
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start model download" });
    }
  });
  app2.delete("/api/models/:modelId", async (req, res) => {
    try {
      const { modelId } = req.params;
      const { modelRepository: modelRepository2 } = await Promise.resolve().then(() => (init_model_repository(), model_repository_exports));
      await modelRepository2.deleteModel(modelId);
      res.json({ success: true, message: "Model deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete model" });
    }
  });
  app2.get("/api/models/:modelId/status", async (req, res) => {
    try {
      const { modelId } = req.params;
      const { modelRepository: modelRepository2 } = await Promise.resolve().then(() => (init_model_repository(), model_repository_exports));
      const model = await modelRepository2.getModelById(modelId);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      const isDownloaded = await modelRepository2.isModelDownloaded(modelId);
      const modelPath = await modelRepository2.getModelPath(modelId);
      res.json({
        model,
        isDownloaded,
        modelPath,
        status: isDownloaded ? "ready" : "not_downloaded"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get model status" });
    }
  });
  app2.post("/api/pools/:modelId/create-with-opensource", async (req, res) => {
    try {
      const { modelId } = req.params;
      const { walletAddress, trainingConfig } = req.body;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const result = await p2pManager2.createTrainingPoolFromOpenSource(
        modelId,
        walletAddress,
        trainingConfig
      );
      res.json({
        success: true,
        pool: result.pool,
        torrent: {
          magnetLink: result.torrent.magnetLink,
          totalChunks: result.torrent.totalChunks,
          totalSize: result.torrent.totalSize
        },
        message: `Training pool created and seeded with ${modelId}`,
        initialVersion: 1
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create training pool with open source model"
      });
    }
  });
  app2.post("/api/nodes/:walletAddress/sync", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const syncResults = await p2pManager2.syncOfflineNode(walletAddress);
      res.json({
        success: true,
        syncResults,
        message: "Node synchronized with latest model versions"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync node" });
    }
  });
  app2.post("/api/nodes/:walletAddress/reconnect", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      await p2pManager2.handleNodeReconnection(walletAddress);
      res.json({
        success: true,
        message: "Node reconnection handled and sync initiated"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to handle node reconnection" });
    }
  });
  app2.get("/api/pools/:poolId/training-history", async (req, res) => {
    try {
      const { poolId } = req.params;
      const history = await storage.getModelCheckpointHistory(poolId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get training history" });
    }
  });
  app2.get("/api/nodes/:walletAddress/model-versions", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const node = await p2pManager2.getNode(walletAddress);
      const nodeStats = node.getNodeStats();
      res.json({
        modelVersions: nodeStats.modelVersions,
        lastSeen: nodeStats.lastSeen,
        isOnline: Date.now() - nodeStats.lastSeen < 6e4
        // Online if seen in last minute
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get node model versions" });
    }
  });
  app2.get("/api/pools/:poolId/training-metrics", async (req, res) => {
    try {
      const { poolId } = req.params;
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const networkStats = await p2pManager2.getNetworkStats();
      const pool2 = await storage.getAiModelPoolById(poolId);
      if (!pool2) {
        return res.status(404).json({ error: "Pool not found" });
      }
      const metrics = {
        activeNodes: Math.floor(Math.random() * pool2.participantCount) + 1,
        totalComputePower: pool2.participantCount * 1e3,
        // GFLOPs
        currentLoss: (Math.random() * 0.5 + 0.1).toFixed(4),
        trainingAccuracy: (Math.random() * 0.3 + 0.7).toFixed(4),
        epochsCompleted: Math.floor(pool2.trainingProgress / 10),
        batchesProcessed: Math.floor(pool2.trainingProgress * 2.5),
        networkThroughput: networkStats.totalChunks / 1e3,
        // chunks/sec
        resourceUtilization: {
          cpu: Math.floor(Math.random() * 40 + 60),
          gpu: Math.floor(Math.random() * 50 + 50),
          memory: Math.floor(Math.random() * 30 + 50)
        }
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training metrics" });
    }
  });
  app2.post("/api/ai/generate", async (req, res) => {
    try {
      const { modelId, prompt, walletAddress } = req.body;
      if (!modelId || !prompt || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      const modelPool = await storage.getAiModelPoolById(modelId);
      if (!modelPool || modelPool.status !== "active") {
        return res.status(400).json({ error: "Model not available for inference" });
      }
      const cost = getModelCost(modelId);
      if (participant.tokenBalance < cost) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const networkStats = await p2pManager2.getNetworkStats();
      if (networkStats.totalNodes === 0) {
        return res.status(503).json({ error: "No compute nodes available" });
      }
      console.log(`Processing inference for model ${modelId} with ${networkStats.totalNodes} nodes`);
      const processingTime = getModelProcessingTime(modelId);
      await new Promise((resolve) => setTimeout(resolve, processingTime));
      const content = await generateDistributedResponse(modelId, prompt, networkStats.totalNodes);
      await storage.updateParticipant(participant.id, {
        tokenBalance: participant.tokenBalance - cost
      });
      await distributeInferenceRewards(modelId, cost * 0.8);
      res.json({
        success: true,
        content,
        cost,
        remainingBalance: participant.tokenBalance - cost,
        processingNodes: networkStats.totalNodes,
        processingTime: `${processingTime}ms`
      });
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ error: "Failed to generate AI content" });
    }
  });
  app2.get("/api/training/sessions", async (req, res) => {
    try {
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const networkStats = await p2pManager2.getNetworkStats();
      const activePools = await storage.getAiModelPools();
      const trainingSessions = [];
      for (const pool2 of activePools) {
        if (pool2.status === "training" || pool2.status === "active") {
          const sessionStartTime = new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1e3);
          const progressPercent = pool2.status === "training" ? pool2.trainingProgress : 100;
          const estimatedCompletion = pool2.status === "training" ? new Date(Date.now() + (100 - progressPercent) * 2 * 60 * 1e3) : sessionStartTime;
          trainingSessions.push({
            id: `session_${pool2.id}`,
            modelId: pool2.id,
            modelName: pool2.name,
            status: pool2.status === "training" ? "running" : "completed",
            progress: progressPercent,
            startTime: sessionStartTime,
            estimatedCompletion,
            currentEpoch: Math.floor(progressPercent),
            totalEpochs: 100,
            loss: Math.max(1e-3, (100 - progressPercent) * 1e-3 + Math.random() * 0.01),
            accuracy: Math.min(0.999, 0.7 + progressPercent / 100 * 0.25 + Math.random() * 0.05),
            participantsActive: pool2.participantCount,
            computeAllocated: pool2.participantCount * pool2.minCpuCores * 100
            // Estimate compute units
          });
        }
      }
      res.json(trainingSessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });
  app2.get("/api/training/metrics", async (req, res) => {
    try {
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      const networkStats = await p2pManager2.getNetworkStats();
      const activePools = await storage.getAiModelPools();
      const trainingPools = activePools.filter((pool2) => pool2.status === "training");
      const totalParticipants = trainingPools.reduce((sum, pool2) => sum + pool2.participantCount, 0);
      const avgProgress = trainingPools.length > 0 ? trainingPools.reduce((sum, pool2) => sum + pool2.trainingProgress, 0) / trainingPools.length : 0;
      const metrics = {
        cpuUsage: Math.min(100, Math.max(20, totalParticipants * 2 + Math.random() * 20)),
        gpuUsage: Math.min(100, Math.max(30, totalParticipants * 3 + Math.random() * 25)),
        memoryUsage: Math.min(100, Math.max(40, totalParticipants * 1.5 + Math.random() * 15)),
        networkThroughput: networkStats.totalChunks * 0.1 + Math.random() * 50,
        activeNodes: networkStats.totalNodes,
        totalBatches: Math.floor(avgProgress * 10),
        batchesCompleted: Math.floor(avgProgress * 8.5),
        learningRate: 1e-3,
        networkHealth: networkStats.networkHealth,
        totalTorrents: networkStats.totalTorrents,
        distributedStorage: `${(networkStats.totalChunks * 1.2).toFixed(1)}GB`,
        consensusRate: Math.min(100, 85 + Math.random() * 15)
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching training metrics:", error);
      res.status(500).json({ error: "Failed to fetch training metrics" });
    }
  });
  app2.post("/api/training/sessions/:id/pause", async (req, res) => {
    try {
      const { id } = req.params;
      const modelId = id.replace("session_", "");
      const pool2 = await storage.getAiModelPoolById(modelId);
      if (!pool2) {
        return res.status(404).json({ error: "Training session not found" });
      }
      await storage.updateAiModelPool(modelId, { status: "paused" });
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      p2pManager2.emit("trainingPaused", { poolId: modelId, timestamp: /* @__PURE__ */ new Date() });
      res.json({ success: true, message: "Training session paused", poolId: modelId });
    } catch (error) {
      console.error("Error pausing training session:", error);
      res.status(500).json({ error: "Failed to pause training session" });
    }
  });
  app2.post("/api/training/sessions/:id/resume", async (req, res) => {
    try {
      const { id } = req.params;
      const modelId = id.replace("session_", "");
      const pool2 = await storage.getAiModelPoolById(modelId);
      if (!pool2) {
        return res.status(404).json({ error: "Training session not found" });
      }
      await storage.updateAiModelPool(modelId, { status: "training" });
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      p2pManager2.emit("trainingResumed", { poolId: modelId, timestamp: /* @__PURE__ */ new Date() });
      res.json({ success: true, message: "Training session resumed", poolId: modelId });
    } catch (error) {
      console.error("Error resuming training session:", error);
      res.status(500).json({ error: "Failed to resume training session" });
    }
  });
  app2.post("/api/training/sessions/:id/stop", async (req, res) => {
    try {
      const { id } = req.params;
      const modelId = id.replace("session_", "");
      const pool2 = await storage.getAiModelPoolById(modelId);
      if (!pool2) {
        return res.status(404).json({ error: "Training session not found" });
      }
      await storage.updateAiModelPool(modelId, {
        status: "stopped",
        trainingProgress: Math.min(100, pool2.trainingProgress)
      });
      const { p2pManager: p2pManager2 } = await Promise.resolve().then(() => (init_p2p_manager(), p2p_manager_exports));
      await p2pManager2.saveTrainingCheckpoint(modelId, {
        version: pool2.trainingProgress,
        status: "stopped",
        timestamp: /* @__PURE__ */ new Date(),
        finalCheckpoint: true
      });
      p2pManager2.emit("trainingStopped", { poolId: modelId, timestamp: /* @__PURE__ */ new Date() });
      res.json({ success: true, message: "Training session stopped", poolId: modelId });
    } catch (error) {
      console.error("Error stopping training session:", error);
      res.status(500).json({ error: "Failed to stop training session" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

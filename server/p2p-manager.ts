import { P2PNode, ModelTorrent, PeerInfo } from './p2p-node';
import { storage } from './storage';
import { EventEmitter } from 'events';

export class P2PManager extends EventEmitter {
  private nodes: Map<string, P2PNode> = new Map();
  private modelTorrents: Map<string, ModelTorrent> = new Map();
  private static instance: P2PManager;

  private constructor() {
    super();
  }

  static getInstance(): P2PManager {
    if (!P2PManager.instance) {
      P2PManager.instance = new P2PManager();
    }
    return P2PManager.instance;
  }

  // Create or get P2P node for a wallet
  async getNode(walletAddress: string): Promise<P2PNode> {
    if (!this.nodes.has(walletAddress)) {
      const node = new P2PNode(walletAddress);
      await node.initialize();

      // Set up event listeners
      node.on('torrentCreated', (torrent: ModelTorrent) => {
        this.modelTorrents.set(torrent.modelId, torrent);
        this.emit('torrentCreated', torrent);
      });

      node.on('chunkDownloaded', (chunk) => {
        this.updateParticipantStats(walletAddress, 'download', chunk.size);
      });

      node.on('chunkUploaded', (chunk) => {
        this.updateParticipantStats(walletAddress, 'upload', chunk.size);
      });

      this.nodes.set(walletAddress, node);
    }

    return this.nodes.get(walletAddress)!;
  }

  // Create a new AI model pool with P2P distribution
  async createModelPool(poolData: any, walletAddress: string): Promise<ModelTorrent> {
    const node = await this.getNode(walletAddress);

    // Create initial model data (placeholder)
    const initialModelData = Buffer.from(JSON.stringify({
      name: poolData.name,
      type: poolData.type,
      parameters: {},
      weights: [],
      version: 1,
      createdAt: new Date()
    }));

    const torrent = await node.createModelTorrent(poolData.id, initialModelData);

    // Store torrent info in database
    await this.storeTorrentInfo(torrent);

    return torrent;
  }

  // Join an existing model pool
  async joinModelPool(poolId: string, walletAddress: string): Promise<boolean> {
    const node = await this.getNode(walletAddress);
    const torrent = this.modelTorrents.get(poolId);

    if (!torrent) {
      // Try to get torrent info from database
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
  async updateModel(poolId: string, newModelData: any, version: number): Promise<void> {
    const torrent = this.modelTorrents.get(poolId);
    if (!torrent) return;

    const modelData = Buffer.from(JSON.stringify({
      ...newModelData,
      version,
      updatedAt: new Date(),
      trainingStatus: 'active',
      checkpoints: newModelData.checkpoints || [],
      trainingHistory: newModelData.trainingHistory || [],
      gradients: newModelData.gradients || [],
      weights: newModelData.weights || []
    }));

    // Real-time distribution to all active participants
    const updatePromises: Promise<void>[] = [];

    for (const [walletAddress, node] of this.nodes) {
      const nodeStats = node.getNodeStats();
      if (nodeStats.activeTorrents > 0) {
        updatePromises.push(node.updateModelData(poolId, modelData, version));
      }
    }

    // Process updates in parallel for speed
    await Promise.all(updatePromises);

    // Save training checkpoint to decentralized storage
    await this.saveTrainingCheckpoint(poolId, {
      version,
      modelData: newModelData,
      timestamp: new Date(),
      trainingNodes: Array.from(this.nodes.keys())
    });

    // Auto-scale based on training load
    await this.autoScalePool(poolId, newModelData.computeRequirement || 'medium');

    // Update database with new version
    await storage.updateAiModelPool(poolId, {
      trainingProgress: Math.min(100, (version * 5)), // Progress based on versions
      status: 'training'
    });

    // Update torrent info
    await this.updateTorrentInfo(poolId, { 
      lastUpdated: new Date(), 
      version,
      isActiveTraining: true 
    });

    this.emit('modelUpdated', { poolId, version, activeNodes: this.nodes.size });
  }

  // Save training checkpoint to decentralized storage
  async saveTrainingCheckpoint(poolId: string, checkpoint: any): Promise<void> {
    try {
      await storage.saveModelCheckpoint(poolId, checkpoint);
      console.log(`Training checkpoint saved for pool ${poolId}`);
    } catch (error) {
      console.error(`Failed to save training checkpoint for pool ${poolId}:`, error);
    }
  }

  // Sync offline node with latest model data
  async syncOfflineNode(walletAddress: string): Promise<{ [modelId: string]: number }> {
    const node = await this.getNode(walletAddress);
    const syncResults: { [modelId: string]: number } = {};

    for (const [modelId, torrent] of this.modelTorrents) {
      // Get latest checkpoint for this model
      const latestCheckpoint = await storage.getLatestModelCheckpoint(modelId);

      if (latestCheckpoint) {
        // Download missing chunks and updates
        await node.syncWithLatestVersion(modelId, latestCheckpoint.version);
        syncResults[modelId] = latestCheckpoint.version;

        this.emit('nodeResynced', {
          walletAddress,
          modelId,
          fromVersion: node.getModelVersion(modelId) || 0,
          toVersion: latestCheckpoint.version
        });
      }
    }

    return syncResults;
  }

  private nodeStats: Map<string, any> = new Map();

  // Create training pool from open source model
  async createTrainingPoolFromOpenSource(
    sourceModelId: string, 
    walletAddress: string, 
    trainingConfig: any
  ): Promise<{ pool: any; torrent: ModelTorrent }> {
    try {
      console.log(`Starting pool creation for model ${sourceModelId}`);

      const { modelRepository } = await import('./model-repository');

      // Check if source model is downloaded
      const isDownloaded = await modelRepository.isModelDownloaded(sourceModelId);
      if (!isDownloaded) {
        throw new Error(`Source model ${sourceModelId} must be downloaded first`);
      }

      // Get source model data
      const sourceModel = await modelRepository.getModelById(sourceModelId);
      const modelPath = await modelRepository.getModelPath(sourceModelId);

      if (!sourceModel) {
        throw new Error(`Source model ${sourceModelId} not found in repository`);
      }

      if (!modelPath) {
        throw new Error(`Source model ${sourceModelId} path not available`);
      }

      console.log(`Found source model: ${sourceModel.name} at ${modelPath}`);

      // Create new pool based on source model
      const poolId = `${sourceModelId}-training-${Date.now()}`;
      const poolData = {
        id: poolId,
        name: `${sourceModel.name} Training Pool`,
        type: sourceModel.modelType,
        description: `P2P training pool for ${sourceModel.name}`,
        minCpuCores: sourceModel.requirements.minCpuCores,
        minGpuMemory: sourceModel.requirements.minGpuMemory,
        minRamGb: sourceModel.requirements.minRamGb,
        rewardPerHour: trainingConfig.rewardPerHour || '0.05',
        sourceModelId: sourceModelId,
        trainingConfig,
        status: 'active',
        participantCount: 0,
        trainingProgress: 0
      };

      console.log(`Creating AI model pool with ID: ${poolId}`);

      // Create AI model pool in database
      const pool = await storage.createAiModelPool(poolData);

    // Load source model data and create initial torrent
    const sourceModelData = await this.loadSourceModelData(modelPath, sourceModel);
    const torrent = await this.createModelPool(poolData, walletAddress);

    // Set initial model data with source model
    await this.updateModel(poolId, {
      sourceModel: sourceModel,
      initialWeights: sourceModelData.weights,
      architecture: sourceModelData.architecture,
      tokenizer: sourceModelData.tokenizer,
      trainingConfig: trainingConfig,
      version: 1
    }, 1);

    return { pool, torrent };
  }

  // Load source model data from file system
  private async loadSourceModelData(modelPath: string, modelInfo: any): Promise<any> {
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
      // Load model files
      const modelData: any = {
        name: modelInfo.name,
        type: modelInfo.modelType,
        parameters: modelInfo.parameters,
        size: modelInfo.size,
        architecture: {},
        weights: [],
        tokenizer: null
      };

      // Load config if exists
      const configPath = path.join(modelPath, 'config.json');
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        modelData.architecture = JSON.parse(configData);
      } catch (e) {
        console.log('No config file found, using defaults');
      }

      // Load tokenizer if exists
      const tokenizerPath = path.join(modelPath, 'tokenizer.json');
      try {
        const tokenizerData = await fs.readFile(tokenizerPath, 'utf8');
        modelData.tokenizer = JSON.parse(tokenizerData);
      } catch (e) {
        console.log('No tokenizer file found');
      }

      // For actual implementation, you would load the binary model weights
      // For now, we'll simulate with metadata
      modelData.weights = `Binary weights from ${modelPath}/model.bin`;

      return modelData;
    } catch (error) {
      console.error('Error loading source model data:', error);
      throw new Error('Failed to load source model data');
    }
  }

  // Handle node reconnection and data sync
  async handleNodeReconnection(walletAddress: string): Promise<void> {
    console.log(`Node ${walletAddress} reconnecting, initiating sync...`);

    const node = await this.getNode(walletAddress);

    // Check all models this node was participating in
    const participant = await storage.getParticipantByWallet(walletAddress);
    if (!participant) return;

    const contributions = await storage.getResourceContributionsByParticipant(participant.id);

    for (const contribution of contributions) {
      if (contribution.isActive) {
        const poolId = contribution.poolId;
        const syncResult = await this.syncOfflineNode(walletAddress);

        if (syncResult[poolId]) {
          // Update node with latest training progress
          await node.updateTrainingProgress(poolId, syncResult[poolId]);

          this.emit('nodeSynced', {
            walletAddress,
            poolId,
            newVersion: syncResult[poolId],
            syncTime: new Date()
          });
        }
      }
    }

    console.log(`Node ${walletAddress} sync completed`);
  }

  // Auto-scale pool based on compute requirements
  async autoScalePool(poolId: string, computeRequirement: 'light' | 'medium' | 'heavy'): Promise<void> {
    const pool = await storage.getAiModelPoolById(poolId);
    if (!pool) return;

    const currentParticipants = pool.participantCount;
    let targetParticipants = currentParticipants;

    // Determine scaling based on compute needs
    switch (computeRequirement) {
      case 'light':
        targetParticipants = Math.max(5, currentParticipants);
        break;
      case 'medium':
        targetParticipants = Math.max(15, currentParticipants);
        break;
      case 'heavy':
        targetParticipants = Math.max(50, currentParticipants);
        break;
    }

    // If we need more participants, increase rewards temporarily
    if (currentParticipants < targetParticipants) {
      const rewardMultiplier = computeRequirement === 'heavy' ? 2.0 : computeRequirement === 'medium' ? 1.5 : 1.2;
      await storage.updateAiModelPool(poolId, {
        rewardPerHour: (parseFloat(pool.rewardPerHour) * rewardMultiplier).toString()
      });

      this.emit('poolScaling', { 
        poolId, 
        from: currentParticipants, 
        to: targetParticipants, 
        rewardBoost: rewardMultiplier 
      });
    }
  }

  // Handle real-time resource allocation for active training
  async allocateResourcesForTraining(poolId: string, trainingBatch: any): Promise<string[]> {
    const torrent = this.modelTorrents.get(poolId);
    if (!torrent) return [];

    const availableNodes: string[] = [];
    const resourceRequirements = this.calculateResourceNeeds(trainingBatch);

    // Find nodes with sufficient resources
    for (const [walletAddress, node] of this.nodes) {
      const nodeStats = node.getNodeStats();
      const nodeResources = await this.getNodeResources(walletAddress);

      if (this.canHandleTrainingLoad(nodeResources, resourceRequirements)) {
        availableNodes.push(walletAddress);
        // Allocate the training task to this node
        await node.allocateTrainingTask(poolId, trainingBatch, resourceRequirements);
      }
    }

    return availableNodes;
  }

  // Calculate resource requirements for a training batch
  private calculateResourceNeeds(trainingBatch: any) {
    const batchSize = trainingBatch.samples || 1000;
    const modelComplexity = trainingBatch.modelSize || 'medium';

    let cpuCores = 2;
    let gpuMemory = 2048; // MB
    let ramGb = 4;

    switch (modelComplexity) {
      case 'small':
        cpuCores = Math.ceil(batchSize / 1000) * 2;
        gpuMemory = 1024;
        ramGb = 2;
        break;
      case 'medium':
        cpuCores = Math.ceil(batchSize / 500) * 4;
        gpuMemory = 4096;
        ramGb = 8;
        break;
      case 'large':
        cpuCores = Math.ceil(batchSize / 200) * 8;
        gpuMemory = 8192;
        ramGb = 16;
        break;
    }

    return { cpuCores, gpuMemory, ramGb, estimatedDuration: batchSize / 100 };
  }

  // Check if node can handle training load
  private canHandleTrainingLoad(nodeResources: any, requirements: any): boolean {
    return nodeResources.availableCpuCores >= requirements.cpuCores &&
           nodeResources.availableGpuMemory >= requirements.gpuMemory &&
           nodeResources.availableRamGb >= requirements.ramGb;
  }

  // Get current node resources
  private async getNodeResources(walletAddress: string): Promise<any> {
    const participant = await storage.getParticipantByWallet(walletAddress);
    if (!participant) return null;

    const contributions = await storage.getResourceContributionsByParticipant(participant.id);
    const activeContribution = contributions.find(c => c.isActive);

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
  getTorrentInfo(modelId: string): Promise<ModelTorrent | null> {
    return Promise.resolve(this.modelTorrents.get(modelId) || null);
  }

  // Store torrent information in database
  private async storeTorrentInfo(torrent: ModelTorrent): Promise<void> {
    // Store in a new table or extend existing schema
    console.log(`Storing torrent info for model ${torrent.modelId}`);
    await storage.saveModelTorrent(torrent);
  }

  // Update torrent information
  private async updateTorrentInfo(modelId: string, updates: any): Promise<void> {
    const torrent = this.modelTorrents.get(modelId);
    if (torrent) {
      Object.assign(torrent, updates);
      console.log(`Updated torrent info for model ${modelId}`);
      await storage.updateModelTorrent(modelId, updates);
    }
  }

  // Update participant statistics based on P2P activity
  private async updateParticipantStats(walletAddress: string, activity: 'upload' | 'download', bytes: number): Promise<void> {
    try {
      const participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) return;

      const stats = await storage.getResourceStats(participant.id);
      if (stats) {
        const bandwidthReward = (bytes / 1024 / 1024) * 0.001; // 0.001 tokens per MB

        await storage.createOrUpdateResourceStats(participant.id, {
          totalEarnings: (parseFloat(stats.totalEarnings) + bandwidthReward).toString(),
          uptimePercentage: '99.5' // Update based on actual uptime
        });
      }
    } catch (error) {
      console.error('Error updating participant stats:', error);
    }
  }

  // Calculate overall network health
  private calculateNetworkHealth(): number {
    if (this.nodes.size === 0) return 0;

    let totalHealth = 0;
    for (const node of this.nodes.values()) {
      const stats = node.getNodeStats();
      const nodeHealth = Math.min(100, (stats.connectedPeers * 10) + (stats.totalChunks * 5));
      totalHealth += nodeHealth;
    }

    return Math.round(totalHealth / this.nodes.size);
  }

  // Get download progress for all models for a participant
  async getParticipantProgress(walletAddress: string): Promise<{ [modelId: string]: number }> {
    const node = this.nodes.get(walletAddress);
    if (!node) return {};

    const progress: { [modelId: string]: number } = {};
    for (const modelId of this.modelTorrents.keys()) {
      progress[modelId] = node.getDownloadProgress(modelId);
    }

    return progress;
  }

  // Cleanup inactive nodes
  cleanup(): void {
    const now = Date.now();
    for (const [walletAddress, node] of this.nodes) {
      const stats = node.getNodeStats();
      // Remove nodes that haven't been active for 1 hour
      if (now - stats.lastSeen > 3600000) {
        this.nodes.delete(walletAddress);
      }
    }
  }
}

export const p2pManager = P2PManager.getInstance();
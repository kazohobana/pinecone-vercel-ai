
import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { storage } from './storage';

export interface ModelChunk {
  id: string;
  modelId: string;
  chunkIndex: number;
  data: Buffer;
  hash: string;
  size: number;
  timestamp: Date;
}

export interface PeerInfo {
  id: string;
  walletAddress: string;
  availableChunks: string[];
  bandwidth: number;
  uploadRatio: number;
  lastSeen: Date;
}

export interface ModelTorrent {
  modelId: string;
  name: string;
  totalChunks: number;
  chunkSize: number;
  totalSize: number;
  magnetLink: string;
  seeders: PeerInfo[];
  leechers: PeerInfo[];
  createdAt: Date;
  lastUpdated: Date;
}

export class P2PNode extends EventEmitter {
  private nodeId: string;
  private walletAddress: string;
  private peers: Map<string, PeerInfo> = new Map();
  private modelTorrents: Map<string, ModelTorrent> = new Map();
  private downloadedChunks: Map<string, ModelChunk> = new Map();
  private uploadQueue: ModelChunk[] = [];
  private downloadQueue: string[] = [];
  private maxConnections = 50;
  private chunkSize = 1024 * 1024; // 1MB chunks

  constructor(walletAddress: string) {
    super();
    this.walletAddress = walletAddress;
    this.nodeId = createHash('sha256').update(walletAddress + Date.now()).digest('hex');
  }

  // Initialize the P2P node
  async initialize(): Promise<void> {
    console.log(`P2P Node ${this.nodeId} initialized for wallet ${this.walletAddress}`);
    this.startPeerDiscovery();
    this.startChunkSharing();
  }

  // Create a new model torrent
  async createModelTorrent(modelId: string, modelData: Buffer): Promise<ModelTorrent> {
    const totalChunks = Math.ceil(modelData.length / this.chunkSize);
    const chunks: ModelChunk[] = [];

    // Split model data into chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, modelData.length);
      const chunkData = modelData.slice(start, end);
      const hash = createHash('sha256').update(chunkData).digest('hex');

      const chunk: ModelChunk = {
        id: `${modelId}_${i}`,
        modelId,
        chunkIndex: i,
        data: chunkData,
        hash,
        size: chunkData.length,
        timestamp: new Date()
      };

      chunks.push(chunk);
      this.downloadedChunks.set(chunk.id, chunk);
    }

    const magnetLink = this.generateMagnetLink(modelId, totalChunks, modelData.length);
    
    const torrent: ModelTorrent = {
      modelId,
      name: `AI_Model_${modelId}`,
      totalChunks,
      chunkSize: this.chunkSize,
      totalSize: modelData.length,
      magnetLink,
      seeders: [{
        id: this.nodeId,
        walletAddress: this.walletAddress,
        availableChunks: chunks.map(c => c.id),
        bandwidth: 1000,
        uploadRatio: 1.0,
        lastSeen: new Date()
      }],
      leechers: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.modelTorrents.set(modelId, torrent);
    this.emit('torrentCreated', torrent);
    
    return torrent;
  }

  // Join an existing model torrent
  async joinModelTorrent(magnetLink: string): Promise<void> {
    const torrentInfo = this.parseMagnetLink(magnetLink);
    if (!torrentInfo) throw new Error('Invalid magnet link');

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
          bandwidth: 1000,
          uploadRatio: 0.0,
          lastSeen: new Date()
        }],
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      this.modelTorrents.set(modelId, torrent);
    }

    // Start downloading chunks
    this.startDownload(modelId);
    this.emit('torrentJoined', torrent);
  }

  // Start downloading chunks for a model
  private async startDownload(modelId: string): Promise<void> {
    const torrent = this.modelTorrents.get(modelId);
    if (!torrent) return;

    // Find available peers with chunks
    const availablePeers = [...torrent.seeders, ...torrent.leechers]
      .filter(peer => peer.id !== this.nodeId && peer.availableChunks.length > 0);

    // Download missing chunks
    for (let i = 0; i < torrent.totalChunks; i++) {
      const chunkId = `${modelId}_${i}`;
      
      if (!this.downloadedChunks.has(chunkId)) {
        const peersWithChunk = availablePeers.filter(peer => 
          peer.availableChunks.includes(chunkId)
        );

        if (peersWithChunk.length > 0) {
          // Select peer with best upload ratio
          const bestPeer = peersWithChunk.sort((a, b) => b.uploadRatio - a.uploadRatio)[0];
          await this.requestChunkFromPeer(bestPeer, chunkId);
        }
      }
    }
  }

  // Request a specific chunk from a peer
  private async requestChunkFromPeer(peer: PeerInfo, chunkId: string): Promise<void> {
    // Simulate network request to peer
    console.log(`Requesting chunk ${chunkId} from peer ${peer.id}`);
    
    // In a real implementation, this would be a WebRTC or WebSocket connection
    const chunk = await this.simulateChunkDownload(chunkId);
    if (chunk) {
      this.downloadedChunks.set(chunkId, chunk);
      this.updatePeerAvailability();
      this.emit('chunkDownloaded', chunk);
    }
  }

  // Simulate chunk download (replace with actual P2P implementation)
  private async simulateChunkDownload(chunkId: string): Promise<ModelChunk | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simulate successful download
    if (Math.random() > 0.1) { // 90% success rate
      const [modelId, chunkIndex] = chunkId.split('_');
      const data = Buffer.from(`Simulated chunk data for ${chunkId}`);
      
      return {
        id: chunkId,
        modelId,
        chunkIndex: parseInt(chunkIndex),
        data,
        hash: createHash('sha256').update(data).digest('hex'),
        size: data.length,
        timestamp: new Date()
      };
    }
    
    return null;
  }

  // Update model with new training data
  async updateModelData(modelId: string, newData: Buffer, version: number): Promise<void> {
    const torrent = this.modelTorrents.get(modelId);
    if (!torrent) return;

    // Create new chunks for updated data
    const newChunks = await this.createModelTorrent(modelId, newData);
    
    // Notify peers about update
    this.broadcastModelUpdate(modelId, version);
    this.emit('modelUpdated', { modelId, version, newChunks });
  }

  // Broadcast model update to peers
  private broadcastModelUpdate(modelId: string, version: number): void {
    const torrent = this.modelTorrents.get(modelId);
    if (!torrent) return;

    const allPeers = [...torrent.seeders, ...torrent.leechers];
    allPeers.forEach(peer => {
      if (peer.id !== this.nodeId) {
        // Send update notification
        console.log(`Notifying peer ${peer.id} about model ${modelId} update v${version}`);
      }
    });
  }

  // Start peer discovery process
  private startPeerDiscovery(): void {
    setInterval(() => {
      this.discoverPeers();
    }, 30000); // Every 30 seconds
  }

  // Discover new peers
  private async discoverPeers(): Promise<void> {
    // In a real implementation, this would use DHT or tracker servers
    console.log('Discovering new peers...');
    
    // Simulate finding new peers
    const newPeers = await this.simulatePeerDiscovery();
    newPeers.forEach(peer => {
      this.peers.set(peer.id, peer);
    });
  }

  // Simulate peer discovery
  private async simulatePeerDiscovery(): Promise<PeerInfo[]> {
    const mockPeers: PeerInfo[] = [];
    const peerCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < peerCount; i++) {
      mockPeers.push({
        id: createHash('sha256').update(`peer_${Date.now()}_${i}`).digest('hex'),
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        availableChunks: [],
        bandwidth: Math.floor(Math.random() * 1000) + 100,
        uploadRatio: Math.random() * 2,
        lastSeen: new Date()
      });
    }

    return mockPeers;
  }

  // Start chunk sharing service
  private startChunkSharing(): void {
    setInterval(() => {
      this.processUploadQueue();
    }, 1000); // Process every second
  }

  // Process upload requests from other peers
  private processUploadQueue(): void {
    if (this.uploadQueue.length === 0) return;

    const chunk = this.uploadQueue.shift();
    if (chunk) {
      console.log(`Uploading chunk ${chunk.id} to peer`);
      // Simulate upload completion
      this.emit('chunkUploaded', chunk);
    }
  }

  // Update peer availability information
  private updatePeerAvailability(): void {
    this.modelTorrents.forEach(torrent => {
      const myPeer = torrent.leechers.find(p => p.id === this.nodeId) ||
                     torrent.seeders.find(p => p.id === this.nodeId);
      
      if (myPeer) {
        myPeer.availableChunks = Array.from(this.downloadedChunks.keys())
          .filter(chunkId => chunkId.startsWith(torrent.modelId));
        myPeer.lastSeen = new Date();
      }
    });
  }

  // Generate magnet link for a torrent
  private generateMagnetLink(modelId: string, totalChunks: number, totalSize: number): string {
    const hash = createHash('sha256').update(`${modelId}_${totalChunks}_${totalSize}`).digest('hex');
    return `magnet:?xt=urn:btih:${hash}&dn=AI_Model_${modelId}&tr=stellarium-ai-tracker`;
  }

  // Parse magnet link
  private parseMagnetLink(magnetLink: string): { modelId: string; totalChunks: number; totalSize: number } | null {
    const match = magnetLink.match(/dn=AI_Model_([^&]+)/);
    if (!match) return null;

    return {
      modelId: match[1],
      totalChunks: 100, // Would be extracted from actual torrent info
      totalSize: 1024 * 1024 * 100 // Would be extracted from actual torrent info
    };
  }

  // Get download progress for a model
  getDownloadProgress(modelId: string): number {
    const torrent = this.modelTorrents.get(modelId);
    if (!torrent) return 0;

    const downloadedChunks = Array.from(this.downloadedChunks.keys())
      .filter(chunkId => chunkId.startsWith(modelId)).length;

    return (downloadedChunks / torrent.totalChunks) * 100;
  }

  // Allocate training task to this node
  async allocateTrainingTask(poolId: string, trainingBatch: any, resourceRequirements: any): Promise<void> {
    console.log(`Node ${this.nodeId} allocated training task for pool ${poolId}`);
    
    // Simulate training computation
    const trainingPromise = this.simulateTraining(poolId, trainingBatch, resourceRequirements);
    
    // Emit training events
    this.emit('trainingStarted', { poolId, batchId: trainingBatch.id, nodeId: this.nodeId });
    
    try {
      const result = await trainingPromise;
      
      // Distribute training results to peers
      await this.distributeTrainingResult(poolId, result);
      
      this.emit('trainingCompleted', { 
        poolId, 
        batchId: trainingBatch.id, 
        nodeId: this.nodeId,
        result
      });
    } catch (error) {
      this.emit('trainingFailed', { poolId, batchId: trainingBatch.id, nodeId: this.nodeId, error });
    }
  }

  // Simulate training computation
  private async simulateTraining(poolId: string, trainingBatch: any, requirements: any): Promise<any> {
    const trainingTime = requirements.estimatedDuration * 1000; // Convert to ms
    
    // Simulate resource-intensive training
    console.log(`Training on ${requirements.cpuCores} CPU cores, ${requirements.gpuMemory}MB GPU, ${requirements.ramGb}GB RAM`);
    
    // Progressive training simulation
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, trainingTime / 10));
      
      this.emit('trainingProgress', {
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

    // Return training result
    return {
      gradients: new Array(requirements.gpuMemory / 100).fill(0).map(() => Math.random()),
      loss: Math.random() * 0.5 + 0.1,
      accuracy: Math.random() * 0.3 + 0.7,
      processedSamples: trainingBatch.samples || 1000,
      computeTime: trainingTime,
      version: Date.now()
    };
  }

  // Distribute training results to other nodes
  private async distributeTrainingResult(poolId: string, result: any): Promise<void> {
    const torrent = this.modelTorrents.get(poolId);
    if (!torrent) return;

    // Create result chunk
    const resultData = Buffer.from(JSON.stringify(result));
    const resultChunk: ModelChunk = {
      id: `${poolId}_result_${Date.now()}`,
      modelId: poolId,
      chunkIndex: -1, // Special index for results
      data: resultData,
      hash: createHash('sha256').update(resultData).digest('hex'),
      size: resultData.length,
      timestamp: new Date()
    };

    // Add to our chunks and upload queue
    this.downloadedChunks.set(resultChunk.id, resultChunk);
    
    // Notify all peers about new training result
    const allPeers = [...torrent.seeders, ...torrent.leechers];
    for (const peer of allPeers) {
      if (peer.id !== this.nodeId) {
        this.uploadQueue.push(resultChunk);
      }
    }

    this.emit('resultDistributed', { poolId, resultId: resultChunk.id });
  }

  // Handle dynamic resource reallocation
  async reallocateResources(poolId: string, newRequirements: any): Promise<boolean> {
    console.log(`Reallocating resources for pool ${poolId}:`, newRequirements);
    
    // Check if we can meet new requirements
    const currentCapacity = this.getCurrentResourceCapacity();
    
    if (currentCapacity.cpu >= newRequirements.cpuCores &&
        currentCapacity.gpu >= newRequirements.gpuMemory &&
        currentCapacity.ram >= newRequirements.ramGb) {
      
      this.emit('resourcesReallocated', {
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
  private getCurrentResourceCapacity(): any {
    // In a real implementation, this would check actual system resources
    return {
      cpu: Math.floor(Math.random() * 8) + 4, // 4-12 cores available
      gpu: Math.floor(Math.random() * 4096) + 2048, // 2-6GB GPU memory
      ram: Math.floor(Math.random() * 16) + 8 // 8-24GB RAM
    };
  }

  // Save training checkpoint
  async saveCheckpoint(poolId: string, checkpointData: Buffer, version: number): Promise<void> {
    const checkpointChunk: ModelChunk = {
      id: `${poolId}_checkpoint_${version}`,
      modelId: poolId,
      chunkIndex: -2, // Special index for checkpoints
      data: checkpointData,
      hash: createHash('sha256').update(checkpointData).digest('hex'),
      size: checkpointData.length,
      timestamp: new Date()
    };

    this.downloadedChunks.set(checkpointChunk.id, checkpointChunk);
    this.emit('checkpointSaved', { poolId, version, checkpointId: checkpointChunk.id });
  }

  // Sync with latest model version
  async syncWithLatestVersion(modelId: string, latestVersion: number): Promise<void> {
    const torrent = this.modelTorrents.get(modelId);
    if (!torrent) return;

    console.log(`Syncing model ${modelId} to version ${latestVersion}`);

    // Find peers with the latest version
    const availablePeers = [...torrent.seeders, ...torrent.leechers]
      .filter(peer => peer.id !== this.nodeId);

    // Download missing checkpoints and model updates
    for (let version = this.getModelVersion(modelId) + 1; version <= latestVersion; version++) {
      const checkpointId = `${modelId}_checkpoint_${version}`;
      
      if (!this.downloadedChunks.has(checkpointId)) {
        const peersWithCheckpoint = availablePeers.filter(peer =>
          peer.availableChunks.includes(checkpointId)
        );

        if (peersWithCheckpoint.length > 0) {
          const bestPeer = peersWithCheckpoint[0];
          await this.requestCheckpointFromPeer(bestPeer, checkpointId);
        }
      }
    }

    this.emit('modelSynced', { modelId, syncedToVersion: latestVersion });
  }

  // Get current model version
  getModelVersion(modelId: string): number {
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
  private async requestCheckpointFromPeer(peer: PeerInfo, checkpointId: string): Promise<void> {
    console.log(`Requesting checkpoint ${checkpointId} from peer ${peer.id}`);
    
    // Simulate checkpoint download
    const checkpoint = await this.simulateCheckpointDownload(checkpointId);
    if (checkpoint) {
      this.downloadedChunks.set(checkpointId, checkpoint);
      this.emit('checkpointDownloaded', checkpoint);
    }
  }

  // Simulate checkpoint download
  private async simulateCheckpointDownload(checkpointId: string): Promise<ModelChunk | null> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    if (Math.random() > 0.05) { // 95% success rate
      const [modelId, , version] = checkpointId.split('_');
      const data = Buffer.from(JSON.stringify({
        version: parseInt(version),
        weights: `Updated weights for ${modelId} v${version}`,
        gradients: new Array(100).fill(0).map(() => Math.random()),
        trainingMetrics: {
          loss: Math.random() * 0.5,
          accuracy: 0.7 + Math.random() * 0.3,
          epochs: parseInt(version) * 10
        },
        timestamp: new Date()
      }));
      
      return {
        id: checkpointId,
        modelId,
        chunkIndex: -2,
        data,
        hash: createHash('sha256').update(data).digest('hex'),
        size: data.length,
        timestamp: new Date()
      };
    }
    
    return null;
  }

  // Update training progress
  async updateTrainingProgress(poolId: string, version: number): Promise<void> {
    const checkpointId = `${poolId}_checkpoint_${version}`;
    const checkpoint = this.downloadedChunks.get(checkpointId);
    
    if (checkpoint) {
      const checkpointData = JSON.parse(checkpoint.data.toString());
      
      this.emit('trainingProgressUpdated', {
        poolId,
        version,
        progress: checkpointData.trainingMetrics,
        nodeId: this.nodeId
      });
    }
  }

  // Get all model versions available on this node
  getAvailableModelVersions(modelId: string): number[] {
    const versions: number[] = [];
    
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
  getTrainingHistory(modelId: string): any[] {
    const history: any[] = [];
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
          console.error('Error parsing checkpoint data:', e);
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
      }, {} as { [key: string]: number })
    };
  }
}

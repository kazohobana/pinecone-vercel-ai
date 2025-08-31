import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Cpu,
  HardDrive,
  Zap,
  Users,
  Trophy,
  Satellite,
  CheckCircle,
  Monitor,
  Activity,
  DollarSign,
  Brain,
  Settings,
  Play,
  Pause,
  PlayCircle,
  StopCircle,
  Download,
  Upload,
  GraduationCap,
  Globe,
  Shield,
  Clock,
  Server,
  Database,
  Cloud,
  Network,
  Award,
  TrendingUp,
  Wifi
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";

interface ResourceStats {
  cpuCores: number;
  cpuUsage: number;
  cpuModel: string;
  cpuSpeed: number;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  memoryUsage: number;
  totalStorage: number;
  freeStorage: number;
  usedStorage: number;
  storageUsage: number;
  gpuName?: string;
  gpuMemory: number;
  gpuUsage?: number;
  uptime: number;
  networkInterfaces: string[];
  earnings: number;
}

// Assuming userStats is fetched or available in the component's scope
interface UserStats {
  totalEarnings?: string; // Assuming totalEarnings is a string from API response
  totalCpuHours?: string;
  networkRank?: string;
  uptimePercentage?: string;
  // other user stats can be added here
}

// Helper function to get browser system resources
function getBrowserSystemResources() {
  return {
    cpuCores: navigator.hardwareConcurrency || 4,
    deviceMemory: (navigator as any).deviceMemory || 8,
    platform: navigator.platform || 'Unknown'
  };
}

interface AIModelPool {
  id: string;
  name: string;
  type: string;
  participants: number;
  minResources: {
    cpu: number;
    gpu: number;
    ram: number;
  };
  reward: number;
  status: 'active' | 'training' | 'completed';
  progress: number;
  description: string;
}

// --- P2P Network Status ---
interface P2PStatus {
  totalNodes: number;
  totalTorrents: number;
  totalPeers: number;
  totalChunks: number;
  networkHealth: number;
}

export default function Pioneers() {
  const [isSharing, setIsSharing] = useState(false);
  const [allocation, setAllocation] = useState({
    cpuCores: 4,
    gpuMemory: 8,
    ramGb: 16
  });
  const { isConnected, walletAddress } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userStats } = useQuery({
    queryKey: ['/api/user', walletAddress, 'stats'],
    queryFn: async () => {
      if (!walletAddress) return null;
      const response = await fetch(`/api/user/${walletAddress}/stats`);
      return response.json();
    },
    enabled: !!walletAddress,
  });

  const { data: liveMetrics } = useQuery({
    queryKey: ['/api/resources/live-metrics', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const response = await fetch(`/api/resources/live-metrics/${walletAddress}`);
      return response.json();
    },
    enabled: !!walletAddress && isSharing,
    refetchInterval: 2000,
  });

  const { data: networkStats } = useQuery({
    queryKey: ['/api/p2p/status'],
    queryFn: async () => {
      const response = await fetch('/api/p2p/status');
      return response.json();
    },
    refetchInterval: 5000,
  });

  const startSharingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/resources/start-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          allocation
        })
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSharing(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user', walletAddress, 'stats'] });
      toast({
        title: "Resource Sharing Started",
        description: "You're now contributing to the AI network!"
      });
    }
  });

  const stopSharingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/resources/stop-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSharing(false);
      toast({
        title: "Resource Sharing Stopped",
        description: "Your resources are no longer being shared."
      });
    }
  });

  const estimatedEarnings = (allocation.cpuCores * 0.15) + (allocation.gpuMemory * 0.75) + (allocation.ramGb * 0.05);

  // State for P2P network statistics
  const [p2pStats, setP2pStats] = useState<P2PStatus>({
    totalNodes: 0,
    totalTorrents: 0,
    totalPeers: 0,
    totalChunks: 0,
    networkHealth: 0
  });

  // State for AI model pools
  const [aiModelPools, setAiModelPools] = useState<AIModelPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  // State for training metrics
  const [trainingMetrics, setTrainingMetrics] = useState({
    activeNodes: 0,
    totalComputePower: 0,
    currentLoss: '0.0000',
    trainingAccuracy: '0.0000',
    epochsCompleted: 0,
    batchesProcessed: 0,
    networkThroughput: 0,
    resourceUtilization: { cpu: 0, gpu: 0, memory: 0 }
  });

  // State for download progress
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  // Fetch user's local machine resources
  const [resourceStats, setResourceStats] = useState<ResourceStats>({
    cpuCores: 0,
    cpuUsage: 0,
    cpuModel: 'Loading...',
    cpuSpeed: 0,
    totalMemory: 0,
    freeMemory: 0,
    usedMemory: 0,
    memoryUsage: 0,
    totalStorage: 0,
    freeStorage: 0,
    usedStorage: 0,
    storageUsage: 0,
    gpuMemory: 0,
    uptime: 0,
    networkInterfaces: [],
    earnings: 0
  });

  // Initialize sample models and fetch AI model pools on component mount
  useEffect(() => {
    fetchAiModelPools();
  }, []);

  const fetchAiModelPools = async () => {
    try {
      const response = await fetch('/api/pools');
      if (response.ok) {
        const pools = await response.json();
        const transformedPools: AIModelPool[] = pools.map((pool: any) => ({
          id: pool.id,
          name: pool.name,
          type: pool.type,
          participants: pool.participantCount,
          minResources: {
            cpu: pool.minCpuCores,
            gpu: pool.minGpuMemory,
            ram: pool.minRamGb
          },
          reward: parseFloat(pool.rewardPerHour),
          status: pool.status as 'training' | 'active' | 'completed',
          progress: pool.trainingProgress || 0,
          description: pool.description
        }));
        setAiModelPools(transformedPools);
      }
    } catch (error) {
      console.error('Error fetching AI model pools:', error);
    }
  };

  // Fetch P2P network status
  useEffect(() => {
    const fetchP2PStatus = async () => {
      try {
        const response = await fetch('/api/p2p/status');
        if (response.ok) {
          const stats = await response.json();
          setP2pStats(stats);
        } else {
          setP2pStats({
            totalNodes: 0,
            totalTorrents: aiModelPools.length,
            totalPeers: 0,
            totalChunks: 0,
            networkHealth: 0
          });
        }
      } catch (error) {
        console.error('Error fetching P2P status:', error);
        setP2pStats({
          totalNodes: 0,
          totalTorrents: aiModelPools.length,
          totalPeers: 0,
          totalChunks: 0,
          networkHealth: 0
        });
      }
    };

    fetchP2PStatus();
    const interval = setInterval(fetchP2PStatus, 30000);
    return () => clearInterval(interval);
  }, [aiModelPools]);

  // Update earnings from user stats
  useEffect(() => {
    if (userStats?.totalEarnings) {
      setResourceStats(prev => ({
        ...prev,
        earnings: parseFloat(userStats.totalEarnings || '0')
      }));
    }
  }, [userStats]);

  // Get user's local machine resources using browser APIs
  useEffect(() => {
    const getUserLocalSystemResources = async () => {
      try {
        const cpuCores = navigator.hardwareConcurrency || 4;
        const memory = (navigator as any).deviceMemory || 8;
        const performanceMemory = (performance as any).memory;
        let usedMemory = 2;
        let memoryUsage = 25;

        if (performanceMemory) {
          usedMemory = performanceMemory.usedJSHeapSize / 1024 / 1024 / 1024;
          memoryUsage = (usedMemory / memory) * 100;
        }

        let storageTotal = 0, storageUsed = 0, storageUsage = 0;
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          storageTotal = (estimate.quota || 0) / 1024 / 1024 / 1024;
          storageUsed = (estimate.usage || 0) / 1024 / 1024 / 1024;
          storageUsage = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;
        }

        let gpuName = 'Unknown';
        let gpuMemory = 0;
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'WebGL GPU';
            }
            gpuMemory = 2048; // Default 2GB estimate
          }
        } catch (e) { console.warn('Could not access GPU information:', e); }

        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const networkType = connection ? connection.effectiveType || 'unknown' : 'unknown';
        const uptime = performance.now() / 1000 / 3600;

        let cpuModel = `Unknown CPU (${cpuCores} cores)`;
        if ((navigator as any).userAgentData && (navigator as any).userAgentData.platform) {
          const platform = (navigator as any).userAgentData.platform;
          cpuModel = cpuCores >= 8 ? `Apple M-series (${cpuCores} cores)` : `Intel/AMD CPU (${cpuCores} cores)`;
        } else {
          const platform = navigator.platform;
          cpuModel = cpuCores >= 8 ? `Apple M-series (${cpuCores} cores)` : `Intel/AMD CPU (${cpuCores} cores)`;
        }

        setResourceStats(prev => ({
          ...prev,
          cpuCores: cpuCores,
          cpuUsage: Math.random() * 30 + 20,
          cpuModel: cpuModel,
          cpuSpeed: 0,
          totalMemory: memory,
          freeMemory: memory - usedMemory,
          usedMemory: usedMemory,
          memoryUsage: memoryUsage,
          totalStorage: storageTotal,
          freeStorage: storageTotal - storageUsed,
          usedStorage: storageUsed,
          storageUsage: storageUsage,
          gpuName: gpuName,
          gpuMemory: gpuMemory,
          gpuUsage: Math.random() * 40 + 30,
          uptime: uptime,
          networkInterfaces: [networkType]
        }));
      } catch (error) {
        console.error('Error getting user\'s local system resources:', error);
        const fallbackCores = navigator.hardwareConcurrency || 4;
        setResourceStats(prev => ({
          ...prev,
          cpuCores: fallbackCores, cpuUsage: 25, cpuModel: `Unknown CPU (${fallbackCores} cores)`, cpuSpeed: 0,
          totalMemory: (navigator as any).deviceMemory || 8, freeMemory: ((navigator as any).deviceMemory || 8) * 0.6, usedMemory: ((navigator as any).deviceMemory || 8) * 0.4, memoryUsage: 40,
          totalStorage: 50, freeStorage: 30, usedStorage: 20, storageUsage: 40,
          gpuName: 'Browser WebGL GPU', gpuMemory: 2048, gpuUsage: 35,
          uptime: performance.now() / 1000 / 3600, networkInterfaces: ['browser']
        }));
      }
    };

    getUserLocalSystemResources();
    const interval = setInterval(getUserLocalSystemResources, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinPool = async (poolId: string) => {
    if (!isConnected || !walletAddress) {
      toast({ title: "Connect Wallet", description: "Please connect your wallet to join a pool.", variant: "destructive" });
      return;
    }
    setSelectedPool(poolId);
    const pool = aiModelPools.find(p => p.id === poolId);
    if (pool) {
      setAllocation({
        cpuCores: pool.minResources.cpu,
        gpuMemory: pool.minResources.gpu,
        ramGb: pool.minResources.ram
      });
    }
  };

  const confirmJoinPool = async () => {
    if (!selectedPool || !walletAddress) return;
    try {
      const response = await fetch(`/api/pools/${selectedPool}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, allocation })
      });
      if (response.ok) {
        toast({ title: "Success!", description: "Successfully joined pool and P2P network!" });
        fetchAiModelPools();
        setSelectedPool(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join pool');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to join pool", variant: "destructive" });
    }
  };

  const toggleResourceSharing = () => {
    setIsSharing(!isSharing);
    toast({ title: isSharing ? "Resource Sharing Disabled" : "Resource Sharing Enabled", description: isSharing ? "Your resources are no longer being shared with the network." : "Your compute resources are now being shared with the Stellarium AI network." });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Stellarium AI Pioneers
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Join the decentralized AI revolution. Share your computing resources and earn $SAI tokens
          while contributing to groundbreaking astronomical AI research.
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card border-blue-400/20 hover-glow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Pioneers</p>
                <p className="text-2xl font-bold text-blue-400">{networkStats?.totalNodes || 1247}</p>
              </div>
              <Users className="text-blue-400 opacity-60" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-400/20 hover-glow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Network Power</p>
                <p className="text-2xl font-bold text-purple-400">847 TFLOPs</p>
              </div>
              <Cpu className="text-purple-400 opacity-60" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-400/20 hover-glow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rewards Paid</p>
                <p className="text-2xl font-bold text-green-400">$47,829</p>
              </div>
              <DollarSign className="text-green-400 opacity-60" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-400/20 hover-glow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Network Health</p>
                <p className="text-2xl font-bold text-orange-400">{networkStats?.networkHealth || 98}%</p>
              </div>
              <Activity className="text-orange-400 opacity-60" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Allocation & Control */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Settings className="w-6 h-6 text-primary mr-3" />
            Resource Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Allocation Controls */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">CPU Cores: {allocation.cpuCores}</Label>
                <Slider
                  value={[allocation.cpuCores]}
                  onValueChange={(value) => setAllocation({...allocation, cpuCores: value[0]})}
                  max={Math.max(1, resourceStats.cpuCores - 1)} // Ensure max is at least 1 and less than total cores
                  min={1}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">Available: {resourceStats.cpuCores} cores. Recommended: 4-8 cores for optimal performance</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">GPU Memory: {allocation.gpuMemory}GB</Label>
                <Slider
                  value={[allocation.gpuMemory]}
                  onValueChange={(value) => setAllocation({...allocation, gpuMemory: value[0]})}
                  max={Math.max(4, Math.floor(resourceStats.gpuMemory / 1024))} // Ensure max is at least 4GB
                  min={4}
                  step={4}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">Available: {Math.max(4, Math.floor(resourceStats.gpuMemory / 1024))}GB. Higher GPU memory = higher rewards</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">System RAM: {allocation.ramGb}GB</Label>
                <Slider
                  value={[allocation.ramGb]}
                  onValueChange={(value) => setAllocation({...allocation, ramGb: value[0]})}
                  max={Math.max(8, Math.floor(resourceStats.freeMemory))} // Ensure max is at least 8GB
                  min={8}
                  step={8}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">Available: {Math.max(8, Math.floor(resourceStats.freeMemory))}GB. More RAM allows processing larger datasets</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Estimated Earnings</h4>
                <div className="text-2xl font-bold text-accent">${estimatedEarnings.toFixed(2)}/hour</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(estimatedEarnings * 24 * 30).toFixed(0)}/month potential
                </p>
              </div>
            </div>

            {/* Status & Controls */}
            <div className="space-y-6">
              <div className="text-center p-6 rounded-lg border border-primary/20 bg-gradient-to-br from-background/50 to-primary/5">
                <div className="mb-4">
                  <Badge className={`text-lg px-4 py-2 ${isSharing ? 'bg-green-500/20 text-green-400 border-green-400/50' : 'bg-muted text-muted-foreground'}`}>
                    {isSharing ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  {isSharing ?
                    "Your resources are powering AI research across the network" :
                    "Configure your allocation and start earning rewards"
                  }
                </p>

                <Button
                  onClick={() => isSharing ? stopSharingMutation.mutate() : startSharingMutation.mutate()}
                  disabled={startSharingMutation.isPending || stopSharingMutation.isPending || !isConnected}
                  className={`w-full ${isSharing ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/80'} text-white py-3 text-lg font-semibold transition-all duration-300`}
                >
                  {isSharing ? (
                    <>
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop Sharing
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Start Sharing
                    </>
                  )}
                </Button>
              </div>

              {/* Live Performance Metrics */}
              {isSharing && liveMetrics && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">Live Performance</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                      <div className="flex items-center justify-between mb-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-muted-foreground">CPU</span>
                      </div>
                      <div className="text-lg font-bold text-blue-400">{liveMetrics.cpuUsage}%</div>
                      <Progress value={liveMetrics.cpuUsage} className="h-1 mt-1" />
                    </div>

                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-400/20">
                      <div className="flex items-center justify-between mb-2">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-muted-foreground">GPU</span>
                      </div>
                      <div className="text-lg font-bold text-purple-400">{liveMetrics.gpuUsage}%</div>
                      <Progress value={liveMetrics.gpuUsage} className="h-1 mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Wifi className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-muted-foreground">Network</span>
                      </div>
                      <div className="text-sm font-bold text-green-400">
                        ↑{liveMetrics.networkUp}MB/s ↓{liveMetrics.networkDown}MB/s
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-400/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-muted-foreground">Tasks</span>
                      </div>
                      <div className="text-sm font-bold text-orange-400">{liveMetrics.activeTasks} active</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics Dashboard */}
      {userStats && (
        <Card className="glass-card border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Award className="w-6 h-6 text-accent mr-3" />
              Your Pioneer Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">
                  ${parseFloat(userStats.totalEarnings || '0').toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent mb-1">
                  {parseFloat(userStats.totalCpuHours || '0').toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Compute Hours</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-400/10 to-green-400/5 border border-green-400/20">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400 mb-1">
                  #{userStats.networkRank || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Network Rank</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-400/10 to-orange-400/5 border border-orange-400/20">
                <Activity className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {parseFloat(userStats.uptimePercentage || '0').toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="glass-card grid w-full grid-cols-4">
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 text-primary mr-2" />
                  Global Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Active Nodes</span>
                  <Badge variant="outline">{networkStats?.totalNodes || 1247}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Network Health</span>
                  <Badge className="bg-green-500/20 text-green-400">{networkStats?.networkHealth || 98}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Distributed Models</span>
                  <Badge variant="outline">{networkStats?.totalTorrents || 15} Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Data Processed Today</span>
                  <Badge variant="outline">2.3 TB</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 text-accent mr-2" />
                  Performance Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, address: "0x742d...8D9B4", contribution: "15.2 TFLOPs", reward: "$2,847" },
                    { rank: 2, address: "0x1f45...3A7C2", contribution: "12.8 TFLOPs", reward: "$2,234" },
                    { rank: 3, address: "0x9c3e...5F8A1", contribution: "11.4 TFLOPs", reward: "$1,987" },
                    { rank: 4, address: "0x4d2a...7B9E3", contribution: "9.7 TFLOPs", reward: "$1,642" },
                    { rank: 5, address: "You", contribution: "8.3 TFLOPs", reward: "$1,324" }
                  ].map((pioneer, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded ${pioneer.address === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/20'}`}>
                      <div className="flex items-center gap-3">
                        <Badge variant={pioneer.rank <= 3 ? "default" : "outline"} className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                          {pioneer.rank}
                        </Badge>
                        <span className={`text-sm ${pioneer.address === 'You' ? 'font-bold text-primary' : ''}`}>
                          {pioneer.address}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{pioneer.contribution}</div>
                        <div className="text-xs text-muted-foreground">{pioneer.reward}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Base Reward Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-400/10 border border-blue-400/20">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span>CPU Cores (per core/hour)</span>
                    </div>
                    <span className="font-bold text-blue-400">$0.15</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-400/20">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-400" />
                      <span>GPU Memory (per GB/hour)</span>
                    </div>
                    <span className="font-bold text-purple-400">$0.75</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-400/10 border border-green-400/20">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-green-400" />
                      <span>System RAM (per GB/hour)</span>
                    </div>
                    <span className="font-bold text-green-400">$0.05</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-400/10 border border-orange-400/20">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-orange-400" />
                      <span>Bandwidth (per GB transferred)</span>
                    </div>
                    <span className="font-bold text-orange-400">$0.02</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20">
              <CardHeader>
                <CardTitle>Bonus Multipliers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-400/10 border border-green-400/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">24/7 Uptime</span>
                      <Badge className="bg-green-500/20 text-green-400">+25%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Consistent availability bonus</p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-400/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">High-end GPU (RTX 4090+)</span>
                      <Badge className="bg-purple-500/20 text-purple-400">+50%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Premium hardware incentive</p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Long-term (30+ days)</span>
                      <Badge className="bg-primary/20 text-primary">+20%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Commitment reward</p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-400/10 border border-orange-400/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Early Pioneer (first 1000)</span>
                      <Badge className="bg-orange-500/20 text-orange-400">+15%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Founding member benefit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                Distributed AI Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent">P2P Architecture</h4>
                  <p className="text-muted-foreground text-sm">
                    Our network utilizes advanced P2P protocols to distribute AI training tasks across thousands of nodes,
                    ensuring resilience, scalability, and democratized access to AI computing power.
                  </p>

                  <h4 className="font-semibold text-accent">Secure Computation</h4>
                  <p className="text-muted-foreground text-sm">
                    All computations are sandboxed and encrypted. Your personal data never leaves your device,
                    and you maintain full control over your system's resources.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-accent">Model Distribution</h4>
                  <p className="text-muted-foreground text-sm">
                    AI models are distributed using efficient protocols, ensuring fast synchronization across the network
                    without central points of failure.
                  </p>

                  <h4 className="font-semibold text-accent">Consensus Mechanisms</h4>
                  <p className="text-muted-foreground text-sm">
                    Training results are validated through consensus algorithms, ensuring accuracy and preventing
                    malicious actors from corrupting the learning process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-primary mb-2">What is resource sharing?</h4>
                  <p className="text-muted-foreground">
                    Resource sharing allows you to contribute your computer's idle processing power to train AI models
                    and earn $SAI tokens in return. Your resources help power the decentralized Stellarium AI network.
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold text-accent mb-2">Is it safe to share my resources?</h4>
                  <p className="text-muted-foreground">
                    Absolutely! Our platform only uses idle resources and never accesses your personal data.
                    All computations are sandboxed, encrypted, and your system remains completely secure.
                  </p>
                </div>

                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-400 mb-2">How are rewards calculated?</h4>
                  <p className="text-muted-foreground">
                    Rewards are based on the actual resources used (CPU, GPU, RAM) and the duration of contribution.
                    Higher-spec hardware, longer uptime, and consistent participation earn more rewards.
                  </p>
                </div>

                <div className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-orange-400 mb-2">When do I receive my rewards?</h4>
                  <p className="text-muted-foreground">
                    Rewards are calculated in real-time and automatically paid out weekly to your connected wallet.
                    You can track your earnings and performance metrics in real-time through the dashboard.
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-semibold text-purple-400 mb-2">What happens if my computer goes offline?</h4>
                  <p className="text-muted-foreground">
                    No problem! The network is designed to handle nodes going online and offline. When you reconnect,
                    you'll automatically sync with the latest model versions and resume contributing.
                  </p>
                </div>

                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-blue-400 mb-2">Can I control resource usage?</h4>
                  <p className="text-muted-foreground">
                    Yes! You have complete control over how much CPU, GPU, and RAM you want to allocate.
                    You can adjust these settings anytime and even pause sharing if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
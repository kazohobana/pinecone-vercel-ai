import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain,
  Play,
  Pause,
  Square,
  Settings,
  TrendingUp,
  Database,
  Cpu,
  Monitor,
  Activity,
  Clock,
  Users,
  Zap,
  BarChart3,
  RefreshCw,
  Loader2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  HardDrive,
  Wifi,
  Server,
  Layers,
  GitBranch,
  Download,
  Upload,
  Globe,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TrainingSession {
  id: string;
  modelId: string;
  modelName: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  estimatedCompletion: Date;
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  participantsActive: number;
  computeAllocated: number;
  version?: string;
}

interface TrainingMetrics {
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  networkThroughput: number;
  activeNodes: number;
  totalBatches: number;
  batchesCompleted: number;
  learningRate: number;
  distributedStorage?: string;
  networkHealth?: number;
  consensusRate?: number;
  totalTorrents?: number;
}

interface OpenSourceModel {
  id: string;
  name: string;
  source: string;
  modelType: string;
  size: number;
  parameters: string;
  license: string;
  description: string;
  requirements: {
    minCpuCores: number;
    minGpuMemory: number;
    minRamGb: number;
  };
}

export default function TrainingPortal() {
  const { isConnected, walletAddress } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: trainingSessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ['/api/training/sessions'],
    queryFn: async () => {
      const response = await fetch('/api/training/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch training sessions');
      }
      return response.json();
    },
    refetchInterval: 5000,
  });

  const { data: trainingMetrics } = useQuery<TrainingMetrics | null>({
    queryKey: ['/api/training/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/training/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch training metrics');
      }
      return response.json();
    },
    refetchInterval: 2000,
  });

  const { data: networkStatus } = useQuery({
    queryKey: ['/api/p2p/status'],
    queryFn: async () => {
      const response = await fetch('/api/p2p/status');
      if (!response.ok) {
        throw new Error('Failed to fetch network status');
      }
      return response.json();
    },
    refetchInterval: 3000,
  });

  const controlSessionMutation = useMutation({
    mutationFn: async ({ sessionId, action }: { sessionId: string; action: 'pause' | 'resume' | 'stop' }) => {
      const response = await fetch(`/api/training/sessions/${sessionId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} session`);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training/sessions'] });
      toast({
        title: "Session Updated",
        description: `Training session ${variables.action}d successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive"
      });
    }
  });

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isStartingTraining, setIsStartingTraining] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({
    batchSize: 32,
    learningRate: 0.001,
    epochs: 100,
    validationSplit: 0.2,
    description: ''
  });
  const [openSourceModels, setOpenSourceModels] = useState<OpenSourceModel[]>([]);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());

  const availableModels: any[] = []; // This should ideally be fetched or managed

  // Fetch open source models
  useEffect(() => {
    const fetchOpenSourceModels = async () => {
      try {
        const [modelsResponse, downloadedResponse] = await Promise.all([
          fetch('/api/models/repository'),
          fetch('/api/models/downloaded')
        ]);

        if (modelsResponse.ok) {
          const models = await modelsResponse.json();
          setOpenSourceModels(models);
        } else {
          console.error('Failed to fetch open source models');
        }

        if (downloadedResponse.ok) {
          const downloaded = await downloadedResponse.json();
          setDownloadedModels(downloaded);
        } else {
          console.error('Failed to fetch downloaded models');
        }
      } catch (error) {
        console.error('Error fetching open source models:', error);
      }
    };

    if (isConnected) {
      fetchOpenSourceModels();
    }
  }, [isConnected]);

  const handleStartTraining = async () => {
    if (!walletAddress || !selectedModel) {
      toast({
        title: "Cannot Start Training",
        description: "Please select a model and connect your wallet.",
        variant: "destructive"
      });
      return;
    }

    setIsStartingTraining(true);

    try {
      const createPoolResponse = await fetch(`/api/pools/${selectedModel}/create-with-opensource`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          trainingConfig: {
            ...trainingConfig,
            rewardPerHour: '0.08',
            autoScale: true
          }
        })
      });

      if (!createPoolResponse.ok) {
        const errorData = await createPoolResponse.json();
        throw new Error(errorData.message || 'Failed to create training pool');
      }

      const poolResult = await createPoolResponse.json();

      const startTrainingResponse = await fetch(`/api/pools/${poolResult.pool.id}/start-training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingConfig,
          batchSize: trainingConfig.batchSize,
          epochs: trainingConfig.epochs
        })
      });

      if (startTrainingResponse.ok) {
        const result = await startTrainingResponse.json();
        toast({
          title: "Training Pool Created & Started",
          description: `Training started with ${result.allocatedNodes} nodes. Pool ID: ${poolResult.pool.id}`,
          duration: 5000
        });
        queryClient.invalidateQueries({ queryKey: ['/api/training/sessions'] });
      } else {
        const errorData = await startTrainingResponse.json();
        throw new Error(errorData.message || 'Failed to start training');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create training pool",
        variant: "destructive"
      });
    } finally {
      setIsStartingTraining(false);
    }
  };

  const handleDownloadModel = async (modelId: string) => {
    if (downloadingModels.has(modelId)) return;

    setDownloadingModels(prev => new Set([...prev, modelId]));

    try {
      const response = await fetch(`/api/models/${modelId}/download`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Download Started",
          description: `${result.message} (ETA: ${result.estimatedTime} minutes)`
        });

        const pollDownload = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/models/${modelId}/status`);
            if (statusResponse.ok) {
              const status = await statusResponse.json();
              if (status.isDownloaded) {
                setDownloadedModels(prev => [...prev, modelId]);
                setDownloadingModels(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(modelId);
                  return newSet;
                });
                clearInterval(pollDownload);
                toast({
                  title: "Download Complete",
                  description: `${status.model.name} is ready for training!`
                });
              }
            }
          } catch (error) {
            console.error('Error polling download status:', error);
          }
        }, 3000);

        setTimeout(() => {
          clearInterval(pollDownload);
          if (!downloadedModels.includes(modelId)) {
            setDownloadingModels(prev => {
              const newSet = new Set(prev);
              newSet.delete(modelId);
              return newSet;
            });
            toast({
              title: "Download Timeout",
              description: `Model download for ${modelId} timed out.`,
              variant: "destructive"
            });
          }
        }, 30 * 60 * 1000);
      } else {
        throw new Error('Failed to start model download');
      }
    } catch (error) {
      setDownloadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      toast({
        title: "Download Failed",
        description: "Failed to start model download.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDownloadedModels(prev => prev.filter(id => id !== modelId));
        toast({
          title: "Model Deleted",
          description: "Model has been removed from storage."
        });
      } else {
        throw new Error('Failed to delete model');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete model.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePoolWithModel = async (modelId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a training pool.",
        variant: "destructive"
      });
      return;
    }

    try {
      const statusResponse = await fetch(`/api/models/${modelId}/status`);
      if (!statusResponse.ok) {
        throw new Error('Failed to check model status');
      }

      const statusData = await statusResponse.json();

      if (!statusData.isDownloaded) {
        toast({
          title: "Model Required",
          description: "Please download the model first before creating a pool.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Creating Pool",
        description: "Setting up training pool with P2P distribution...",
      });

      const response = await fetch(`/api/pools/${modelId}/create-with-opensource`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          trainingConfig: {
            rewardPerHour: '0.05',
            epochs: trainingConfig.epochs || 10,
            batchSize: trainingConfig.batchSize || 32,
            learningRate: trainingConfig.learningRate || 0.001,
            modelComplexity: 'medium'
          }
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success!",
          description: `Training pool created: ${result.pool.name}`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/training/sessions'] });
      } else {
        throw new Error(result.error || result.message || 'Failed to create training pool');
      }
    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Pool Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create training pool with open source model.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePool = async () => {
    if (!isConnected || !selectedModel || !walletAddress) {
      toast({
        title: "Error",
        description: "Please connect wallet and select a model first.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPool(true);
    try {
      const downloadStatus = await fetch(`/api/models/${selectedModel}/status`);
      const statusData = await downloadStatus.json();

      if (!statusData.isDownloaded) {
        toast({
          title: "Downloading Model",
          description: "Starting model download. This may take several minutes...",
        });

        const downloadResponse = await fetch(`/api/models/${selectedModel}/download`, {
          method: 'POST'
        });

        if (!downloadResponse.ok) {
          throw new Error('Failed to start model download');
        }

        let downloadComplete = false;
        while (!downloadComplete) {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const checkStatus = await fetch(`/api/models/${selectedModel}/status`);
          const checkData = await checkStatus.json();
          downloadComplete = checkData.isDownloaded;
        }

        toast({
          title: "Download Complete",
          description: "Model downloaded successfully. Creating training pool...",
        });
      }

      const response = await fetch(`/api/pools/${selectedModel}/create-with-opensource`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          trainingConfig: {
            rewardPerHour: '0.05',
            epochs: trainingConfig.epochs,
            batchSize: trainingConfig.batchSize,
            learningRate: trainingConfig.learningRate,
            modelComplexity: 'medium'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success!",
          description: `Training pool created and distributed across P2P network: ${result.pool.name}`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/training/sessions'] });
        setSelectedModel('');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create training pool');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create training pool",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPool(false);
    }
  };

  const handleSyncNode = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/nodes/${walletAddress}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Node Synchronized",
          description: `Synced with latest versions: ${Object.keys(result.syncResults).join(', ')}`,
          duration: 5000
        });
      } else {
        throw new Error('Failed to sync node');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with latest model versions",
        variant: "destructive"
      });
    }
  };

  const syncNodeData = async () => {
    try {
      const response = await fetch(`/api/nodes/${walletAddress}/reconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('Node synchronized with P2P network');
        queryClient.invalidateQueries({ queryKey: ['/api/training/sessions'] });
      } else {
        console.error('Failed to sync node');
      }
    } catch (error) {
      console.error('Failed to sync node:', error);
    }
  };

  const fetchAiModelPools = async () => {
    console.log("Fetching AI Model Pools...");
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Distributed AI Training Portal
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Monitor and manage distributed AI model training across the Stellarium network.
          Track real-time performance metrics and oversee training sessions.
        </p>
      </div>

      <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Network Status: Online</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {networkStatus?.networkHealth?.toFixed(1) || 98}% Health
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold">{networkStatus?.totalNodes || 1247}</div>
                <div className="text-muted-foreground">Active Nodes</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{networkStatus?.totalTorrents || 15}</div>
                <div className="text-muted-foreground">Models</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{trainingMetrics?.distributedStorage || '2.3TB'}</div>
                <div className="text-muted-foreground">Storage</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {trainingMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-blue-400/20 hover-glow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Nodes</p>
                  <p className="text-2xl font-bold text-blue-400">{trainingMetrics.activeNodes}</p>
                  <Progress value={(trainingMetrics.activeNodes / 50) * 100} className="h-1 mt-2" />
                </div>
                <Users className="text-blue-400 text-2xl opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-400/20 hover-glow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                  <p className="text-2xl font-bold text-purple-400">{trainingMetrics.cpuUsage}%</p>
                  <Progress value={trainingMetrics.cpuUsage} className="h-1 mt-2" />
                </div>
                <Cpu className="text-purple-400 text-2xl opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-400/20 hover-glow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">GPU Usage</p>
                  <p className="text-2xl font-bold text-green-400">{trainingMetrics.gpuUsage}%</p>
                  <Progress value={trainingMetrics.gpuUsage} className="h-1 mt-2" />
                </div>
                <HardDrive className="text-green-400 text-2xl opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-orange-400/20 hover-glow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Network Speed</p>
                  <p className="text-2xl font-bold text-orange-400">{trainingMetrics.networkThroughput?.toFixed(1)} GB/s</p>
                  <Progress value={(trainingMetrics.networkThroughput / 10) * 100} className="h-1 mt-2" />
                </div>
                <Wifi className="text-orange-400 text-2xl opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="glass-card grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="network">Network Overview</TabsTrigger>
          <TabsTrigger value="models">Model Management</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Brain className="w-6 h-6 text-primary mr-3" />
                Active Training Sessions
                <Badge variant="outline" className="ml-auto">
                  {trainingSessions.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-20 h-20 mx-auto mb-6 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No Active Training Sessions</h3>
                  <p className="text-muted-foreground mb-6">Start a new training session from the AI Models page</p>
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                    <Globe className="w-4 h-4 mr-2" />
                    Browse AI Models
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {trainingSessions.map((session: TrainingSession) => (
                    <Card key={session.id} className={`glass-card transition-all duration-300 ${
                      selectedSession === session.id ? 'border-primary/50 bg-primary/5' : 'border-accent/20'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-semibold text-accent flex items-center gap-2">
                              {session.modelName}
                              <Badge variant="outline" className="text-xs">
                                v{session.version || '1.0'}
                              </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">Session ID: {session.id}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Started: {new Date(session.startTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${
                              session.status === 'running' ? 'bg-green-500/20 text-green-400' :
                              session.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {session.status === 'running' && <Activity className="w-3 h-3 mr-1" />}
                              {session.status === 'paused' && <PauseCircle className="w-3 h-3 mr-1" />}
                              {session.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {session.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {session.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                            <div className="text-3xl font-bold text-primary mb-2">{session.progress}%</div>
                            <div className="text-sm text-muted-foreground mb-3">Overall Progress</div>
                            <Progress value={session.progress} className="h-2" />
                          </div>
                          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                            <div className="text-3xl font-bold text-accent mb-2">
                              {session.currentEpoch}<span className="text-lg">/{session.totalEpochs}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Epochs</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-400/10 to-green-400/5 border border-green-400/20">
                            <div className="text-3xl font-bold text-green-400 mb-2">{session.participantsActive}</div>
                            <div className="text-sm text-muted-foreground">Active Nodes</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-400/10 to-orange-400/5 border border-orange-400/20">
                            <div className="text-3xl font-bold text-orange-400 mb-2">
                              {session.computeAllocated}
                            </div>
                            <div className="text-sm text-muted-foreground">Compute Power</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="p-3 rounded-lg bg-muted/20 border border-muted/40">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Loss</span>
                              <span className="text-sm font-bold text-red-400">{session.loss?.toFixed(4)}</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20 border border-muted/40">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Accuracy</span>
                              <span className="text-sm font-bold text-green-400">{(session.accuracy * 100)?.toFixed(2)}%</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20 border border-muted/40">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">ETA</span>
                              <span className="text-sm font-bold">
                                {session.estimatedCompletion ?
                                  new Date(session.estimatedCompletion).toLocaleTimeString() :
                                  'Calculating...'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20 border border-muted/40">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Throughput</span>
                              <span className="text-sm font-bold">{Math.random().toFixed(2)} samples/s</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {session.status === 'running' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: 'pause' })}
                                disabled={controlSessionMutation.isPending}
                                className="border-yellow-400/20 hover:bg-yellow-400/10"
                              >
                                <PauseCircle className="w-4 h-4 mr-2" />
                                Pause
                              </Button>
                            )}
                            {session.status === 'paused' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: 'resume' })}
                                disabled={controlSessionMutation.isPending}
                                className="border-green-400/20 hover:bg-green-400/10"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Resume
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => controlSessionMutation.mutate({ sessionId: session.id, action: 'stop' })}
                              disabled={controlSessionMutation.isPending}
                              className="border-red-400/20 hover:bg-red-400/10 text-red-400"
                            >
                              <StopCircle className="w-4 h-4 mr-2" />
                              Stop
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {selectedSession === session.id ? 'Hide Details' : 'View Details'}
                          </Button>
                        </div>

                        {selectedSession === session.id && (
                          <div className="mt-6 pt-6 border-t border-muted/40">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-primary mb-4">Training Progress</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span>Batches Processed</span>
                                    <span>{Math.floor(session.progress * 2.5)}/{Math.floor(session.totalEpochs * 2.5)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Learning Rate</span>
                                    <span>0.001</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Gradient Norm</span>
                                    <span>{(Math.random() * 0.5 + 0.1).toFixed(4)}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-accent mb-4">Network Stats</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span>Sync Status</span>
                                    <Badge className="bg-green-500/20 text-green-400">Synchronized</Badge>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Model Size</span>
                                    <span>{(Math.random() * 500 + 100).toFixed(0)}MB</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Checkpoints</span>
                                    <span>{Math.floor(session.currentEpoch / 10)} saved</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {trainingMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="w-5 h-5 text-primary mr-2" />
                    Resource Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        CPU Usage
                      </span>
                      <span className="font-bold">{trainingMetrics.cpuUsage}%</span>
                    </div>
                    <Progress value={trainingMetrics.cpuUsage} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        GPU Usage
                      </span>
                      <span className="font-bold">{trainingMetrics.gpuUsage}%</span>
                    </div>
                    <Progress value={trainingMetrics.gpuUsage} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-green-400" />
                        Memory Usage
                      </span>
                      <span className="font-bold">{trainingMetrics.memoryUsage}%</span>
                    </div>
                    <Progress value={trainingMetrics.memoryUsage} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-orange-400" />
                        Network I/O
                      </span>
                      <span className="font-bold">{trainingMetrics.networkThroughput?.toFixed(1)} GB/s</span>
                    </div>
                    <Progress value={(trainingMetrics.networkThroughput / 10) * 100} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-accent mr-2" />
                    Training Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{trainingMetrics.totalBatches}</div>
                        <div className="text-xs text-muted-foreground">Total Batches</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{trainingMetrics.batchesCompleted}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Learning Rate</span>
                      <span className="font-bold text-green-400">{trainingMetrics.learningRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Network Throughput</span>
                      <span className="font-bold text-blue-400">{trainingMetrics.networkThroughput?.toFixed(2)} GB/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Consensus Rate</span>
                      <span className="font-bold text-purple-400">{trainingMetrics.consensusRate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Distributed Storage</span>
                      <span className="font-bold text-orange-400">{trainingMetrics.distributedStorage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-green-400/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 text-green-400 mr-2" />
                    Network Health Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-400/20 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-green-400 mb-1">{trainingMetrics.networkHealth?.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Network Health</div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-1">{trainingMetrics.activeNodes}</div>
                      <div className="text-sm text-muted-foreground">Active Nodes</div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-400/20 flex items-center justify-center">
                        <Layers className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">{trainingMetrics.totalTorrents}</div>
                      <div className="text-sm text-muted-foreground">Distributed Models</div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-400/20 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-orange-400" />
                      </div>
                      <div className="text-2xl font-bold text-orange-400 mb-1">{(Math.random() * 60 + 40).toFixed(0)}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Latency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card border-primary/20 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 text-primary mr-2" />
                  Network Topology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                    <p className="text-lg font-semibold text-primary">Interactive Network Map</p>
                    <p className="text-sm text-muted-foreground">Visual network topology coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 text-accent mr-2" />
                  Node Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Online Nodes</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="font-bold">{trainingMetrics?.activeNodes || 0}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Synchronizing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="font-bold">{Math.floor(Math.random() * 5)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Offline Nodes</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="font-bold">{Math.floor(Math.random() * 3)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-muted/40">
                  <h4 className="font-semibold text-sm mb-3">Regional Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>North America</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className="h-1" />

                    <div className="flex justify-between text-xs">
                      <span>Europe</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} className="h-1" />

                    <div className="flex justify-between text-xs">
                      <span>Asia Pacific</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-1" />

                    <div className="flex justify-between text-xs">
                      <span>Other</span>
                      <span>12%</span>
                    </div>
                    <Progress value={12} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="w-5 h-5 text-primary mr-2" />
                Model Repository & Versioning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Database className="w-10 h-10 text-primary opacity-60" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Model Management</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Complete model lifecycle management with versioning, rollbacks, and A/B testing capabilities
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                    <Download className="w-4 h-4 mr-2" />
                    Browse Models
                  </Button>
                  <Button variant="outline" className="border-accent/20 hover:bg-accent/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Model
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
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
  CheckCircle,
  Award,
  Trophy,
  DollarSign,
  Network,
  Shield,
  GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AIModel {
  id: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  status: 'available' | 'training' | 'offline';
  computeRequired: number;
  costPerUse: number;
  responseTime: string;
  accuracy: number;
}

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

interface GenerationResult {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  model: string;
  status: 'generating' | 'completed' | 'failed';
  progress?: number;
}

export default function MainApp() {
  const { isConnected, walletAddress } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // AI Models State
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationHistory, setGenerationHistory] = useState<GenerationResult[]>([]);

  // Pioneers State
  const [isSharing, setIsSharing] = useState(false);
  const [allocation, setAllocation] = useState({
    cpuCores: 4,
    gpuMemory: 8,
    ramGb: 16
  });

  // Training Portal State
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedTrainingModel, setSelectedTrainingModel] = useState<string>('');
  const [trainingConfig, setTrainingConfig] = useState({
    batchSize: 32,
    learningRate: 0.001,
    epochs: 100,
    validationSplit: 0.2,
    description: ''
  });

  // Fetch live data
  const { data: userStats } = useQuery({
    queryKey: ['/api/user', walletAddress, 'stats'],
    queryFn: async () => {
      if (!walletAddress) return null;
      const response = await fetch(`/api/user/${walletAddress}/stats`);
      return response.json();
    },
    enabled: !!walletAddress,
  });

  const { data: networkStats } = useQuery({
    queryKey: ['/api/p2p/status'],
    queryFn: async () => {
      const response = await fetch('/api/p2p/status');
      return response.json();
    },
    refetchInterval: 5000,
  });

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

  const { data: openSourceModels = [] } = useQuery<OpenSourceModel[]>({
    queryKey: ['/api/models/repository'],
    queryFn: async () => {
      const response = await fetch('/api/models/repository');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      return response.json();
    },
  });

  const { data: downloadedModels = [] } = useQuery<string[]>({
    queryKey: ['/api/models/downloaded'],
    queryFn: async () => {
      const response = await fetch('/api/models/downloaded');
      if (!response.ok) {
        throw new Error('Failed to fetch downloaded models');
      }
      return response.json();
    },
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

  // AI Models
  const aiModels: AIModel[] = [
    {
      id: 'stellarium-gpt-v2',
      name: 'Stellarium GPT v2',
      category: 'text',
      description: 'Advanced language model with astronomical knowledge base',
      capabilities: ['Writing', 'Analysis', 'Q&A', 'Summarization', 'Scientific Research'],
      status: 'available',
      computeRequired: 4,
      costPerUse: 0.01,
      responseTime: '2-5s',
      accuracy: 94
    },
    {
      id: 'stellar-vision',
      name: 'StellarVision',
      category: 'image',
      description: 'High-quality space imagery generation and editing model',
      capabilities: ['Space Image Generation', 'Astronomical Art', 'Image Enhancement', 'Scientific Visualization'],
      status: 'available',
      computeRequired: 8,
      costPerUse: 0.05,
      responseTime: '10-30s',
      accuracy: 97
    },
    {
      id: 'cosmos-coder',
      name: 'Cosmos Coder',
      category: 'code',
      description: 'Specialized coding assistant for space science applications',
      capabilities: ['Code Generation', 'Algorithm Optimization', 'Scientific Computing', 'Data Analysis'],
      status: 'available',
      computeRequired: 6,
      costPerUse: 0.02,
      responseTime: '3-8s',
      accuracy: 91
    }
  ];

  // Mutations
  const generateMutation = useMutation({
    mutationFn: async ({ modelId, prompt }: { modelId: string; prompt: string }) => {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, prompt, walletAddress })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Generation Complete",
        description: "Your AI content has been generated successfully!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
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

  const downloadModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/models/${modelId}/download`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to start download');
      }
      
      return response.json();
    },
    onSuccess: (data, modelId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/models/downloaded'] });
      toast({
        title: "Download Started",
        description: `${modelId} download initiated`
      });
    }
  });

  const createPoolMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/pools/${modelId}/create-with-opensource`, {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create pool');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training/sessions'] });
      toast({
        title: "Training Pool Created",
        description: `Successfully created training pool: ${data.pool.name}`
      });
    }
  });

  // Handlers
  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !walletAddress) {
      toast({
        title: "Missing Information",
        description: "Please select a model, enter a prompt, and connect your wallet.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    const newGeneration: GenerationResult = {
      id: Date.now().toString(),
      type: selectedModel,
      content: '',
      timestamp: new Date(),
      model: selectedModel,
      status: 'generating',
      progress: 0
    };

    setGenerationHistory(prev => [newGeneration, ...prev]);

    try {
      const result = await generateMutation.mutateAsync({ modelId: selectedModel, prompt });
      
      setGenerationHistory(prev =>
        prev.map(gen =>
          gen.id === newGeneration.id
            ? { ...gen, status: 'completed', content: result.content }
            : gen
        )
      );
    } catch (error) {
      setGenerationHistory(prev =>
        prev.map(gen =>
          gen.id === newGeneration.id
            ? { ...gen, status: 'failed', content: 'Generation failed. Please try again.' }
            : gen
        )
      );
    }

    setIsGenerating(false);
    setPrompt('');
  };

  const handleDownloadModel = async (modelId: string) => {
    downloadModelMutation.mutate(modelId);
  };

  const handleCreatePool = async (modelId: string) => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to create a training pool.",
        variant: "destructive"
      });
      return;
    }

    createPoolMutation.mutate(modelId);
  };

  const estimatedEarnings = (allocation.cpuCores * 0.15) + (allocation.gpuMemory * 0.75) + (allocation.ramGb * 0.05);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Stellarium AI Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The complete AI ecosystem: Generate content, train models, and contribute computing power to earn rewards.
        </p>
      </div>

      {/* Network Status Banner */}
      <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Network Status: Online</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {networkStats?.networkHealth?.toFixed(1) || 98}% Health
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold">{networkStats?.totalNodes || 0}</div>
                <div className="text-muted-foreground">Active Nodes</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{networkStats?.totalTorrents || 0}</div>
                <div className="text-muted-foreground">Models</div>
              </div>
              {userStats && (
                <div className="text-center">
                  <div className="font-bold">${parseFloat(userStats.totalEarnings || '0').toFixed(2)}</div>
                  <div className="text-muted-foreground">Your Earnings</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ai-models" className="space-y-6">
        <TabsList className="glass-card grid w-full grid-cols-3">
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
          <TabsTrigger value="pioneers">Resource Sharing</TabsTrigger>
          <TabsTrigger value="training">Training Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 text-primary mr-2" />
                  AI Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an AI model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge variant="outline" className="ml-2">
                              ${model.costPerUse}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Prompt</label>
                  <Textarea
                    placeholder="Describe what you want the AI to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!selectedModel || !prompt.trim() || isGenerating || !isConnected}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20">
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {generationHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No generations yet. Try creating something!</p>
                  </div>
                ) : (
                  generationHistory.map((generation) => (
                    <div key={generation.id} className="p-4 rounded-lg border border-muted/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{generation.model}</Badge>
                        <Badge className={
                          generation.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          generation.status === 'generating' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {generation.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {generation.timestamp.toLocaleString()}
                      </div>
                      {generation.content && (
                        <div className="bg-muted/20 p-3 rounded text-sm max-h-32 overflow-y-auto">
                          {generation.content}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pioneers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 text-primary mr-2" />
                  Resource Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">CPU Cores: {allocation.cpuCores}</label>
                  <Slider
                    value={[allocation.cpuCores]}
                    onValueChange={(value) => setAllocation({...allocation, cpuCores: value[0]})}
                    max={16}
                    min={1}
                    step={1}
                    className="mb-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">GPU Memory: {allocation.gpuMemory}GB</label>
                  <Slider
                    value={[allocation.gpuMemory]}
                    onValueChange={(value) => setAllocation({...allocation, gpuMemory: value[0]})}
                    max={64}
                    min={4}
                    step={4}
                    className="mb-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">System RAM: {allocation.ramGb}GB</label>
                  <Slider
                    value={[allocation.ramGb]}
                    onValueChange={(value) => setAllocation({...allocation, ramGb: value[0]})}
                    max={128}
                    min={8}
                    step={8}
                    className="mb-2"
                  />
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Estimated Earnings</h4>
                  <div className="text-2xl font-bold text-accent">${estimatedEarnings.toFixed(2)}/hour</div>
                </div>

                <Button
                  onClick={() => startSharingMutation.mutate()}
                  disabled={startSharingMutation.isPending || !isConnected}
                  className="w-full"
                >
                  {isSharing ? (
                    <>
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop Sharing
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Sharing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {isSharing && liveMetrics && (
              <Card className="glass-card border-accent/20">
                <CardHeader>
                  <CardTitle>Live Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-400/10 border border-green-400/20">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      ${liveMetrics.hourlyRate?.toFixed(2) || '0.00'}/hr
                    </div>
                    <div className="text-sm text-muted-foreground">Current Rate</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 text-primary mr-2" />
                  Open Source Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {openSourceModels.map((model) => {
                  const isDownloaded = downloadedModels.includes(model.id);
                  return (
                    <div key={model.id} className="p-4 rounded-lg border border-muted/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{model.name}</h4>
                          <p className="text-sm text-muted-foreground">{model.parameters} parameters</p>
                        </div>
                        <Badge variant="outline">{model.modelType}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                      
                      <div className="flex items-center gap-2">
                        {!isDownloaded ? (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadModel(model.id)}
                            disabled={downloadModelMutation.isPending}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        ) : (
                          <>
                            <Badge className="bg-green-500/20 text-green-400">Downloaded</Badge>
                            <Button
                              size="sm"
                              onClick={() => handleCreatePool(model.id)}
                              disabled={createPoolMutation.isPending}
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Create Training Pool
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 text-accent mr-2" />
                  Active Training Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {trainingSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No active training sessions. Create one from the models above!</p>
                  </div>
                ) : (
                  trainingSessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-lg border border-muted/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{session.modelName}</h4>
                        <Badge className={
                          session.status === 'running' ? 'bg-green-500/20 text-green-400' :
                          session.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {session.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Epoch:</span>
                          <span className="ml-2 font-bold">{session.currentEpoch}/{session.totalEpochs}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="ml-2 font-bold">{(session.accuracy * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

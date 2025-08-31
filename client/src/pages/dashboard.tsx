import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TokenPurchase from "@/components/token-purchase";
import PersonalDashboard from "@/components/personal-dashboard";
import { useWallet } from "@/hooks/use-wallet";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { walletAddress } = useWallet();
  const [timeRemaining, setTimeRemaining] = useState("72:15:43");

  const { data: currentStage } = useQuery<any>({
    queryKey: ['/api/stages/current'],
  });

  const { data: settings } = useQuery<any>({
    queryKey: ['/api/settings'],
  });

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 3);
      endTime.setHours(endTime.getHours() + 2);
      endTime.setMinutes(endTime.getMinutes() + 15);
      
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!currentStage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ICO data...</p>
        </div>
      </div>
    );
  }

  const progress = currentStage.totalTokens > 0 ? (currentStage.soldTokens / currentStage.totalTokens) * 100 : 0;
  const tokensRemaining = currentStage.totalTokens - currentStage.soldTokens;

  return (
    <div className="space-y-8">
      {/* ICO Status Header */}
      <Card className="glass-card rounded-xl border-primary/10 neon-glow floating-animation" data-testid="card-ico-status">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Stellarium AI ICO
            </h2>
            <p className="text-muted-foreground">Revolutionary AI-powered astronomical platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-current-stage">
                {currentStage.name}
              </div>
              <div className="text-sm text-muted-foreground">Current Stage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent" data-testid="text-token-price">
                ${currentStage.tokenPrice}
              </div>
              <div className="text-sm text-muted-foreground">Per $SAI Token</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400" data-testid="text-time-remaining">
                {timeRemaining}
              </div>
              <div className="text-sm text-muted-foreground">Time Remaining</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span data-testid="text-progress">
                {currentStage.soldTokens.toLocaleString()} / {currentStage.totalTokens.toLocaleString()} SAI
              </span>
            </div>
            <Progress value={progress} className="h-3" data-testid="progress-ico" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span data-testid="text-raised-amount">
                ${(currentStage.soldTokens * parseFloat(currentStage.tokenPrice)).toLocaleString()} raised
              </span>
              <span data-testid="text-progress-percent">{progress.toFixed(1)}% complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Purchase */}
        {settings?.features?.purchase && (
          <div className="lg:col-span-2">
            <TokenPurchase currentStage={currentStage} />
          </div>
        )}
        
        {/* Personal Dashboard */}
        {settings?.features?.dashboard && walletAddress && (
          <div className={settings?.features?.purchase ? "" : "lg:col-span-3"}>
            <PersonalDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

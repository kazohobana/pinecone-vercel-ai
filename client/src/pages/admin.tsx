import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import FundsChart from "@/components/charts/funds-chart";
import StageManagement from "@/components/admin/stage-management";
import FeatureToggles from "@/components/admin/feature-toggles";
import { BarChart3, DollarSign, Users, Coins, TrendingUp, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useWallet } from "@/hooks/use-wallet";

export default function Admin() {
  const { walletAddress } = useWallet();
  const { isAdmin, isLoading } = useAdmin();
  
  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'X-Wallet-Address': walletAddress || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: isAdmin && !!walletAddress,
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions', {
        headers: {
          'X-Wallet-Address': walletAddress || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: isAdmin && !!walletAddress,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-xl font-bold mb-2">Wallet Connection Required</h3>
            <p className="text-muted-foreground">Please connect your wallet to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-xl font-bold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You do not have administrator privileges.</p>
            <p className="text-sm text-muted-foreground mt-2">Wallet: {walletAddress}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate daily transactions for the last 7 days
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: transactions.filter((tx: any) => {
        const txDate = new Date(tx.createdAt);
        return txDate.toDateString() === date.toDateString() && tx.status === 'completed';
      }).length
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
          Admin Analytics Dashboard
        </h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-primary/20" data-testid="card-total-raised">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-total-raised">
                    ${analytics?.totalRaised?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-accent/20" data-testid="card-total-participants">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold text-accent" data-testid="text-total-participants">
                    {analytics?.totalParticipants || 0}
                  </p>
                </div>
                <Users className="text-accent text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-green-400/20" data-testid="card-tokens-sold">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Sold</p>
                  <p className="text-2xl font-bold text-green-400" data-testid="text-tokens-sold">
                    {analytics?.totalTokensSold ? `${(analytics.totalTokensSold / 1000000).toFixed(1)}M SAI` : '0 SAI'}
                  </p>
                </div>
                <Coins className="text-green-400 text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-orange-400/20" data-testid="card-avg-purchase">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Purchase</p>
                  <p className="text-2xl font-bold text-orange-400" data-testid="text-avg-purchase">
                    ${analytics?.avgPurchase?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="text-orange-400 text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="stages" data-testid="tab-stages">Stage Management</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card rounded-xl" data-testid="card-funds-chart">
              <CardHeader>
                <CardTitle className="text-xl">Funds Raised by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <FundsChart data={analytics?.fundsByStage || []} />
              </CardContent>
            </Card>
            
            <Card className="glass-card rounded-xl" data-testid="card-daily-transactions">
              <CardHeader>
                <CardTitle className="text-xl">Daily Transactions (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {last7Days.map((day, index) => (
                    <div key={index} className="flex justify-between items-center" data-testid={`daily-tx-${index}`}>
                      <span className="text-sm text-muted-foreground">{day.label}</span>
                      <span className="font-medium">{day.count} transactions</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stages">
          <StageManagement />
        </TabsContent>

        <TabsContent value="settings">
          <FeatureToggles />
        </TabsContent>
      </Tabs>
    </div>
  );
}

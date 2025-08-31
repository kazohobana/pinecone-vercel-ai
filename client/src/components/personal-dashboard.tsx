import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

export default function PersonalDashboard() {
  const { walletAddress } = useWallet();

  const { data: participant } = useQuery<any>({
    queryKey: ['/api/participants', walletAddress],
    enabled: !!walletAddress,
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ['/api/transactions', participant?.id],
    enabled: !!participant?.id,
  });

  const { data: currentStage } = useQuery<any>({
    queryKey: ['/api/stages/current'],
  });

  if (!participant) {
    return (
      <Card className="glass-card rounded-xl border-accent/10" data-testid="card-personal-dashboard">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <UserCircle className="w-5 h-5 text-accent mr-3" />
            Your Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Connect your wallet to view your portfolio
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTokenValue = currentStage 
    ? participant.tokenBalance * parseFloat(currentStage.tokenPrice) 
    : 0;

  return (
    <Card className="glass-card rounded-xl border-accent/10" data-testid="card-personal-dashboard">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <UserCircle className="w-5 h-5 text-accent mr-3" />
          Your Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="glass-card border-accent/20">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total $SAI Balance</div>
            <div className="text-2xl font-bold text-accent" data-testid="text-user-token-balance">
              {participant.tokenBalance.toLocaleString()} SAI
            </div>
            <div className="text-xs text-muted-foreground" data-testid="text-user-balance-usd">
              ~${currentTokenValue.toFixed(2)} USD
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-green-400/20">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Invested</div>
            <div className="text-xl font-bold text-green-400" data-testid="text-total-invested">
              ${parseFloat(participant.totalInvested).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Transactions</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto" data-testid="list-transaction-history">
            {transactions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No transactions yet
              </div>
            ) : (
              transactions.slice(0, 5).map((tx, index) => (
                <Card key={tx.id} className="glass-card border-green-400/20" data-testid={`transaction-${index}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">{tx.tokens.toLocaleString()} SAI</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">
                          ${parseFloat(tx.amountUSD).toLocaleString()}
                        </div>
                        <div className={`text-xs capitalize ${
                          tx.status === 'completed' ? 'text-green-400' : 
                          tx.status === 'failed' ? 'text-red-400' : 
                          'text-yellow-400'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Wallet, X } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

export default function WalletConnection() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet, isConnecting } = useWallet();

  if (isConnected && walletAddress) {
    return (
      <div className="glass-card px-4 py-2 rounded-lg" data-testid="wallet-connected">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium" data-testid="text-wallet-address">
            {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            className="text-muted-foreground hover:text-foreground p-1 h-auto"
            data-testid="button-disconnect-wallet"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-2 font-medium transition-all duration-300 neon-glow"
      data-testid="button-connect-wallet"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}

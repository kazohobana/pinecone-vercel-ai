import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Check for existing wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('stellarium_wallet');
    if (savedWallet) {
      setWalletAddress(savedWallet);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Check if Web3 is available
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setIsConnected(true);
          localStorage.setItem('stellarium_wallet', address);
          
          // Create participant record
          await fetch('/api/participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address })
          });
          
          toast({
            title: "Wallet Connected",
            description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          });
        }
      } else {
        // Fallback to rewon.io API
        const rewonApiKey = import.meta.env.VITE_REWON_API_KEY;
        if (rewonApiKey) {
          // TODO: Implement rewon.io API integration
          // For now, simulate wallet connection
          const mockAddress = '0x' + Math.random().toString(16).substring(2, 42).toUpperCase();
          setWalletAddress(mockAddress);
          setIsConnected(true);
          localStorage.setItem('stellarium_wallet', mockAddress);
          
          toast({
            title: "Wallet Connected",
            description: "Connected via Rewon.io",
          });
        } else {
          throw new Error("No Web3 wallet detected and Rewon.io API key not configured");
        }
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    localStorage.removeItem('stellarium_wallet');
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      walletAddress,
      connectWallet,
      disconnectWallet,
      isConnecting
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Extend window type for Web3
declare global {
  interface Window {
    ethereum?: any;
  }
}


import { useQuery } from "@tanstack/react-query";
import { useWallet } from "./use-wallet";

export function useAdmin() {
  const { walletAddress } = useWallet();
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/check', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return { isAdmin: false };
      
      const response = await fetch(`/api/admin/check?walletAddress=${walletAddress}`);
      if (!response.ok) throw new Error('Failed to check admin status');
      return response.json();
    },
    enabled: !!walletAddress,
  });

  return {
    isAdmin: data?.isAdmin || false,
    adminWallets: data?.adminWallets || [],
    isLoading,
  };
}

export interface Web3Provider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: Function): void;
  removeListener(event: string, handler: Function): void;
}

export class WalletService {
  private provider: Web3Provider | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = window.ethereum;
    }
  }

  async connectWallet(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('No Web3 wallet detected');
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });
      return accounts;
    } catch (error) {
      throw new Error('User rejected wallet connection');
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.request({
        method: 'eth_accounts'
      });
    } catch {
      return [];
    }
  }

  async sendTransaction(params: {
    from: string;
    to: string;
    value: string;
    data?: string;
  }): Promise<string> {
    if (!this.provider) {
      throw new Error('No Web3 wallet detected');
    }

    try {
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: params.from,
          to: params.to,
          value: params.value,
          data: params.data || '0x'
        }]
      });
      return txHash;
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error('Transaction rejected or failed');
    }
  }

  onAccountsChanged(handler: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on('accountsChanged', handler);
    }
  }

  onChainChanged(handler: (chainId: string) => void): void {
    if (this.provider) {
      this.provider.on('chainChanged', handler);
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      this.provider.removeListener('accountsChanged', () => {});
      this.provider.removeListener('chainChanged', () => {});
    }
  }

  async addTokenToWallet(tokenAddress: string, tokenSymbol: string, tokenDecimals: number): Promise<boolean> {
    if (!this.provider) {
      throw new Error('No Web3 wallet detected');
    }

    try {
      const wasAdded = await this.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });

      return wasAdded;
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      return false;
    }
  }
}

export const walletService = new WalletService();

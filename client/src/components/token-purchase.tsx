import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Copy, AlertCircle, Loader2, Badge } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IcoStage } from "@shared/schema";
import QRCode from 'qrcode';

interface TokenPurchaseProps {
  currentStage: IcoStage;
}

export default function TokenPurchase({ currentStage }: TokenPurchaseProps) {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("eth");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const { walletAddress, isConnected } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [paymentData, setPaymentData] = useState<any>(null); // State to hold payment data
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [paymentStatusTimer, setPaymentStatusTimer] = useState<NodeJS.Timeout | null>(null);

  // Poll payment status for non-ETH transactions
  const pollPaymentStatus = async (paymentId: string, transactionId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${paymentId}`);
        const statusData = await response.json();

        if (statusData.payment_status === 'finished' || statusData.payment_status === 'confirmed') {
          setTransactionStatus('success');
          if (paymentStatusTimer) clearInterval(paymentStatusTimer);
          
          toast({
            title: "Payment Confirmed!",
            description: "Your tokens have been added to your balance.",
          });

          queryClient.invalidateQueries({ queryKey: ['participant'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        } else if (statusData.payment_status === 'failed' || statusData.payment_status === 'expired') {
          setTransactionStatus('failed');
          if (paymentStatusTimer) clearInterval(paymentStatusTimer);
          
          toast({
            title: "Payment Failed",
            description: "Transaction expired or failed.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    setPaymentStatusTimer(timer);

    // Stop polling after 30 minutes
    setTimeout(() => {
      if (timer) clearInterval(timer);
    }, 30 * 60 * 1000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (paymentStatusTimer) clearInterval(paymentStatusTimer);
    };
  }, [paymentStatusTimer]);

  const supportedCurrencies = [
    { 
      value: 'btc', 
      label: 'Bitcoin', 
      symbol: '₿',
      network: 'Bitcoin Mainnet',
      type: 'Native',
      gasFee: 'Low (~$1-5)'
    },
    { 
      value: 'eth', 
      label: 'Ethereum', 
      symbol: 'Ξ',
      network: 'Ethereum Mainnet',
      type: 'Native',
      gasFee: 'High (~$15-50)'
    },
    { 
      value: 'sol', 
      label: 'Solana', 
      symbol: '◎',
      network: 'Solana Mainnet',
      type: 'Native',
      gasFee: 'Very Low (~$0.001)'
    },
    { 
      value: 'trx', 
      label: 'Tron', 
      symbol: 'Ŧ',
      network: 'Tron Mainnet',
      type: 'Native',
      gasFee: 'Very Low (~$0.01)'
    }
  ];

  const tokensToReceive = investmentAmount ? Math.floor(parseFloat(investmentAmount) / parseFloat(currentStage.tokenPrice)) : 0;
  const isValidAmount = parseFloat(investmentAmount) >= currentStage.minPurchase && parseFloat(investmentAmount) <= currentStage.maxPurchase;

  // Generate QR code for crypto payments
  const generateQRCode = async (address: string, amount: string, currency: string) => {
    let qrData = '';

    switch (currency.toLowerCase()) {
      case 'btc':
        qrData = `bitcoin:${address}?amount=${amount}`;
        break;
      case 'sol':
        qrData = `solana:${address}?amount=${amount}&spl-token=`;
        break;
      case 'trx':
        qrData = `tron:${address}?amount=${amount}`;
        break;
      case 'eth':
        qrData = `ethereum:${address}?value=${amount}`;
        break;
      default:
        qrData = address;
    }

    try {
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 192,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Generate QR code when payment data changes
  useEffect(() => {
    if (paymentData?.payAddress && paymentData?.payAmount && paymentData?.payCurrency) {
      generateQRCode(paymentData.payAddress, paymentData.payAmount, paymentData.payCurrency);
    }
  }, [paymentData]);

  const purchaseMutation = useMutation({
    mutationFn: async ({ amount, tokens, currency }: { amount: number; tokens: number; currency: string }) => {
      if (!walletAddress) throw new Error("Wallet not connected");

      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment invoice through our API
      const paymentResponse = await fetch('/api/payments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          payCurrency: currency,
          orderId: transactionId,
          description: `SAI Token Purchase - ${tokens} tokens`,
          walletAddress: walletAddress
        })
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Payment API error:', errorText);
        throw new Error('Failed to create payment invoice');
      }

      const paymentData = await paymentResponse.json();
      setPaymentData(paymentData); // Set payment data to state
      const { paymentId, payAddress, payAmount, payAmountWei } = paymentData;

      // Get or create participant first
      const participantResponse = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });

      if (!participantResponse.ok) {
        throw new Error('Failed to get participant');
      }

      const participant = await participantResponse.json();

      if (!participant || !participant.id) {
        throw new Error('Failed to get valid participant data');
      }

      // Create transaction record with correct participant ID
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: transactionId,
          participantId: participant.id,
          stageId: currentStage.id,
          amountUSD: amount.toString(),
          tokens,
          status: 'pending',
          paymentMethod: 'crypto',
          paymentId: paymentId,
          paymentCurrency: currency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const transaction = await response.json();

      // Only push to Web3 wallet for ETH transactions to avoid gas fees
      if (currency === 'eth') {
        try {
          const { walletService } = await import('@/lib/web3');

          const txHash = await walletService.sendTransaction({
            from: walletAddress,
            to: payAddress,
            value: payAmountWei,
            data: '0x' // Empty data for simple ETH transfer
          });

          // Update transaction with txHash
          await fetch(`/api/transactions/${transactionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'pending',
              transactionHash: txHash
            })
          });

          return { transaction, txHash, paymentData };

        } catch (walletError) {
          // Update transaction as failed
          await fetch(`/api/transactions/${transactionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'failed'
            })
          });

          throw new Error('Wallet transaction rejected or failed');
        }
      }

      // For BTC, SOL, TRX - use direct address payments (no gas fees)
      // Users send payments directly to the provided address
      return { transaction, paymentData };
    },
    onSuccess: (data) => {
      // For ETH transactions, show success immediately
      if (selectedCurrency === 'eth' && data.txHash) {
        setTransactionStatus('success');
        
        // Add tokens to wallet automatically (only for ETH)
        const { walletService } = import('@/lib/web3');
        walletService.then(service => {
          service.walletService.addTokenToWallet(
            '0x1234567890123456789012345678901234567890', // Your SAI token contract address
            'SAI',
            18
          );
        });

        toast({
          title: "Transaction Sent!",
          description: `Hash: ${data.txHash.substring(0, 10)}...`,
        });
      } else {
        // For BTC/SOL/USDT, keep showing the payment screen and start polling
        toast({
          title: "Payment Request Created",
          description: "Please send payment to the address shown below.",
        });

        // Start polling for payment status
        if (data.paymentData && data.paymentData.paymentId && data.transaction) {
          pollPaymentStatus(data.paymentData.paymentId, data.transaction.id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['participant'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['currentStage'] });
    },
    onError: (error) => {
      setTransactionStatus('failed');
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred during purchase",
        variant: "destructive",
      });
    }
  });

  const handlePurchase = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAmount) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between $${currentStage.minPurchase} and $${currentStage.maxPurchase}.`,
        variant: "destructive",
      });
      return;
    }

    setIsModalOpen(true);
    setTransactionStatus('processing');

    // Different processing delays for different currencies
    const processingDelay = selectedCurrency === 'eth' ? 1000 : 2000;
    
    setTimeout(() => {
      purchaseMutation.mutate({
        amount: parseFloat(investmentAmount),
        tokens: tokensToReceive,
        currency: selectedCurrency
      });
    }, processingDelay);
  };

  return (
    <>
      <Card className="glass-card rounded-xl border-primary/10" data-testid="card-token-purchase">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Coins className="w-5 h-5 text-primary mr-3" />
            Purchase $SAI Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="investment-amount" className="text-sm font-medium text-foreground mb-2">
              Investment Amount (USD)
            </Label>
            <div className="relative">
              <Input
                id="investment-amount"
                type="number"
                placeholder="Enter amount (min $500)"
                min={currentStage.minPurchase}
                max={currentStage.maxPurchase}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="pr-12"
                data-testid="input-investment-amount"
              />
              <span className="absolute right-3 top-3 text-muted-foreground text-sm">USD</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Minimum: ${currentStage.minPurchase.toLocaleString()} | Maximum: ${currentStage.maxPurchase.toLocaleString()}
            </div>
          </div>

          <div>
            <Label htmlFor="payment-currency" className="text-sm font-medium text-foreground mb-2">
              Payment Currency
            </Label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-full" data-testid="select-payment-currency">
                <SelectValue placeholder="Select payment currency" />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currency.symbol}</span>
                        <span>{currency.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{currency.gasFee}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Gas fee notice */}
            {selectedCurrency === 'eth' && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-700">
                    <div className="font-semibold mb-1">High Gas Fees Warning</div>
                    <div>Ethereum transactions currently have high gas fees ($15-50). Consider using Bitcoin, Solana, or Tron for lower fees.</div>
                  </div>
                </div>
              </div>
            )}
            
            {(selectedCurrency === 'btc' || selectedCurrency === 'sol' || selectedCurrency === 'trx') && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5"></div>
                  <div className="text-xs text-green-700">
                    <div className="font-semibold mb-1">Low Fee Option</div>
                    <div>This currency has very low transaction fees. No wallet interaction required - just send to the provided address.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card className="glass-card border-primary/20" data-testid="card-token-calculation">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">You will receive:</span>
                <span className="text-lg font-bold text-primary" data-testid="text-tokens-to-receive">
                  {tokensToReceive.toLocaleString()} SAI
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate:</span>
                <span className="text-foreground">
                  1 USD = {(1 / parseFloat(currentStage.tokenPrice)).toFixed(2)} SAI
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handlePurchase}
            disabled={!isValidAmount || !isConnected || purchaseMutation.isPending}
            className="w-full bg-primary hover:bg-primary/80 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-3 font-medium transition-all duration-300 neon-glow"
            data-testid="button-proceed-payment"
          >
            <Coins className="w-4 h-4 mr-2" />
            {purchaseMutation.isPending ? "Processing..." : "Proceed to Payment"}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-card border-primary/20 max-w-md" data-testid="modal-transaction">
          <DialogHeader>
            <DialogTitle className="text-center">Transaction Status</DialogTitle>
          </DialogHeader>

          <div className="text-center py-4">
            {transactionStatus === 'processing' && (
              <div data-testid="status-processing">
                <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg font-bold">Processing Payment</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCurrency === 'eth' 
                    ? 'Please confirm the transaction in your wallet (gas fees apply)' 
                    : `Send exactly ${paymentData?.payAmount} ${paymentData?.payCurrency?.toUpperCase()} to the address below (no gas fees)`
                  }
                </p>

                {paymentData && selectedCurrency !== 'eth' && (
                  <div className="space-y-4 mt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold mb-2">Payment Details</div>

                      {/* QR Code - Only show for BTC, SOL, TRX */}
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                          {qrCodeDataUrl ? (
                            <img 
                              src={qrCodeDataUrl} 
                              alt="Payment QR Code"
                              className="w-48 h-48 rounded-lg"
                            />
                          ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                                <div className="text-sm text-gray-500">Generating QR Code...</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-3 bg-white rounded-lg border">
                            <div className="text-sm text-gray-600 mb-1">Payment Amount</div>
                            <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                              <span className="text-3xl">
                                {paymentData.payCurrency === 'btc' && '₿'}
                                {paymentData.payCurrency === 'sol' && '◎'}
                                {paymentData.payCurrency === 'trx' && 'Ŧ'}
                                {paymentData.payCurrency === 'eth' && 'Ξ'}
                              </span>
                              {paymentData.payAmount}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {paymentData.payCurrency.toUpperCase()}
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-lg border">
                            <div className="text-sm text-gray-600 mb-1">Payment Address</div>
                            <div className="font-mono text-sm break-all bg-gray-50 p-2 rounded border">
                              {paymentData.payAddress}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => navigator.clipboard.writeText(paymentData.payAddress)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Address
                            </Button>
                          </div>

                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-semibold text-yellow-800 mb-1">Important:</div>
                                <div className="text-yellow-700">
                                  Send exactly <strong>{paymentData.payAmount} {paymentData.payCurrency.toUpperCase()}</strong> to complete your purchase. 
                                  Sending a different amount may result in payment failure.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">Network Information</div>
                            <div className="flex justify-center gap-4 text-xs">
                              {paymentData.payCurrency === 'btc' && (
                                <Badge variant="outline">Bitcoin Mainnet</Badge>
                              )}
                              {paymentData.payCurrency === 'sol' && (
                                <Badge variant="outline">Solana Mainnet</Badge>
                              )}
                              {paymentData.payCurrency === 'usdt' && (
                                <Badge variant="outline">Ethereum ERC-20</Badge>
                              )}
                              {paymentData.payCurrency === 'eth' && (
                                <Badge variant="outline">Ethereum Mainnet</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {transactionStatus === 'success' && (
              <div data-testid="status-success">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-green-400">Purchase Successful!</p>
                <p className="text-sm text-muted-foreground">Your tokens have been added to your balance</p>

                <Button
                  onClick={async () => {
                    try {
                      const { walletService } = await import('@/lib/web3');
                      await walletService.addTokenToWallet(
                        '0x...', // Replace with your actual SAI token contract address
                        'SAI',
                        18
                      );
                      toast({
                        title: "Token Added",
                        description: "SAI token has been added to your wallet"
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Could not add token to wallet",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="mt-4 w-full"
                  variant="outline"
                >
                  Add SAI Token to Wallet
                </Button>
              </div>
            )}

            {transactionStatus === 'failed' && (
              <div data-testid="status-failed">
                <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-red-400">Transaction Failed</p>
                <p className="text-sm text-muted-foreground">Please try again</p>
              </div>
            )}

            <Card className="glass-card border-primary/20 text-left mt-4" data-testid="card-transaction-details">
              <CardContent className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Amount:</span>
                  <span data-testid="text-tx-amount">${parseFloat(investmentAmount || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tokens:</span>
                  <span data-testid="text-tx-tokens">{tokensToReceive.toLocaleString()} SAI</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Payment Currency:</span>
                  <span data-testid="text-tx-currency">
                    {supportedCurrencies.find(c => c.value === selectedCurrency)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate:</span>
                  <span data-testid="text-tx-rate">
                    1 USD = {(1 / parseFloat(currentStage.tokenPrice)).toFixed(2)} SAI
                  </span>
                </div>
              </CardContent>
            </Card>

            {transactionStatus !== 'processing' && (
              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-4 bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                data-testid="button-close-modal"
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
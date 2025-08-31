export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  callbackUrl: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  status: string;
}

export class PaymentService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.nowpayments.io/v1';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.apiKey) {
      throw new Error('NOWPayments API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: request.amount,
          price_currency: request.currency,
          pay_currency: 'btc', // Default to Bitcoin
          order_id: request.orderId,
          order_description: request.description,
          ipn_callback_url: request.callbackUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Payment creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        paymentId: data.payment_id,
        paymentUrl: data.payment_url,
        status: data.payment_status
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Payment processing failed');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('NOWPayments API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.payment_status;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check payment status');
    }
  }
}

export const paymentService = new PaymentService();

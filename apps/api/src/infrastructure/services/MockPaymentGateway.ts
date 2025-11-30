import {
  IPaymentGateway,
  PaymentPreferenceResult,
  PaymentDetails,
} from '../../domain/services/IPaymentGateway';

/**
 * Mock payment gateway implementation.
 * Simulates MercadoPago behavior for development and testing.
 */
export class MockPaymentGateway implements IPaymentGateway {
  private payments: Map<string, PaymentDetails> = new Map();

  async createPreference(params: {
    contributionId: string;
    weddingId: string;
    amount: number;
    currency: string;
    description: string;
    payerEmail: string;
    payerName: string;
  }): Promise<PaymentPreferenceResult> {
    const preferenceId = `pref_${params.contributionId}`;
    const checkoutUrl = `https://www.mercadopago.com.uy/checkout/${preferenceId}`;

    console.log('[PaymentGateway] Created preference:', {
      preferenceId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
    });

    return { preferenceId, checkoutUrl };
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails | null> {
    // In a real implementation, this would call MercadoPago API
    // For mock, we simulate by returning pre-configured data
    return this.payments.get(paymentId) ?? null;
  }

  /**
   * Helper method for testing: simulate a payment being made.
   * @param paymentId - The payment ID.
   * @param contributionId - The contribution ID (external reference).
   * @param status - The payment status.
   */
  simulatePayment(
    paymentId: string,
    contributionId: string,
    status: 'approved' | 'pending' | 'rejected',
    amount: number = 100,
    currency: string = 'UYU'
  ): void {
    this.payments.set(paymentId, {
      paymentId,
      status,
      externalReference: contributionId,
      amount,
      currency,
    });
  }
}

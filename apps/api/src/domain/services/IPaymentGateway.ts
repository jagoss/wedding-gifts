/**
 * Payment preference creation result.
 */
export interface PaymentPreferenceResult {
  preferenceId: string;
  checkoutUrl: string;
}

/**
 * Payment details from webhook/notification.
 */
export interface PaymentDetails {
  paymentId: string;
  status: 'approved' | 'pending' | 'rejected';
  externalReference: string; // Our contribution ID
  amount: number;
  currency: string;
}

/**
 * Port interface for payment gateway operations.
 * Abstracts payment provider integration from the domain layer.
 */
export interface IPaymentGateway {
  /**
   * Creates a payment preference for a contribution.
   * @param params - Parameters for creating the preference.
   * @returns The preference ID and checkout URL.
   */
  createPreference(params: {
    contributionId: string;
    weddingId: string;
    amount: number;
    currency: string;
    description: string;
    payerEmail: string;
    payerName: string;
  }): Promise<PaymentPreferenceResult>;

  /**
   * Retrieves payment details from the provider.
   * @param paymentId - The payment ID from the provider.
   * @returns Payment details or null if not found.
   */
  getPaymentDetails(paymentId: string): Promise<PaymentDetails | null>;
}

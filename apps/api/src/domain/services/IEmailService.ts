/**
 * Port interface for email service operations.
 * Abstracts email sending from the domain layer.
 */
export interface IEmailService {
  /**
   * Sends a welcome email to a newly registered user.
   * @param email - The recipient's email address.
   * @param name - The recipient's name.
   */
  sendWelcomeEmail(email: string, name: string): Promise<void>;

  /**
   * Sends a confirmation email when a contribution is created.
   * @param email - The guest's email address.
   * @param guestName - The guest's name.
   * @param giftTitle - The title of the gift contributed to.
   */
  sendContributionCreated(email: string, guestName: string, giftTitle: string): Promise<void>;

  /**
   * Sends a confirmation email when a payment is received.
   * @param email - The guest's email address.
   * @param guestName - The guest's name.
   * @param amount - The amount paid.
   */
  sendContributionPaid(email: string, guestName: string, amount: number): Promise<void>;
}

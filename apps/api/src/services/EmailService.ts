/**
 * Service for sending emails.
 * Currently a mock implementation.
 */
export class EmailService {
  /**
   * Sends a welcome email to a new user.
   * @param email - The user's email.
   * @param name - The user's name.
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[EmailService] Sending welcome email to ${name} <${email}>`);
  }

  /**
   * Sends an email confirming a contribution was created.
   * @param email - The guest's email.
   * @param guestName - The guest's name.
   * @param giftTitle - The title of the gift contributed to.
   */
  async sendContributionCreated(email: string, guestName: string, giftTitle: string): Promise<void> {
    console.log(`[EmailService] Sending contribution created email to ${guestName} <${email}> for gift ${giftTitle}`);
  }

  /**
   * Sends an email confirming a payment was received.
   * @param email - The guest's email.
   * @param guestName - The guest's name.
   * @param amount - The amount paid.
   */
  async sendContributionPaid(email: string, guestName: string, amount: number): Promise<void> {
    console.log(`[EmailService] Sending payment confirmation to ${guestName} <${email}> for amount ${amount}`);
  }
}

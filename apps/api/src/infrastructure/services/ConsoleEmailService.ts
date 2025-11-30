import { IEmailService } from '../../domain/services/IEmailService';

/**
 * Console-based email service implementation.
 * Logs emails to console instead of sending them.
 * Suitable for development and testing.
 */
export class ConsoleEmailService implements IEmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[Email] Welcome email to ${name} <${email}>`);
  }

  async sendContributionCreated(
    email: string,
    guestName: string,
    giftTitle: string
  ): Promise<void> {
    console.log(
      `[Email] Contribution created - to ${guestName} <${email}> for gift: ${giftTitle}`
    );
  }

  async sendContributionPaid(
    email: string,
    guestName: string,
    amount: number
  ): Promise<void> {
    console.log(
      `[Email] Payment confirmation to ${guestName} <${email}> - amount: ${amount}`
    );
  }
}

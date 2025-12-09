import { IContributionRepository } from "../../../domain/repositories/IContributionRepository";
import { Contribution } from "../../../domain/entities/Contribution";
import { UniqueId } from "../../../domain/value-objects";
import { ContributionModel } from "../../db/models/contribution";
import { Money } from "../../../domain/value-objects/Money";

export class SequelizeContributionRepository implements IContributionRepository {
  async findById(id: UniqueId): Promise<Contribution | null> {
    const row = await ContributionModel.findByPk(id.value);
    return row ? this.toEntity(row) : null;
  }

  async findByWeddingId(weddingId: UniqueId): Promise<Contribution[]> {
    const rows = await ContributionModel.findAll({ where: { weddingId: weddingId.value } });
    return rows.map((row) => this.toEntity(row));
  }

  async findByGiftId(giftId: UniqueId): Promise<Contribution[]> {
    const rows = await ContributionModel.findAll({ where: { giftId: giftId.value } });
    return rows.map((row) => this.toEntity(row));
  }

  async findByPaymentProviderId(paymentProviderId: string): Promise<Contribution | null> {
    const row = await ContributionModel.findOne({ where: { paymentProviderId } });
    return row ? this.toEntity(row) : null;
  }

  async save(contribution: Contribution): Promise<Contribution> {
    const data = contribution.toPersistence();
    await ContributionModel.upsert({
      id: data.id,
      weddingId: data.weddingId,
      giftId: data.giftId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      paymentProvider: data.paymentProvider,
      paymentProviderId: data.paymentProviderId,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    });
    return contribution;
  }

  private toEntity(row: ContributionModel): Contribution {
    const amountVO =
      row.amount !== null && row.amount !== undefined && row.currency
        ? Money.create(row.amount, row.currency)
        : null;

    return Contribution.fromPersistence({
      id: row.id,
      weddingId: row.weddingId,
      giftId: row.giftId,
      guestName: row.guestName,
      guestEmail: row.guestEmail,
      type: row.type as any,
      amount: amountVO ? amountVO.amount : null,
      currency: amountVO ? amountVO.currency : null,
      status: row.status as any,
      paymentProvider: row.paymentProvider as any,
      paymentProviderId: row.paymentProviderId,
      createdAt: row.createdAt?.toISOString()
    });
  }
}


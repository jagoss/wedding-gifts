import { IGiftRepository } from "../../../domain/repositories/IGiftRepository";
import { Gift } from "../../../domain/entities/Gift";
import { UniqueId } from "../../../domain/value-objects";
import { GiftModel } from "../../db/models/gift";

export class SequelizeGiftRepository implements IGiftRepository {
  async findById(id: UniqueId): Promise<Gift | null> {
    const row = await GiftModel.findByPk(id.value);
    return row ? this.toEntity(row) : null;
  }

  async findByWeddingId(weddingId: UniqueId): Promise<Gift[]> {
    const rows = await GiftModel.findAll({ where: { weddingId: weddingId.value } });
    return rows.map((row) => this.toEntity(row));
  }

  async save(gift: Gift): Promise<Gift> {
    const data = gift.toPersistence();
    await GiftModel.upsert({
      id: data.id,
      weddingId: data.weddingId,
      title: data.title,
      description: data.description,
      estimatedPrice: data.estimatedPrice,
      currency: data.currency,
      imageUrl: data.imageUrl,
      productUrl: data.productUrl,
      type: data.type,
      status: data.status,
      maxContributions: data.maxContributions
    });
    return gift;
  }

  async delete(id: UniqueId): Promise<void> {
    await GiftModel.destroy({ where: { id: id.value } });
  }

  private toEntity(row: GiftModel): Gift {
    return Gift.fromPersistence({
      id: row.id,
      weddingId: row.weddingId,
      title: row.title,
      description: row.description,
      estimatedPrice: row.estimatedPrice ?? null,
      currency: row.currency ?? null,
      imageUrl: row.imageUrl,
      productUrl: row.productUrl,
      type: row.type as any,
      status: row.status as any,
      maxContributions: row.maxContributions ?? null
    });
  }
}


import { IWeddingRepository } from "../../../domain/repositories/IWeddingRepository";
import { Wedding } from "../../../domain/entities/Wedding";
import { Slug, UniqueId } from "../../../domain/value-objects";
import { WeddingModel } from "../../db/models/wedding";

export class SequelizeWeddingRepository implements IWeddingRepository {
  async findById(id: UniqueId): Promise<Wedding | null> {
    const row = await WeddingModel.findByPk(id.value);
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: Slug): Promise<Wedding | null> {
    const row = await WeddingModel.findOne({ where: { slug: slug.value } });
    return row ? this.toEntity(row) : null;
  }

  async findByUserId(userId: UniqueId): Promise<Wedding[]> {
    const rows = await WeddingModel.findAll({ where: { userId: userId.value } });
    return rows.map((row) => this.toEntity(row));
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    const count = await WeddingModel.count({ where: { slug: slug.value } });
    return count > 0;
  }

  async save(wedding: Wedding): Promise<Wedding> {
    const data = wedding.toPersistence();
    await WeddingModel.upsert({
      id: data.id,
      userId: data.userId,
      title: data.title,
      slug: data.slug,
      date: data.date,
      location: data.location,
      message: data.message,
      heroImageUrl: data.heroImageUrl
    });
    return wedding;
  }

  async delete(id: UniqueId): Promise<void> {
    await WeddingModel.destroy({ where: { id: id.value } });
  }

  private toEntity(row: WeddingModel): Wedding {
    return Wedding.fromPersistence({
      id: row.id,
      userId: row.userId,
      title: row.title,
      slug: row.slug,
      date: row.date,
      location: row.location,
      message: row.message,
      heroImageUrl: row.heroImageUrl,
      bankAccounts: []
    });
  }
}


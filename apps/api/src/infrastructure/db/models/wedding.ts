import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

export interface WeddingAttributes {
  id: string;
  userId: string;
  title: string;
  slug: string;
  date: string | null;
  location: string | null;
  message: string | null;
  heroImageUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WeddingCreationAttributes = Optional<WeddingAttributes, "id" | "createdAt" | "updatedAt">;

export class WeddingModel extends Model<WeddingAttributes, WeddingCreationAttributes> implements WeddingAttributes {
  declare id: string;
  declare userId: string;
  declare title: string;
  declare slug: string;
  declare date: string | null;
  declare location: string | null;
  declare message: string | null;
  declare heroImageUrl: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

WeddingModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    date: { type: DataTypes.DATEONLY, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    heroImageUrl: { type: DataTypes.STRING, allowNull: true }
  },
  {
    tableName: "weddings",
    sequelize
  }
);


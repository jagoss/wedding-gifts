import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

export interface GiftAttributes {
  id: string;
  weddingId: string;
  title: string;
  description: string | null;
  estimatedPrice: number | null;
  currency: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  type: string;
  status: string;
  maxContributions: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GiftCreationAttributes = Optional<GiftAttributes, "id" | "createdAt" | "updatedAt" | "status">;

export class GiftModel extends Model<GiftAttributes, GiftCreationAttributes> implements GiftAttributes {
  declare id: string;
  declare weddingId: string;
  declare title: string;
  declare description: string | null;
  declare estimatedPrice: number | null;
  declare currency: string | null;
  declare imageUrl: string | null;
  declare productUrl: string | null;
  declare type: string;
  declare status: string;
  declare maxContributions: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

GiftModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    weddingId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    estimatedPrice: { type: DataTypes.FLOAT, allowNull: true },
    currency: { type: DataTypes.STRING, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    productUrl: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "AVAILABLE" },
    maxContributions: { type: DataTypes.INTEGER, allowNull: true }
  },
  {
    tableName: "gifts",
    sequelize
  }
);


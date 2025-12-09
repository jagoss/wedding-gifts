import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

export interface ContributionAttributes {
  id: string;
  weddingId: string;
  giftId: string;
  guestName: string;
  guestEmail: string;
  type: string;
  amount: number | null;
  currency: string | null;
  status: string;
  paymentProvider: string | null;
  paymentProviderId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ContributionCreationAttributes = Optional<ContributionAttributes, "id" | "createdAt" | "updatedAt" | "status" | "paymentProvider" | "paymentProviderId">;

export class ContributionModel
  extends Model<ContributionAttributes, ContributionCreationAttributes>
  implements ContributionAttributes
{
  declare id: string;
  declare weddingId: string;
  declare giftId: string;
  declare guestName: string;
  declare guestEmail: string;
  declare type: string;
  declare amount: number | null;
  declare currency: string | null;
  declare status: string;
  declare paymentProvider: string | null;
  declare paymentProviderId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ContributionModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    weddingId: { type: DataTypes.STRING, allowNull: false },
    giftId: { type: DataTypes.STRING, allowNull: false },
    guestName: { type: DataTypes.STRING, allowNull: false },
    guestEmail: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: true },
    currency: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
    paymentProvider: { type: DataTypes.STRING, allowNull: true },
    paymentProviderId: { type: DataTypes.STRING, allowNull: true }
  },
  {
    tableName: "contributions",
    sequelize
  }
);


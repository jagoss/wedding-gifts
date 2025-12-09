import { UserModel } from "./user";
import { WeddingModel } from "./wedding";
import { GiftModel } from "./gift";
import { ContributionModel } from "./contribution";

// Associations
WeddingModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
UserModel.hasMany(WeddingModel, { foreignKey: "userId", as: "weddings" });

GiftModel.belongsTo(WeddingModel, { foreignKey: "weddingId", as: "wedding" });
WeddingModel.hasMany(GiftModel, { foreignKey: "weddingId", as: "gifts" });

ContributionModel.belongsTo(WeddingModel, { foreignKey: "weddingId", as: "wedding" });
ContributionModel.belongsTo(GiftModel, { foreignKey: "giftId", as: "gift" });
WeddingModel.hasMany(ContributionModel, { foreignKey: "weddingId", as: "contributions" });
GiftModel.hasMany(ContributionModel, { foreignKey: "giftId", as: "contributions" });

export { UserModel, WeddingModel, GiftModel, ContributionModel };


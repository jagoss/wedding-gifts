"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.STRING, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.createTable("weddings", {
      id: { type: Sequelize.STRING, primaryKey: true },
      userId: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      date: { type: Sequelize.DATEONLY, allowNull: true },
      location: { type: Sequelize.STRING, allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: true },
      heroImageUrl: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.createTable("gifts", {
      id: { type: Sequelize.STRING, primaryKey: true },
      weddingId: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      estimatedPrice: { type: Sequelize.FLOAT, allowNull: true },
      currency: { type: Sequelize.STRING, allowNull: true },
      imageUrl: { type: Sequelize.STRING, allowNull: true },
      productUrl: { type: Sequelize.STRING, allowNull: true },
      type: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "AVAILABLE" },
      maxContributions: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.createTable("contributions", {
      id: { type: Sequelize.STRING, primaryKey: true },
      weddingId: { type: Sequelize.STRING, allowNull: false },
      giftId: { type: Sequelize.STRING, allowNull: false },
      guestName: { type: Sequelize.STRING, allowNull: false },
      guestEmail: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.FLOAT, allowNull: true },
      currency: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "PENDING" },
      paymentProvider: { type: Sequelize.STRING, allowNull: true },
      paymentProviderId: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.addConstraint("weddings", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_weddings_user",
      references: { table: "users", field: "id" },
      onDelete: "cascade"
    });

    await queryInterface.addConstraint("gifts", {
      fields: ["weddingId"],
      type: "foreign key",
      name: "fk_gifts_wedding",
      references: { table: "weddings", field: "id" },
      onDelete: "cascade"
    });

    await queryInterface.addConstraint("contributions", {
      fields: ["weddingId"],
      type: "foreign key",
      name: "fk_contributions_wedding",
      references: { table: "weddings", field: "id" },
      onDelete: "cascade"
    });

    await queryInterface.addConstraint("contributions", {
      fields: ["giftId"],
      type: "foreign key",
      name: "fk_contributions_gift",
      references: { table: "gifts", field: "id" },
      onDelete: "cascade"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("contributions");
    await queryInterface.dropTable("gifts");
    await queryInterface.dropTable("weddings");
    await queryInterface.dropTable("users");
  }
};


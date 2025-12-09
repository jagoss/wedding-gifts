"use strict";

const { v4: uuid } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const adminId = uuid();
    const weddingId = uuid();
    const gift1Id = uuid();
    const gift2Id = uuid();
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        id: adminId,
        name: "Demo Admin",
        email: "demo.admin@example.com",
        passwordHash: "hashed_demo1234",
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert("weddings", [
      {
        id: weddingId,
        userId: adminId,
        title: "Boda de Ejemplo",
        slug: "demo-wedding",
        date: null,
        location: "Montevideo",
        message: "Gracias por acompañarnos en este día especial.",
        heroImageUrl: null,
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert("gifts", [
      {
        id: gift1Id,
        weddingId,
        title: "Cafetera de filtro",
        description: "Para los desayunos juntos",
        estimatedPrice: 120,
        currency: "USD",
        imageUrl: null,
        productUrl: null,
        type: "PRODUCT",
        status: "AVAILABLE",
        maxContributions: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: gift2Id,
        weddingId,
        title: "Aporte luna de miel",
        description: "Contribución flexible",
        estimatedPrice: 300,
        currency: "USD",
        imageUrl: null,
        productUrl: null,
        type: "FUND",
        status: "AVAILABLE",
        maxContributions: null,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("contributions", { }, {});
    await queryInterface.bulkDelete("gifts", { }, {});
    await queryInterface.bulkDelete("weddings", { slug: "demo-wedding" }, {});
    await queryInterface.bulkDelete("users", { email: "demo.admin@example.com" }, {});
  }
};


import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dialect = (process.env.SEQ_DIALECT || (process.env.NODE_ENV === "test" ? "sqlite" : "mysql")) as
  | "mysql"
  | "sqlite";

export const sequelize = new Sequelize({
  dialect,
  host: dialect === "mysql" ? process.env.DB_HOST || "127.0.0.1" : undefined,
  port: dialect === "mysql" ? Number(process.env.DB_PORT || 3306) : undefined,
  username: dialect === "mysql" ? process.env.DB_USER || "root" : undefined,
  password: dialect === "mysql" ? process.env.DB_PASS || "" : undefined,
  database: dialect === "mysql" ? process.env.DB_NAME || "wedding_gifts" : "test",
  storage: dialect === "sqlite" ? ":memory:" : undefined,
  logging: process.env.DB_LOGGING === "true" ? console.log : false
});

export async function connectSequelize() {
  await sequelize.authenticate();
}

export async function closeSequelize() {
  await sequelize.close();
}


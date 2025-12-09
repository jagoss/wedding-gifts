import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { Email, UniqueId } from "../../../domain/value-objects";
import { UserModel } from "../../db/models/user";

export class SequelizeUserRepository implements IUserRepository {
  async findById(id: UniqueId): Promise<User | null> {
    const row = await UserModel.findByPk(id.value);
    return row ? User.fromPersistence({ id: row.id, name: row.name, email: row.email, passwordHash: row.passwordHash }) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await UserModel.findOne({ where: { email: email.value } });
    return row ? User.fromPersistence({ id: row.id, name: row.name, email: row.email, passwordHash: row.passwordHash }) : null;
  }

  async save(user: User): Promise<User> {
    const data = user.toPersistence();
    await UserModel.upsert({
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash
    });
    return user;
  }
}


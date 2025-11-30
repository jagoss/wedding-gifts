import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { UniqueId } from '../../domain/value-objects/UniqueId';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

/**
 * In-memory implementation of the User repository.
 * Suitable for development and testing purposes.
 */
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, ReturnType<User['toPersistence']>> = new Map();

  async findById(id: UniqueId): Promise<User | null> {
    const data = this.users.get(id.value);
    if (!data) return null;
    return User.fromPersistence(data);
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const data of this.users.values()) {
      if (data.email === email.value) {
        return User.fromPersistence(data);
      }
    }
    return null;
  }

  async save(user: User): Promise<User> {
    const data = user.toPersistence();
    this.users.set(data.id, data);
    return user;
  }
}

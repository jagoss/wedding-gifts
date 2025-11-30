import { UniqueId, Email } from '../value-objects';
import { ValidationError } from '../errors/DomainError';

/**
 * Props for creating a User entity.
 */
export interface UserProps {
  id: UniqueId;
  name: string;
  email: Email;
  passwordHash: string;
}

/**
 * User entity representing a wedding organizer.
 * Contains identity and authentication data.
 */
export class User {
  private readonly _id: UniqueId;
  private _name: string;
  private readonly _email: Email;
  private _passwordHash: string;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
  }

  /**
   * Factory method to create a new User.
   * @param name - The user's display name.
   * @param email - The user's email address.
   * @param passwordHash - The hashed password.
   */
  static create(name: string, email: Email, passwordHash: string): User {
    if (!name || name.trim() === '') {
      throw new ValidationError('User name is required');
    }
    if (!passwordHash) {
      throw new ValidationError('Password hash is required');
    }

    return new User({
      id: UniqueId.create(),
      name: name.trim(),
      email,
      passwordHash,
    });
  }

  /**
   * Reconstructs a User from persistence layer.
   */
  static fromPersistence(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  }): User {
    return new User({
      id: UniqueId.fromString(props.id),
      name: props.name,
      email: Email.fromPersistence(props.email),
      passwordHash: props.passwordHash,
    });
  }

  get id(): UniqueId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  /**
   * Verifies if the provided password hash matches.
   */
  verifyPassword(passwordHash: string): boolean {
    return this._passwordHash === passwordHash;
  }

  /**
   * Updates the user's name.
   */
  updateName(newName: string): void {
    if (!newName || newName.trim() === '') {
      throw new ValidationError('User name cannot be empty');
    }
    this._name = newName.trim();
  }

  /**
   * Converts entity to a plain object for persistence.
   */
  toPersistence(): {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  } {
    return {
      id: this._id.value,
      name: this._name,
      email: this._email.value,
      passwordHash: this._passwordHash,
    };
  }
}

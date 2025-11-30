import { UniqueId, Money } from '../value-objects';
import { ValidationError } from '../errors/DomainError';

/**
 * Gift type enumeration.
 */
export enum GiftType {
  PRODUCT = 'PRODUCT',
  EXPERIENCE = 'EXPERIENCE',
  FUND = 'FUND',
}

/**
 * Gift status enumeration.
 */
export enum GiftStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  PURCHASED = 'PURCHASED',
  HIDDEN = 'HIDDEN',
}

/**
 * Props for creating a Gift entity.
 */
export interface GiftProps {
  id: UniqueId;
  weddingId: UniqueId;
  title: string;
  description: string | null;
  estimatedPrice: Money | null;
  imageUrl: string | null;
  productUrl: string | null;
  type: GiftType;
  status: GiftStatus;
  maxContributions: number | null;
}

/**
 * Gift entity within a wedding registry.
 * Represents an item guests can contribute to or purchase.
 */
export class Gift {
  private readonly _id: UniqueId;
  private readonly _weddingId: UniqueId;
  private _title: string;
  private _description: string | null;
  private _estimatedPrice: Money | null;
  private _imageUrl: string | null;
  private _productUrl: string | null;
  private _type: GiftType;
  private _status: GiftStatus;
  private _maxContributions: number | null;

  private constructor(props: GiftProps) {
    this._id = props.id;
    this._weddingId = props.weddingId;
    this._title = props.title;
    this._description = props.description;
    this._estimatedPrice = props.estimatedPrice;
    this._imageUrl = props.imageUrl;
    this._productUrl = props.productUrl;
    this._type = props.type;
    this._status = props.status;
    this._maxContributions = props.maxContributions;
  }

  /**
   * Factory method to create a new Gift.
   */
  static create(params: {
    weddingId: UniqueId;
    title: string;
    type: GiftType;
    description?: string | null;
    estimatedPrice?: Money | null;
    imageUrl?: string | null;
    productUrl?: string | null;
    maxContributions?: number | null;
  }): Gift {
    if (!params.title || params.title.trim() === '') {
      throw new ValidationError('Gift title is required');
    }

    return new Gift({
      id: UniqueId.create(),
      weddingId: params.weddingId,
      title: params.title.trim(),
      description: params.description ?? null,
      estimatedPrice: params.estimatedPrice ?? null,
      imageUrl: params.imageUrl ?? null,
      productUrl: params.productUrl ?? null,
      type: params.type,
      status: GiftStatus.AVAILABLE,
      maxContributions: params.maxContributions ?? null,
    });
  }

  /**
   * Reconstructs a Gift from persistence.
   */
  static fromPersistence(data: {
    id: string;
    weddingId: string;
    title: string;
    description: string | null;
    estimatedPrice: number | null;
    currency: string | null;
    imageUrl: string | null;
    productUrl: string | null;
    type: GiftType;
    status: GiftStatus;
    maxContributions: number | null;
  }): Gift {
    const price =
      data.estimatedPrice !== null && data.currency
        ? Money.create(data.estimatedPrice, data.currency)
        : null;

    return new Gift({
      id: UniqueId.fromString(data.id),
      weddingId: UniqueId.fromString(data.weddingId),
      title: data.title,
      description: data.description,
      estimatedPrice: price,
      imageUrl: data.imageUrl,
      productUrl: data.productUrl,
      type: data.type,
      status: data.status,
      maxContributions: data.maxContributions,
    });
  }

  // Getters
  get id(): UniqueId {
    return this._id;
  }

  get weddingId(): UniqueId {
    return this._weddingId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get estimatedPrice(): Money | null {
    return this._estimatedPrice;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get productUrl(): string | null {
    return this._productUrl;
  }

  get type(): GiftType {
    return this._type;
  }

  get status(): GiftStatus {
    return this._status;
  }

  get maxContributions(): number | null {
    return this._maxContributions;
  }

  /**
   * Checks if the gift is available for contributions.
   */
  isAvailable(): boolean {
    return this._status === GiftStatus.AVAILABLE;
  }

  /**
   * Marks the gift as reserved.
   */
  reserve(): void {
    if (this._status !== GiftStatus.AVAILABLE) {
      throw new ValidationError('Gift is not available for reservation');
    }
    this._status = GiftStatus.RESERVED;
  }

  /**
   * Marks the gift as purchased.
   */
  markAsPurchased(): void {
    this._status = GiftStatus.PURCHASED;
  }

  /**
   * Hides the gift from public view.
   */
  hide(): void {
    this._status = GiftStatus.HIDDEN;
  }

  /**
   * Makes the gift available again.
   */
  makeAvailable(): void {
    this._status = GiftStatus.AVAILABLE;
  }

  /**
   * Updates gift details.
   */
  update(data: {
    title?: string;
    description?: string | null;
    estimatedPrice?: Money | null;
    imageUrl?: string | null;
    productUrl?: string | null;
    type?: GiftType;
    maxContributions?: number | null;
  }): void {
    if (data.title !== undefined) {
      if (!data.title || data.title.trim() === '') {
        throw new ValidationError('Gift title cannot be empty');
      }
      this._title = data.title.trim();
    }
    if (data.description !== undefined) {
      this._description = data.description;
    }
    if (data.estimatedPrice !== undefined) {
      this._estimatedPrice = data.estimatedPrice;
    }
    if (data.imageUrl !== undefined) {
      this._imageUrl = data.imageUrl;
    }
    if (data.productUrl !== undefined) {
      this._productUrl = data.productUrl;
    }
    if (data.type !== undefined) {
      this._type = data.type;
    }
    if (data.maxContributions !== undefined) {
      this._maxContributions = data.maxContributions;
    }
  }

  /**
   * Converts to persistence format.
   */
  toPersistence(): {
    id: string;
    weddingId: string;
    title: string;
    description: string | null;
    estimatedPrice: number | null;
    currency: string | null;
    imageUrl: string | null;
    productUrl: string | null;
    type: GiftType;
    status: GiftStatus;
    maxContributions: number | null;
  } {
    return {
      id: this._id.value,
      weddingId: this._weddingId.value,
      title: this._title,
      description: this._description,
      estimatedPrice: this._estimatedPrice?.amount ?? null,
      currency: this._estimatedPrice?.currency ?? null,
      imageUrl: this._imageUrl,
      productUrl: this._productUrl,
      type: this._type,
      status: this._status,
      maxContributions: this._maxContributions,
    };
  }
}

import { AppError } from "../../shared/AppError.js";

export type ProductProps = {
  id: string;
  name: string;
  priceInCents: number;
  isActive: boolean;
  createdAt: Date;
};

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(input: { id: string; name: string; priceInCents: number }): Product {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new AppError(
        "Product name must have at least 2 characters.",
        422,
        "INVALID_PRODUCT_NAME",
      );
    }

    if (!Number.isInteger(input.priceInCents) || input.priceInCents <= 0) {
      throw new AppError(
        "Product price must be a positive integer in cents.",
        422,
        "INVALID_PRODUCT_PRICE",
      );
    }

    return new Product({
      id: input.id,
      name,
      priceInCents: input.priceInCents,
      isActive: true,
      createdAt: new Date(),
    });
  }

  static restore(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}

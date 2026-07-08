import { AppError } from "../../shared/AppError.js";

export type OrderItemProps = {
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
};

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(input: OrderItemProps): OrderItem {
    if (!input.productId.trim()) {
      throw new AppError("Product id is required.", 422, "INVALID_ORDER_ITEM_PRODUCT");
    }

    if (!input.productName.trim()) {
      throw new AppError("Product name is required.", 422, "INVALID_ORDER_ITEM_PRODUCT_NAME");
    }

    if (!Number.isInteger(input.unitPriceInCents) || input.unitPriceInCents <= 0) {
      throw new AppError(
        "Unit price must be a positive integer in cents.",
        422,
        "INVALID_ORDER_ITEM_PRICE",
      );
    }

    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new AppError(
        "Quantity must be a positive integer.",
        422,
        "INVALID_ORDER_ITEM_QUANTITY",
      );
    }

    return new OrderItem({ ...input, productName: input.productName.trim() });
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get subtotalInCents(): number {
    return this.props.unitPriceInCents * this.props.quantity;
  }

  increaseQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError(
        "Quantity must be a positive integer.",
        422,
        "INVALID_ORDER_ITEM_QUANTITY",
      );
    }

    this.props.quantity += quantity;
  }

  toJSON(): OrderItemProps & { subtotalInCents: number } {
    return { ...this.props, subtotalInCents: this.subtotalInCents };
  }
}

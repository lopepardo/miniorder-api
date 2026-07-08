import { describe, expect, it } from "vitest";
import { Product } from "./../../../../src/domain/product/Product.js";

describe("Prodcut", () => {
  it("creates a valid product", () => {
    const product = Product.create({
      id: "product-1",
      name: "Coffee",
      priceInCents: 1500,
    });

    expect(product.id).toBe("product-1");
    expect(product.name).toBe("Coffee");
    expect(product.priceInCents).toBe(1500);
    expect(product.isActive).toBe(true);
  });

  it("does not create a product with name shorter than 2 characters", () => {
    expect(() =>
      Product.create({
        id: "product-1",
        name: "A",
        priceInCents: 1500,
      }),
    ).toThrow("Product name must have at least 2 characters.");
  });

  it("does not create a product with blank name", () => {
    expect(() =>
      Product.create({
        id: "product-1",
        name: "   ",
        priceInCents: 1500,
      }),
    ).toThrow("Product name must have at least 2 characters.");
  });

  it("trims product name", () => {
    const product = Product.create({
      id: "product-1",
      name: "  Coffee  ",
      priceInCents: 5000,
    });

    expect(product.name).toBe("Coffee");
  });

  it("does not create a product with negative price", () => {
    expect(() =>
      Product.create({
        id: "product-1",
        name: "Coffee",
        priceInCents: -100,
      }),
    ).toThrow("Product price must be a positive integer in cents.");
  });

  it("does not create a product with decimal price", () => {
    expect(() =>
      Product.create({
        id: "product-1",
        name: "Coffee",
        priceInCents: 100.5,
      }),
    ).toThrow("Product price must be a positive integer in cents.");
  });

  it("deactivate the product ", () => {
    const product = Product.create({
      id: "product-1",
      name: "Coffee",
      priceInCents: 1500,
    });
    product.deactivate();

    expect(product.isActive).toBe(false);
  });

  it("restores a product from existing props", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    const product = Product.restore({
      id: "product-1",
      name: "Coffee",
      priceInCents: 1500,
      isActive: false,
      createdAt,
    });

    expect(product.id).toBe("product-1");
    expect(product.name).toBe("Coffee");
    expect(product.priceInCents).toBe(1500);
    expect(product.isActive).toBe(false);
    expect(product.toJSON().createdAt).toEqual(createdAt);
  });
});

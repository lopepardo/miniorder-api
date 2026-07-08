import { describe, expect, it } from "vitest";
import { makeCreateProductUseCase } from "../../../../src/application/product/CreateProductUseCase.js";
import { makeInMemoryProductRepository } from "../../../../src/infrastructure/repositories/memory/InMemoryProductRepository.js";
import type { GenerateId } from "../../../../src/shared/IdGenerator.js";

const idGenerator: GenerateId = () => "product-1";

describe("CreateProductUseCase", () => {
  it("creates and persists a product", async () => {
    const productRepository = makeInMemoryProductRepository();
    const useCase = makeCreateProductUseCase({ productRepository, idGenerator });

    const product = await useCase({ name: "Coffee", priceInCents: 1500 });

    expect(product).toMatchObject({
      id: "product-1",
      name: "Coffee",
      priceInCents: 1500,
      isActive: true,
    });

    await expect(productRepository.findById("product-1")).resolves.not.toBeNull();
  });
});

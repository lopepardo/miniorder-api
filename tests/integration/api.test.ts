import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildContainer } from "../../src/composition/container.js";
import { createApp } from "../../src/infrastructure/http/createApp.js";

describe("MiniOrder API", () => {
  it("creates a product, creates an order, adds an item and confirms the order", async () => {
    const container = await buildContainer();
    const app = createApp(container);

    const productResponse = await request(app)
      .post("/products")
      .send({ name: "Coffee", priceInCents: 1500 })
      .expect(201);

    const productId = productResponse.body.data.id;

    const orderResponse = await request(app).post("/orders").send({}).expect(201);
    const orderId = orderResponse.body.data.id;

    const addItemResponse = await request(app)
      .post(`/orders/${orderId}/items`)
      .send({ productId, quantity: 2 })
      .expect(200);

    expect(addItemResponse.body.data.totalInCents).toBe(3000);

    const confirmResponse = await request(app)
      .post(`/orders/${orderId}/confirm`)
      .send({})
      .expect(200);

    expect(confirmResponse.body.data.status).toBe("confirmed");
    expect(confirmResponse.body.data.totalInCents).toBe(3000);
  });

  it("returns a validation error for invalid product input", async () => {
    const container = await buildContainer();
    const app = createApp(container);

    const response = await request(app)
      .post("/products")
      .send({ name: "A", priceInCents: -10 })
      .expect(422);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

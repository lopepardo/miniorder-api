import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";

const BASE_URL = "http://localhost:3000";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

function randomName(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export default function () {
  const healthRes = http.get(`${BASE_URL}/health`);

  check(healthRes, {
    "health status is 200": (res) => res.status === 200,
  });

  const productPayload = JSON.stringify({
    name: randomName("Product"),
    priceInCents: 2500,
  });

  const productRes = http.post(`${BASE_URL}/products`, productPayload, {
    headers: { "Content-Type": "application/json" },
  });

  const productCreated = check(productRes, {
    "product created": (res) => res.status === 201 || res.status === 200,
  });

  if (!productCreated) {
    console.error(`Product creation failed: status=${productRes.status} body=${productRes.body}`);
    exec.test.abort();
  }

  const product = productRes.json("data");
  if (!product.id) {
    console.error(`Product response does not contain data.id: ${productRes.body}`);
    exec.test.abort();
  }

  const orderRes = http.post(`${BASE_URL}/orders`, null, {
    headers: { "Content-Type": "application/json" },
  });

  const orderCreated = check(orderRes, {
    "order created": (res) => res.status === 201 || res.status === 200,
  });

  if (!orderCreated) {
    console.error(`Order creation failed: status=${orderRes.status} body=${orderRes.body}`);
    exec.test.abort();
  }

  const order = orderRes.json("data");
  if (!order.id) {
    console.error(`Order response does not contain data.id: ${orderRes.body}`);
    exec.test.abort();
  }

  const addItemPayload = JSON.stringify({
    productId: product.id,
    quantity: 2,
  });

  const addItemRes = http.post(`${BASE_URL}/orders/${order.id}/items`, addItemPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(addItemRes, {
    "item added to order": (res) => res.status === 200 || res.status === 201,
  });

  const confirmRes = http.post(`${BASE_URL}/orders/${order.id}/confirm`, null, {
    headers: { "Content-Type": "application/json" },
  });

  check(confirmRes, {
    "order confirmed": (res) => res.status === 200,
  });

  const getOrderRes = http.get(`${BASE_URL}/orders/${order.id}`);

  check(getOrderRes, {
    "order found": (res) => res.status === 200,
    "order is confirmed": (res) => {
      const body = res.json();
      return body.data.status === "confirmed";
    },
  });

  sleep(1);
}

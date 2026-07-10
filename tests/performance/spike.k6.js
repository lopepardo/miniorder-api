import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const BASE_URL = "http://localhost:3000";

const flowSuccessRate = new Rate("flow_success_rate");

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "10s", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "10s", target: 10 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.15"],
    http_req_duration: ["p(95)<3000"],
    flow_success_rate: ["rate>0.85"],
  },
};

function createHeaders() {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

function randomName(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export function setup() {
  const healthRes = http.get(`${BASE_URL}/health`);

  const healthOk = check(healthRes, {
    "setup: health status is 200": (res) => res.status === 200,
  });

  if (!healthOk) {
    throw new Error(`API is not healthy: status=${healthRes.status} body=${healthRes.body}`);
  }

  const productPayload = JSON.stringify({
    name: randomName("SpikeProduct"),
    priceInCents: 2500,
  });

  const productRes = http.post(`${BASE_URL}/products`, productPayload, createHeaders());

  const productCreated = check(productRes, {
    "setup: product created": (res) => res.status === 201 || res.status === 200,
  });

  if (!productCreated) {
    throw new Error(`Product creation failed: status=${productRes.status} body=${productRes.body}`);
  }

  const product = productRes.json("data");

  if (!product || !product.id) {
    throw new Error(`Product response does not contain data.id: ${productRes.body}`);
  }

  return {
    productId: product.id,
  };
}

export default function (data) {
  let flowOk = true;

  const orderRes = http.post(`${BASE_URL}/orders`, null, createHeaders());

  const orderCreated = check(orderRes, {
    "order created": (res) => res.status === 201 || res.status === 200,
  });

  if (!orderCreated) {
    console.error(`Order creation failed: status=${orderRes.status} body=${orderRes.body}`);
    flowSuccessRate.add(false);
    return;
  }

  const order = orderRes.json("data");

  if (!order || !order.id) {
    console.error(`Order response does not contain data.id: ${orderRes.body}`);
    flowSuccessRate.add(false);
    return;
  }

  const addItemPayload = JSON.stringify({
    productId: data.productId,
    quantity: 2,
  });

  const addItemRes = http.post(
    `${BASE_URL}/orders/${order.id}/items`,
    addItemPayload,
    createHeaders(),
  );

  const itemAdded = check(addItemRes, {
    "item added to order": (res) => res.status === 200 || res.status === 201,
  });

  if (!itemAdded) {
    console.error(`Add item failed: status=${addItemRes.status} body=${addItemRes.body}`);
    flowSuccessRate.add(false);
    return;
  }

  const confirmRes = http.post(`${BASE_URL}/orders/${order.id}/confirm`, null, createHeaders());

  const orderConfirmed = check(confirmRes, {
    "order confirmed": (res) => res.status === 200,
  });

  if (!orderConfirmed) {
    console.error(`Order confirmation failed: status=${confirmRes.status} body=${confirmRes.body}`);
    flowOk = false;
  }

  const getOrderRes = http.get(`${BASE_URL}/orders/${order.id}`);

  const orderFound = check(getOrderRes, {
    "order found": (res) => res.status === 200,
    "order is confirmed": (res) => {
      if (res.status !== 200) return false;

      const body = res.json();

      return body.data.status === "confirmed";
    },
  });

  if (!orderFound) {
    console.error(`Get order failed: status=${getOrderRes.status} body=${getOrderRes.body}`);
    flowOk = false;
  }

  flowSuccessRate.add(flowOk);

  sleep(1);
}

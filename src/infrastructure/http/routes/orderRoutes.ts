import { Router } from "express";
import type { OrderController } from "../controllers/OrderController.js";

export const createOrderRoutes = (orderController: OrderController): Router => {
  const router = Router();

  router.post("/", orderController.create);
  router.get("/", orderController.list);
  router.get("/:orderId", orderController.getById);
  router.post("/:orderId/items", orderController.addItem);
  router.post("/:orderId/confirm", orderController.confirm);
  router.post("/:orderId/cancel", orderController.cancel);

  return router;
};

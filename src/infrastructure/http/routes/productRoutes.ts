import { Router } from "express";
import type { ProductController } from "../controllers/ProductController.js";

export const createProductRoutes = (productController: ProductController): Router => {
  const router = Router();

  router.post("/", productController.create);
  router.get("/", productController.list);
  router.get("/:productId", productController.getById);

  return router;
};

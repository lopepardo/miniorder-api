import type { Request, Response } from "express";
import { z } from "zod";
import type { AddItemToOrderUseCase } from "../../../application/order/AddItemToOrderUseCase.js";
import type { ConfirmOrderUseCase } from "../../../application/order/ConfirmOrderUseCase.js";
import type { CreateOrderUseCase } from "../../../application/order/CreateOrderUseCase.js";
import type { GetOrderUseCase } from "../../../application/order/GetOrderUseCase.js";
import type { ListOrdersUseCase } from "../../../application/order/ListOrdersUseCase.js";
import type { CancelOrderUseCase } from "../../../application/order/CancelOrderUseCase.js";
import { paginationQuerySchema } from "../schemas/paginationQuerySchema.js";

const orderIdParamsSchema = z.object({
  orderId: z.string().min(1),
});

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

type OrderControllerDeps = {
  readonly createOrderUseCase: CreateOrderUseCase;
  readonly listOrdersUseCase: ListOrdersUseCase;
  readonly getOrderUseCase: GetOrderUseCase;
  readonly addItemToOrderUseCase: AddItemToOrderUseCase;
  readonly confirmOrderUseCase: ConfirmOrderUseCase;
  readonly cancelOrderUseCase: CancelOrderUseCase;
};

export const makeOrderController = (deps: OrderControllerDeps) => {
  return {
    create: async (_request: Request, response: Response): Promise<void> => {
      const order = await deps.createOrderUseCase();
      response.status(201).json({ data: order });
    },

    list: async (request: Request, response: Response): Promise<void> => {
      const pagination = paginationQuerySchema.parse(request.query);
      const orders = await deps.listOrdersUseCase(pagination);
      response.json({ data: orders.items, meta: orders.meta });
    },

    getById: async (request: Request, response: Response): Promise<void> => {
      const { orderId } = orderIdParamsSchema.parse(request.params);
      const order = await deps.getOrderUseCase(orderId);
      response.json({ data: order });
    },

    addItem: async (request: Request, response: Response): Promise<void> => {
      const { orderId } = orderIdParamsSchema.parse(request.params);
      const body = addItemSchema.parse(request.body);
      const order = await deps.addItemToOrderUseCase({ orderId, ...body });
      response.json({ data: order });
    },

    confirm: async (request: Request, response: Response): Promise<void> => {
      const { orderId } = orderIdParamsSchema.parse(request.params);
      const order = await deps.confirmOrderUseCase(orderId);
      response.json({ data: order });
    },

    cancel: async (request: Request, response: Response): Promise<void> => {
      const { orderId } = orderIdParamsSchema.parse(request.params);
      const order = await deps.cancelOrderUseCase(orderId);
      response.json({ data: order });
    },
  };
};

export type OrderController = ReturnType<typeof makeOrderController>;

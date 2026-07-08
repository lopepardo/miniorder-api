import type { OrderRepository } from "../../../application/ports/OrderRepository.js";
import type { Order } from "../../../domain/order/Order.js";
import type { PostgresPool } from "../../database/postgres/createPostgresPool.js";

import {
  type OrderRow,
  toOrderDomain,
  toOrderPersistence,
} from "./mappers/orderPersistenceMapper.js";

export function makePostgresOrderRepository(pool: PostgresPool): OrderRepository {
  return {
    async save(order: Order): Promise<void> {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const [orderRow, orderItemRows, discountRows] = toOrderPersistence(order);

        await client.query(
          `
          INSERT INTO orders (
            id,
            status,
            created_at,
            confirmed_at,
            cancelled_at
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            confirmed_at = excluded.confirmed_at,
            cancelled_at = excluded.cancelled_at
          `,
          [
            orderRow.id,
            orderRow.status,
            orderRow.created_at,
            orderRow.confirmed_at,
            orderRow.cancelled_at,
          ],
        );

        await client.query(
          `
          DELETE FROM order_items
          WHERE order_id = $1
          `,
          [orderRow.id],
        );

        for (const item of orderItemRows) {
          await client.query(
            `
            INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              unit_price_cents,
              quantity
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [orderRow.id, item.product_id, item.product_name, item.unit_price_cents, item.quantity],
          );
        }

        await client.query(
          `
          DELETE FROM order_discounts
          WHERE order_id = $1
          `,
          [orderRow.id],
        );

        for (const discount of discountRows) {
          await client.query(
            `
            INSERT INTO order_discounts (
              order_id,
              code,
              description,
              amount_in_cents
            )
            VALUES ($1, $2, $3, $4)
            `,
            [orderRow.id, discount.code, discount.description, discount.amount_in_cents],
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async findById(id: string): Promise<Order | null> {
      const orderResult = await pool.query<OrderRow>(
        `
        SELECT
          id,
          status,
          created_at,
          confirmed_at,
          cancelled_at
        FROM orders
        WHERE id = $1
        `,
        [id],
      );

      const orderRow = orderResult.rows[0];

      if (!orderRow) {
        return null;
      }

      const itemResult = await pool.query(
        `
        SELECT
          order_id,
          product_id,
          product_name,
          unit_price_cents,
          quantity
        FROM order_items
        WHERE order_id = $1
        ORDER BY product_id ASC
        `,
        [id],
      );

      const discountResult = await pool.query(
        `
        SELECT
          order_id,
          code,
          description,
          amount_in_cents
        FROM order_discounts
        WHERE order_id = $1
        `,
        [id],
      );

      return toOrderDomain({
        order: orderRow,
        items: itemResult.rows,
        discounts: discountResult.rows,
      });
    },

    async findAll(): Promise<Order[]> {
      const orderResult = await pool.query<OrderRow>(`
        SELECT
          id,
          status,
          created_at,
          confirmed_at,
          cancelled_at
        FROM orders
        ORDER BY created_at ASC
      `);

      return Promise.all(
        orderResult.rows.map(async (order) => {
          const itemResult = await pool.query(
            `
            SELECT
              order_id,
              product_id,
              product_name,
              unit_price_cents,
              quantity
            FROM order_items
            WHERE order_id = $1
            ORDER BY product_id ASC
            `,
            [order.id],
          );

          const discountResult = await pool.query(
            `
            SELECT
              order_id,
              code,
              description,
              amount_in_cents
            FROM order_discounts
            WHERE order_id = $1
            `,
            [order.id],
          );

          return toOrderDomain({
            order,
            items: itemResult.rows,
            discounts: discountResult.rows,
          });
        }),
      );
    },
  };
}

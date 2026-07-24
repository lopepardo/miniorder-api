import { Product } from "../../../domain/product/Product.js";
import type { ProductRepository } from "../../../application/ports/ProductRepository.js";
import type { PostgresPool } from "../../database/postgres/createPostgresPool.js";
import { toProductDomain, toProductPersistence } from "./mappers/productPersistenceMapper.js";

export const makePostgresProductRepository = (pool: PostgresPool): ProductRepository => {
  return {
    async save(product: Product): Promise<void> {
      const record = toProductPersistence(product);

      await pool.query(
        `
        INSERT INTO products (
          id,
          name,
          price_cents,
          is_active,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          price_cents = excluded.price_cents,
          is_active = excluded.is_active
        `,
        [record.id, record.name, record.price_cents, record.is_active, record.created_at],
      );
    },

    async findById(id: string): Promise<Product | null> {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          price_cents,
          is_active,
          created_at
        FROM products
        WHERE id = $1
        `,
        [id],
      );

      return result.rows[0] ? toProductDomain(result.rows[0]) : null;
    },

    async findPage({ page, pageSize }) {
      const offset = (page - 1) * pageSize;
      const [productsResult, countResult] = await Promise.all([
        pool.query(
          `
          SELECT
            id,
            name,
            price_cents,
            is_active,
            created_at
          FROM products
          ORDER BY created_at DESC, id DESC
          LIMIT $1 OFFSET $2
          `,
          [pageSize, offset],
        ),
        pool.query<{ total: string }>("SELECT COUNT(*) AS total FROM products"),
      ]);

      return {
        items: productsResult.rows.map(toProductDomain),
        totalItems: Number(countResult.rows[0]?.total ?? 0),
      };
    },
  };
};

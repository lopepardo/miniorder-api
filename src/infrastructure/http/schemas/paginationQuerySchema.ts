import { z } from "zod";

const MAX_PAGE_SIZE = 100;
const MAX_PAGE = Math.floor(Number.MAX_SAFE_INTEGER / MAX_PAGE_SIZE);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(MAX_PAGE).default(1),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(20),
});

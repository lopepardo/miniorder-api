export type PaginationInput = {
  page: number;
  pageSize: number;
};

export type PaginatedItems<T> = {
  items: T[];
  totalItems: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PageResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Parse `page` / `limit` from a query object with safe defaults and caps.
 * Accepts loosely-typed query values (string | string[] | undefined).
 */
export function getPagination(query: {
  page?: unknown;
  limit?: unknown;
}): PaginationParams {
  const page = clampInt(query.page, DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER);
  const limit = clampInt(query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

/** Build the standard list envelope from a page of data and a total count. */
export function buildPage<T>(
  data: T[],
  total: number,
  { page, limit }: Pick<PaginationParams, 'page' | 'limit'>,
): PageResult<T> {
  return { data, page, limit, total, hasMore: page * limit < total };
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

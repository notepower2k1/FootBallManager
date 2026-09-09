export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  totalItems: number;
}

export function paginate<T>(
  items: readonly T[],
  requestedPage: number,
  pageSize: number,
): Page<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const page = Math.min(
    pageCount,
    Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1),
  );
  const start = (page - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    page,
    pageCount,
    totalItems: items.length,
  };
}

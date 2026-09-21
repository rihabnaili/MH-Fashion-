// Escape user input before using it inside a MongoDB $regex (prevents regex injection / ReDoS).
export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number,
  maxLimit: number
) {
  const rawLimit = parseInt(searchParams.get('limit') || '', 10);
  const rawPage = parseInt(searchParams.get('page') || '', 10);

  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : defaultLimit, 1), maxLimit);
  const page = Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1);

  return { limit, page, skip: (page - 1) * limit };
}

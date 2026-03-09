export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page?: number;
  total?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  links?: unknown;
  meta?: PaginationMeta;
};

export function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const firstData = (payload as { data?: unknown }).data;

    if (Array.isArray(firstData)) {
      return firstData as T[];
    }

    if (firstData && typeof firstData === "object") {
      const secondData = (firstData as { data?: unknown }).data;
      if (Array.isArray(secondData)) {
        return secondData as T[];
      }
    }
  }

  return [];
}

export function toPaginatedPayload<T>(payload: unknown): PaginatedResponse<T> {
  const toMeta = (value: unknown): PaginationMeta | undefined => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    const raw = value as Record<string, unknown>;
    if (
      typeof raw.current_page !== "number" ||
      typeof raw.last_page !== "number"
    ) {
      return undefined;
    }

    return {
      current_page: raw.current_page,
      last_page: raw.last_page,
      per_page: typeof raw.per_page === "number" ? raw.per_page : undefined,
      total: typeof raw.total === "number" ? raw.total : undefined,
    };
  };

  if (payload && typeof payload === "object") {
    const topData = (payload as { data?: unknown }).data;
    if (Array.isArray(topData)) {
      return {
        data: topData as T[],
        links: (payload as { links?: unknown }).links,
        meta: toMeta((payload as { meta?: unknown }).meta),
      };
    }

    if (topData && typeof topData === "object") {
      const nestedData = (topData as { data?: unknown }).data;
      if (Array.isArray(nestedData)) {
        return {
          data: nestedData as T[],
          links: (topData as { links?: unknown }).links,
          meta: toMeta((topData as { meta?: unknown }).meta),
        };
      }
    }
  }

  return { data: [] };
}

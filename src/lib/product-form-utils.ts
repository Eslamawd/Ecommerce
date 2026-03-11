export type SpecificationRow = {
  id: string;
  key: string;
  value: string;
};

export type VariantRow = {
  id: string;
  sku: string;
  price: string;
  quantity: string;
  color: string;
  size: string;
  make: string;
  model: string;
  year: string;
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSpecificationRow(): SpecificationRow {
  return { id: uid("spec"), key: "", value: "" };
}

export function createVariantRow(): VariantRow {
  return {
    id: uid("variant"),
    sku: "",
    price: "",
    quantity: "",
    color: "",
    size: "",
    make: "",
    model: "",
    year: "",
  };
}

export function toSpecificationsObject(rows: SpecificationRow[]) {
  const entries = rows
    .map((row) => [row.key.trim(), row.value.trim()] as const)
    .filter(([key, value]) => key.length > 0 && value.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return Object.fromEntries(entries);
}

export function toVariantsPayload(rows: VariantRow[]) {
  const variants = rows
    .map((row) => {
      const price = Number(row.price);
      const quantity = Number(row.quantity);
      if (Number.isNaN(price) || Number.isNaN(quantity)) {
        return null;
      }

      const attributes = {
        ...(row.color.trim() ? { color: row.color.trim() } : {}),
        ...(row.size.trim() ? { size: row.size.trim() } : {}),
        ...(row.make.trim() ? { make: row.make.trim() } : {}),
        ...(row.model.trim() ? { model: row.model.trim() } : {}),
        ...(row.year.trim() ? { year: row.year.trim() } : {}),
      };

      return {
        sku: row.sku.trim() || null,
        price,
        quantity,
        attributes,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return variants.length > 0 ? variants : null;
}

export function fromSpecificationsObject(value: unknown): SpecificationRow[] {
  if (!value || typeof value !== "object") {
    return [createSpecificationRow()];
  }

  const rows = Object.entries(value as Record<string, unknown>)
    .map(([key, raw]) => ({
      id: uid("spec"),
      key,
      value: String(raw ?? ""),
    }))
    .filter((row) => row.key.trim().length > 0);

  return rows.length > 0 ? rows : [createSpecificationRow()];
}

export function fromVariants(value: unknown): VariantRow[] {
  if (!Array.isArray(value)) {
    return [createVariantRow()];
  }

  const rows = value
    .map((raw) => {
      if (!raw || typeof raw !== "object") {
        return null;
      }

      const row = raw as {
        sku?: string | null;
        price?: number;
        quantity?: number;
        attributes?: Record<string, unknown>;
      };

      return {
        id: uid("variant"),
        sku: row.sku ?? "",
        price: row.price == null ? "" : String(row.price),
        quantity: row.quantity == null ? "" : String(row.quantity),
        color: String(row.attributes?.color ?? ""),
        size: String(row.attributes?.size ?? ""),
        make: String(row.attributes?.make ?? ""),
        model: String(row.attributes?.model ?? ""),
        year: String(row.attributes?.year ?? ""),
      } satisfies VariantRow;
    })
    .filter((row): row is VariantRow => row !== null);

  return rows.length > 0 ? rows : [createVariantRow()];
}

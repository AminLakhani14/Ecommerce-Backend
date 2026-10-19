import type { Request } from 'express';

export const catalogCollation = { locale: 'en', strength: 2 };
export const productFields = '_id name image gallery description category subCategory price countInStock isOnSale isActive variants.size variants.stock createdAt updatedAt';
export const cardFields = '_id name image category subCategory price countInStock isOnSale isActive variants.size variants.stock';

// Lean reads skip Mongoose casting/defaults, so preserve the public product shape explicitly.
export function normalizeProduct<T extends { category?: unknown; gallery?: unknown; variants?: unknown; isActive?: unknown; isOnSale?: unknown; countInStock?: unknown }>(product: T) {
  return {
    ...product,
    category: Array.isArray(product.category) ? product.category : product.category ? [product.category] : [],
    variants: product.variants || [],
    isActive: product.isActive ?? true,
    isOnSale: product.isOnSale ?? false,
    countInStock: product.countInStock ?? 0,
  };
}

/** Optional pagination keeps existing array responses compatible. */
export function pagination(req: Request) {
  if (req.query.limit === undefined && req.query.page === undefined) return null;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 24);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw Object.assign(new Error('Use page 1–10000 and limit 1–100.'), { status: 400 });
  }
  return { skip: (page - 1) * limit, limit };
}

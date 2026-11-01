import type { Model, Types } from 'mongoose';

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** True for a raw Mongo ID; anything else in a product URL is a slug. */
export const isObjectIdString = (value: string) => OBJECT_ID.test(value);

/** "Classic Aviator Sunglasses" -> "classic-aviator-sunglasses" */
export function slugify(name: string) {
  const slug = name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
  // Never produce something that would be read as an ID, or an empty path segment.
  return !slug || isObjectIdString(slug) ? `product-${slug}`.replace(/-+$/, '') : slug;
}

/** Slug for the name, suffixed -2, -3… when another product already uses it. */
export async function uniqueSlug(model: Model<any>, name: string, excludeId?: Types.ObjectId | string) {
  const base = slugify(name);
  const taken = new Set((await model.find({ slug: new RegExp(`^${base}(-\\d+)?$`), ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
    .select('slug').lean()).map(product => (product as { slug?: string }).slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

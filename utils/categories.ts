import Category, { defaultCategories } from '../models/categoryModel.js';

export const categoryKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function availableCategoryNames(records: Array<{ name: string; key: string; isDeleted?: boolean }>): string[] {
  const removed = new Set(records.filter(category => category.isDeleted).map(category => category.key));
  const names = defaultCategories.filter(name => !removed.has(categoryKey(name)));
  for (const category of records) {
    if (!category.isDeleted && !names.some(name => categoryKey(name) === category.key)) names.push(category.name);
  }
  return names;
}

export async function parseProductCategories(value: unknown): Promise<string[]> {
  let parsed = value;
  if (typeof value === 'string') {
    if (value.trim().startsWith('[')) {
      try { parsed = JSON.parse(value); }
      catch { throw new Error('Provide a valid category selection.'); }
    } else parsed = [value]; // Accept existing clients that send one category.
  }
  if (!Array.isArray(parsed) || !parsed.length || parsed.some(name => typeof name !== 'string' || !name.trim())) {
    throw new Error('Select at least one category.');
  }
  const keys = [...new Set((parsed as string[]).map(categoryKey))];
  const records = await Category.find({ key: { $in: keys } }).select('name key isDeleted -_id').lean();
  const names = availableCategoryNames(records);
  return keys.map(key => {
    const name = names.find(name => categoryKey(name) === key);
    if (!name) throw new Error('One or more selected categories do not exist. Create them in Settings first.');
    return name;
  });
}

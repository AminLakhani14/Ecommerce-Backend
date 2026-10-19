import express from 'express';
import Category, { defaultCategories } from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { availableCategoryNames, categoryKey } from '../utils/categories.js';
import { cachedJson } from '../utils/readCache.js';
import { catalogCollation } from '../utils/productQueries.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await cachedJson(req, res, 'categories', 60000, async () => {
      const categories = await Category.find({}).select('name key isDeleted').sort({ createdAt: 1 }).lean();
      return availableCategoryNames(categories);
    });
  } catch {
    res.status(500).json({ message: 'Unable to load categories.' });
  }
});

router.post('/', protect, admin, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > 60) {
    return res.status(400).json({ message: 'Enter a category name between 1 and 60 characters.' });
  }
  const key = categoryKey(name);
  try {
    // A removed category can be added again, including the original store categories.
    const restored = await Category.findOneAndUpdate({ key, isDeleted: true }, { $set: { name, isDeleted: false } }, { new: true });
    if (restored) return res.status(201).json({ name: restored.name });
    if (defaultCategories.some(category => categoryKey(category) === key)) {
      return res.status(409).json({ message: 'This category already exists.' });
    }
    const category = await Category.create({ name, key });
    res.status(201).json({ name: category.name });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return res.status(409).json({ message: 'This category already exists.' });
    }
    res.status(500).json({ message: 'Unable to create category.' });
  }
});

router.delete<{ name: string }>('/:name', protect, admin, async (req, res) => {
  const key = categoryKey(req.params.name);
  try {
    const records = await Category.find({}).select('name key isDeleted -_id').sort({ createdAt: 1 }).lean();
    const name = availableCategoryNames(records).find(name => categoryKey(name) === key);
    if (!name) return res.status(404).json({ message: 'Category not found.' });
    // Normalize legacy scalar categories and remove only this assignment.
    // Products remain available to admins even when the resulting array is empty.
    try {
      await Product.updateMany({ category: name }, [{ $set: {
        category: { $filter: {
          input: { $cond: [{ $isArray: '$category' }, '$category', ['$category']] },
          as: 'category', cond: { $ne: ['$$category', name] },
        } },
      } }], { collation: catalogCollation });
    } finally {
      // Invalidate even if the database reports a partially completed bulk update.
      req.app.locals.readCache.invalidate('products:');
    }
    // Keep a removal record so built-in categories stay removed after a restart.
    await Category.findOneAndUpdate({ key }, { $set: { name, isDeleted: true } }, { upsert: true });
    res.json({ message: `Category "${name}" removed successfully.` });
  } catch {
    res.status(500).json({ message: 'Unable to remove category.' });
  }
});

export default router;

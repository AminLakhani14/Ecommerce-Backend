import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import User from '../models/userModel.js';
import { cachedJson } from '../utils/readCache.js';
import { cardFields, catalogCollation, normalizeProduct } from '../utils/productQueries.js';

type Handler = RequestHandler<Record<string, string>>;

const invalidId = (id: string | undefined) => !id || !mongoose.isValidObjectId(id);

/** A buyer is anyone with a non-cancelled order containing the product. */
function hasPurchased(userId: unknown, productId: string) {
  return Order.exists({ user: userId, isCancelled: { $ne: true }, 'orderItems.product': productId });
}

// @desc    Reviews and rating summary for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews: Handler = async (req, res) => {
  if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    await cachedJson(req, res, 'products', 15000, async () => {
      const reviews = await Review.find({ product: req.params.id })
        .select('_id name rating title comment createdAt').sort({ createdAt: -1 }).limit(100).lean();
      const distribution = [0, 0, 0, 0, 0];
      let total = 0;
      for (const review of reviews) { distribution[review.rating - 1]++; total += review.rating; }
      return {
        reviews,
        numReviews: reviews.length,
        rating: reviews.length ? Math.round((total / reviews.length) * 10) / 10 : 0,
        distribution,
      };
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    res.status(500).json({ message: 'Unable to load reviews.' });
  }
};

// @desc    Whether the signed-in user may review this product
// @route   GET /api/products/:id/reviews/eligibility
// @access  Private
const getReviewEligibility: Handler = async (req, res) => {
  if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    const [purchased, existing] = await Promise.all([
      hasPurchased(req.user!._id, req.params.id),
      Review.exists({ product: req.params.id, user: req.user!._id }),
    ]);
    const reason = existing ? 'reviewed' : purchased ? null : 'not-purchased';
    res.set('Cache-Control', 'private, no-store').json({ canReview: !reason, reason });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ message: 'Unable to check review eligibility.' });
  }
};

// @desc    Leave a review for a purchased product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview: Handler = async (req, res) => {
  if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  const rating = Number(req.body.rating);
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' });
  }
  if (comment.length < 3 || comment.length > 2000 || title.length > 120) {
    return res.status(400).json({ message: 'Write a review between 3 and 2000 characters.' });
  }
  try {
    if (!(await Product.exists({ _id: req.params.id }))) return res.status(404).json({ message: 'Product not found' });
    if (!(await hasPurchased(req.user!._id, req.params.id))) {
      return res.status(403).json({ message: 'Only customers who bought this product can review it.' });
    }
    const user = req.user!.name ? null : await User.findById(req.user!._id).select('name').lean();
    const review = await Review.create({
      product: req.params.id,
      user: req.user!._id,
      name: req.user!.name || user?.name || 'Verified buyer',
      rating,
      title,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Unable to save your review.' });
  }
};

// @desc    Up to three products from the same subcategory, then category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts: Handler = async (req, res) => {
  if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    await cachedJson(req, res, 'products', 15000, async () => {
      const product = await Product.findById(req.params.id).select('category subCategory').lean();
      if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
      const categories = normalizeProduct(product).category;
      const base = { _id: { $ne: product._id }, isActive: { $ne: false }, category: { $exists: true, $nin: [[], null, ''] } };
      const found = await Product.find({ ...base, subCategory: product.subCategory }).select(cardFields)
        .collation(catalogCollation).sort({ createdAt: -1 }).limit(3).lean();
      if (found.length < 3 && categories.length) {
        const more = await Product.find({ ...base, _id: { $nin: [product._id, ...found.map(p => p._id)] }, category: { $in: categories } })
          .select(cardFields).collation(catalogCollation).sort({ createdAt: -1 }).limit(3 - found.length).lean();
        found.push(...more);
      }
      return found.map(normalizeProduct);
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    if (status === 500) console.error('Error loading related products:', error);
    res.status(status).json({ message: status === 500 ? 'Unable to load products.' : (error as Error).message });
  }
};

export { getProductReviews, getReviewEligibility, createProductReview, getRelatedProducts };

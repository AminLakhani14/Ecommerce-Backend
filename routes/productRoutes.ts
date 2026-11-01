import express from 'express';
const router = express.Router();
import {
  getProducts,
  getAdminProducts,
  getAdminProductById,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getHomepageProducts,
  getProductsByCategory,
  getSaleProducts,
  getProductsByFilter,
  getProductsBySubCategory,
} from '../controllers/productController.js';
import { getProductReviews, getReviewEligibility, createProductReview, getRelatedProducts } from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Admin reads include products with no assigned category.
router.get('/admin', protect, admin, getAdminProducts);
router.get('/admin/:id', protect, admin, getAdminProductById);

// Public routes
router.route('/').get(getProducts);
router.get('/homepage', getHomepageProducts);
router.get('/sale', getSaleProducts);
router.get('/category/:categoryName', getProductsByCategory);
router.get('/subcategory/:subCategoryName', getProductsBySubCategory);
router.get('/filter/:category/:subCategory', getProductsByFilter);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews/eligibility', protect, getReviewEligibility);
router.route('/:id/reviews').get(getProductReviews).post(protect, createProductReview);
router.route('/:id').get(getProductById);

router.route('/').post(protect, admin, upload.array('gallery', 6), createProduct);
router.route('/:id').put(protect, admin, upload.array('gallery', 6), updateProduct);
router.route('/:id').delete(protect, admin, deleteProduct);

export default router;

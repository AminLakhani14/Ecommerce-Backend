import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getHomepageProducts,
  getProductsByCategory,
  getSaleProducts,
  getProductsByFilter,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Public routes
router.route('/').get(getProducts);
router.get('/homepage', getHomepageProducts);
router.get('/sale', getSaleProducts);
router.get('/category/:categoryName', getProductsByCategory);
router.get('/filter/:category/:subCategory', getProductsByFilter);
router.route('/:id').get(getProductById);

// --- START: THE FINAL FIX ---
// ADMIN ROUTES (These ONLY need the 'admin' middleware)
router.route('/').post(admin, upload.array('gallery', 6), createProduct); // REMOVED 'protect'
router.route('/:id')
  .put(admin, updateProduct) // REMOVED 'protect'
  .delete(admin, deleteProduct); // REMOVED 'protect'
// --- END: THE FINAL FIX ---

export default router;
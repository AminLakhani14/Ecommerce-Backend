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

router.route('/').post(protect, admin, upload.array('gallery', 6), createProduct);
router.route('/:id').put(protect, admin, updateProduct);
router.route('/:id').delete(protect, admin, deleteProduct);

export default router;
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
  getProductsBySubCategory, 
  getProductsByFilter,
  getSaleProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.array('gallery', 6), createProduct);

router.get('/homepage', getHomepageProducts);
router.get('/sale', getSaleProducts);
router.get('/filter/:category/:subCategory', getProductsByFilter);
router.get('/subcategory/:subCategoryName', getProductsBySubCategory);
router.get('/category/:categoryName', getProductsByCategory);

// This is the crucial section
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
import type { Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import { validateImageUrl } from '../utils/productImageUrls.js';
import { parseProductCategories } from '../utils/categories.js';
import { cachedJson } from '../utils/readCache.js';
import { cardFields, catalogCollation, normalizeProduct, pagination, productFields } from '../utils/productQueries.js';

const createProduct: RequestHandler<Record<string, string>> = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user token' });
    }

    let imageUrl: string | undefined;
    if (req.body.imageUrl) {
      try { imageUrl = validateImageUrl(req.body.imageUrl); }
      catch { return res.status(400).json({ message: 'Provide a valid HTTP or HTTPS image URL.' }); }
    }
    if (files.length === 0 && !imageUrl) {
      return res.status(400).json({ message: 'An image URL or product image upload is required.' });
    }
    
    const { name, price, description, category, subCategory, isOnSale, variants } = req.body;
    let categories: string[];
    try { categories = await parseProductCategories(category); }
    catch (error) { return res.status(400).json({ message: (error as Error).message }); }

    if (!variants) {
      return res.status(400).json({ message: 'Variants data is missing.' });
    }

    const parsedVariants = JSON.parse(variants).filter((v: { size: string; stock: number }) => v.size && v.size.trim() !== "");
    
    const imagePaths = files.map(file => `/uploads/${file.filename}`);
    const mainImage = imagePaths[0] || imageUrl;
    const galleryImages = imagePaths.slice(1);

    const product = new Product({
      name,
      price,
      user: req.user!._id,
      image: mainImage,
      gallery: galleryImages,
      category: categories,
      subCategory,
      description,
      isOnSale: isOnSale === 'true',
      variants: parsedVariants,
    });

    const createdProduct = await product.save();
    res.status(200).json(createdProduct);
  } catch (error) {
    console.error('ERROR IN createProduct:', error);
    res.status(500).json({ message: 'Server error while creating product.' });
  }
};

// @desc    Update a product with variants
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct: RequestHandler<Record<string, string>> = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const { name, price, description, category, subCategory, isOnSale, variants } = req.body;
    let imageUrl: string | undefined;
    if (req.body.imageUrl) {
      try { imageUrl = validateImageUrl(req.body.imageUrl); }
      catch { return res.status(400).json({ message: 'Provide a valid HTTP or HTTPS image URL.' }); }
    }
    
    const product = await Product.findById(req.params.id);

    if (product) {
      if (category !== undefined) {
        try { product.category = await parseProductCategories(category); }
        catch (error) { return res.status(400).json({ message: (error as Error).message }); }
      }
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.subCategory = subCategory || product.subCategory;
      product.isOnSale = isOnSale === 'true' || isOnSale === true;
      if (imageUrl) product.image = imageUrl;

      if (variants) {
        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        product.variants = parsedVariants.filter((v: { size: string; stock: number }) => v.size && v.size.trim() !== "");
      }

      if (files && files.length > 0) {
        const imagePaths = files.map(file => `/uploads/${file.filename}`);
        product.image = imagePaths[0];
        product.gallery = imagePaths.slice(1);
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Server Error' });
  }
};

const deleteProduct: RequestHandler<Record<string, string>> = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.status(200).json({ message: 'Product removed' }); // Use status 200 for success
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
};

type CatalogRequest = Request<Record<string, string>>;

function catalogError(res: Response, error: unknown) {
  const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 500;
  res.status(status).json({ message: status === 500 ? 'Unable to load products.' : (error as Error).message });
}

const categorizedProducts = { category: { $exists: true, $nin: [[], null, ''] } };

function productList(filter: (req: CatalogRequest) => Record<string, unknown>, adminView = false): RequestHandler<Record<string, string>> {
  return async (req, res) => {
    try {
      const page = pagination(req);
      await cachedJson(req, res, 'products', 15000, async () => {
        const match = { ...(adminView ? {} : categorizedProducts), ...filter(req) };
        let query = Product.find(match).select(productFields).sort({ createdAt: 1, _id: 1 });
        if ('category' in match || 'subCategory' in match) query = query.collation(catalogCollation);
        if (page) query = query.skip(page.skip).limit(page.limit);
        return (await query.lean()).map(product => ({ ...normalizeProduct(product), gallery: product.gallery || [] }));
      });
    } catch (error) { catalogError(res, error); }
  };
}

const getProducts = productList(() => ({}));
const getAdminProducts = productList(() => ({}), true);
const getSaleProducts = productList(() => ({ isOnSale: true }));
const getProductsByCategory = productList(req => ({ category: req.params.categoryName }));
const getProductsBySubCategory = productList(req => ({ subCategory: req.params.subCategoryName }));
const getProductsByFilter = productList(req => ({ category: req.params.category, subCategory: req.params.subCategory }));

function productDetails(adminView = false): RequestHandler<Record<string, string>> {
  return async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
    try {
      await cachedJson(req, res, 'products', 15000, async () => {
        const product = await Product.findById(req.params.id).select(productFields).lean();
        const normalized = product && normalizeProduct(product);
        if (!normalized || (!adminView && normalized.category.length === 0)) {
          throw Object.assign(new Error('Product not found'), { status: 404 });
        }
        return { ...normalized, gallery: product!.gallery || [] };
      });
    } catch (error) { catalogError(res, error); }
  };
}
const getProductById = productDetails();
const getAdminProductById = productDetails(true);

const getHomepageProducts: RequestHandler<Record<string, string>> = async (req, res) => {
  try {
    await cachedJson(req, res, 'products', 15000, async () => {
      // Fetch only displayed cards. Independent queries share one network round trip window.
      const sections = [
        { key: 'children', filter: { category: 'Children' }, limit: 5, direction: -1 as const },
        { key: 'accessories', filter: { category: 'Accessories' }, limit: 4, direction: 1 as const },
        { key: 'backpacks', filter: { category: 'Backpacks' }, limit: 4, direction: 1 as const },
        { key: 'clothing', filter: { category: 'Clothing' }, limit: 4, direction: 1 as const },
        { key: 'sale', filter: { isOnSale: true }, limit: 5, direction: -1 as const },
      ];
      const entries = await Promise.all(sections.map(async section => {
        let query = Product.find({ ...categorizedProducts, ...section.filter }).select(cardFields)
          .sort({ createdAt: section.direction, _id: section.direction }).limit(section.limit);
        if ('category' in section.filter) query = query.collation(catalogCollation);
        const products = await query.lean();
        return [section.key, products.map(normalizeProduct)];
      }));
      return Object.fromEntries(entries);
    });
  } catch (error) { catalogError(res, error); }
};

export { getAdminProducts, getAdminProductById, getProducts, getProductById, createProduct, getHomepageProducts, getProductsByCategory, updateProduct, deleteProduct, getSaleProducts, getProductsBySubCategory, getProductsByFilter };

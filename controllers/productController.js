import Product from '../models/productModel.js';

const createProduct = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user token' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Product images are required.' });
    }
    
    const { name, price, description, category, subCategory, isOnSale, variants } = req.body;

    if (!variants) {
      return res.status(400).json({ message: 'Variants data is missing.' });
    }

    const parsedVariants = JSON.parse(variants);
    
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    const mainImage = imagePaths[0];
    const galleryImages = imagePaths.slice(1);

    const product = new Product({
      name,
      price,
      user: req.user._id,
      image: mainImage,
      gallery: galleryImages,
      category,
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
const updateProduct = async (req, res) => {
  try {
    // req.body will now be a clean JSON object
    const { name, price, description, category, subCategory, isOnSale, variants } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.isOnSale = isOnSale ?? product.isOnSale;

      // --- START: THIS IS THE FIX ---
      // Variants will arrive as an array, so no need to parse.
      if (variants) {
        product.variants = variants;
      }
      // --- END: THIS IS THE FIX ---

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

const deleteProduct = async (req, res) => {
  try {
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

const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
};

const getSaleProducts = async (req, res) => {
  try {
    const products = await Product.find({ isOnSale: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ 
      category: new RegExp(`^${req.params.categoryName}$`, 'i') 
    });
      res.json(products);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const getHomepageProducts = async (req, res) => {
  try {
    const men = await Product.find({ category: 'Men' }).sort({ createdAt: -1 }).limit(5);
    const women = await Product.find({ category: 'Women' }).sort({ createdAt: -1 }).limit(5);
    const children = await Product.find({ category: 'Children' }).sort({ createdAt: -1 }).limit(5);
    const accessories = await Product.find({ category: 'Accessories' }).sort({ createdAt: -1 }).limit(5);
    const sale = await Product.find({ isOnSale: true }).sort({ createdAt: -1 }).limit(5);

    res.json({ men, women, children, accessories, sale }); // <-- Add accessories
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const getProductsBySubCategory = async (req, res) => {
  try {
    const subCategory = decodeURIComponent(req.params.subCategoryName);
    const products = await Product.find({ 
      subCategory: new RegExp(`^${subCategory}$`, 'i') 
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by sub-category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProductsByFilter = async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const subCategory = decodeURIComponent(req.params.subCategory);

    // Query that matches BOTH the category AND the sub-category, case-insensitively
    const products = await Product.find({
      category: new RegExp(`^${category}$`, 'i'),
      subCategory: new RegExp(`^${subCategory}$`, 'i'),
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getProducts, getProductById, createProduct, getHomepageProducts, getProductsByCategory, updateProduct, deleteProduct, getSaleProducts,getProductsBySubCategory,getProductsByFilter };
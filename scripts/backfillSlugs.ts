import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/productModel.js';
import { uniqueSlug } from '../utils/slug.js';

// Gives every product without a slug a URL name. Touches only the slug field.
try {
  await connectDB();
  await Product.createIndexes();
  const products = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }).select('_id name').sort({ createdAt: 1 }).lean();
  for (const product of products) {
    const slug = await uniqueSlug(Product, product.name, product._id);
    await Product.updateOne({ _id: product._id }, { $set: { slug } });
    console.log(`${product.name} -> ${slug}`);
  }
  console.log(`Added slugs to ${products.length} products.`);
} finally {
  await mongoose.disconnect();
}

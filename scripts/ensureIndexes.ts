import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Category from '../models/categoryModel.js';

try {
  await connectDB();
  // createIndexes only adds declared indexes; it never drops existing indexes.
  await Promise.all([Product.createIndexes(), Order.createIndexes(), Category.createIndexes()]);
  console.log('Product, order, and category indexes are ready.');
} finally {
  await mongoose.disconnect();
}

import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import products from './data/collectionProducts.js';

// Add only missing collection products. Existing products, stock, users, and orders are preserved.
try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  const apiUrl = process.env.DEPLOYED_API_URL || 'https://ag-store-ecommerce-backend.onrender.com';
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/products`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`API verification failed: ${response.status}`);
  const deployedProducts: Array<{ _id: string }> = await response.json();
  if (!Array.isArray(deployedProducts) || !deployedProducts.length) throw new Error('A populated deployed catalog is required to verify the target database');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const matching = await Product.countDocuments({ _id: { $in: deployedProducts.map(product => product._id) } });
  if (matching !== deployedProducts.length) throw new Error('Configured database does not match the deployed API; no products were added');
  const admin = await User.findOne({ isAdmin: true }).select('_id');
  if (!admin) throw new Error('An existing administrator is required');
  for (const product of products) await new Product({ ...product, user: admin._id }).validate();
  if (process.argv.includes('--dry-run')) {
    console.log(`Validated ${products.length} products against the deployed database. No data changed.`);
  } else {
    const result = await Product.bulkWrite(products.map(product => ({ updateOne: {
      filter: { name: product.name, category: product.category },
      update: { $setOnInsert: new Product({ ...product, user: admin._id }).toObject() },
      upsert: true,
      timestamps: false,
    } })));
    console.log(`Added ${result.upsertedCount} collection products; existing entries were preserved.`);
    for (const category of ['Accessories', 'Backpacks', 'Clothing']) {
      console.log(`${category}: ${await Product.countDocuments({ category })} products`);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Collection import failed');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

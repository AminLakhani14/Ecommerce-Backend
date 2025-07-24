import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js'; // Ensure Order model exists
import connectDB from './config/db.js';

dotenv.config();
await connectDB(); // Use await to ensure connection before proceeding

const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert new users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Create sample products linked to the admin user
    const sampleProducts = products.map(p => ({ ...p, user: adminUser }));
    if (sampleProducts.length > 0) {
      await Product.insertMany(sampleProducts);
    }

    console.log('Data Imported! Admin user created.');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
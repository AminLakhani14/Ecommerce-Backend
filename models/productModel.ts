import mongoose from 'mongoose';
import { catalogCollation } from '../utils/productQueries.js';
import { uniqueSlug } from '../utils/slug.js';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // URL name, kept in step with name
  image: { type: String, required: true }, // Main image (first from upload)
  gallery: [{ type: String }], // Array of other image paths
  description: { type: String, required: true }, // <-- ADDED
  // Mongoose also casts existing single-category documents to an array on read.
  category: {
    type: [String], required: true,
  },
  subCategory: { type: String, required: true }, // <-- ADDED
  price: { type: Number, required: true, default: 0 }, // Regular price
  salePrice: { type: Number, min: 0 }, // Charged instead of price while isOnSale
  countInStock: { type: Number, required: true, default: 0 },
  isOnSale: { type: Boolean, required: true, default: false },
  isActive: { type: Boolean, required: true, default: true }, 
  variants: [variantSchema],
}, { timestamps: true });

productSchema.index({ category: 1, createdAt: -1, _id: -1 }, { collation: catalogCollation });
productSchema.index({ category: 1, subCategory: 1, createdAt: -1, _id: -1 }, { collation: catalogCollation });
productSchema.index({ subCategory: 1, createdAt: -1, _id: -1 }, { collation: catalogCollation });
productSchema.index({ isOnSale: 1, createdAt: -1, _id: -1 });
productSchema.index({ createdAt: -1, _id: -1 });

productSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = await uniqueSlug(this.constructor as mongoose.Model<any>, this.name, this._id);
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;

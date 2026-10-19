import mongoose from 'mongoose';

export const defaultCategories = ['Men', 'Women', 'Children', 'Accessories', 'Backpacks', 'Clothing'];

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  key: { type: String, required: true, unique: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);

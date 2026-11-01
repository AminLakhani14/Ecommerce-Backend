import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 120, default: '' },
  comment: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

// One review per buyer per product; newest-first listing per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    orderType: {
      type: String,
      enum: ['ride', 'parcel', 'freight', 'vendor'],
      required: true
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    ratingMessage: { type: String, required: true },
    title: { type: String, default: 'Trip / Service Review' }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;

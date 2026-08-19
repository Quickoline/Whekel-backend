import Review from '../models/Review.js';

// User: Create Order / Trip Review
export const createReview = async (req, res) => {
  try {
    const { relatedOrderId, orderType, rating, ratingMessage, title } = req.body;

    const existingReview = await Review.findOne({ userId: req.user._id, relatedOrderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this order' });
    }

    const review = await Review.create({
      userId: req.user._id,
      relatedOrderId,
      orderType,
      rating,
      ratingMessage,
      title: title || 'Great Service'
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Reviews for specific Order
export const getReviewsByOrder = async (req, res) => {
  try {
    const reviews = await Review.find({ relatedOrderId: req.params.orderId })
      .populate('userId', 'name profilePhoto');

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin / Public: Get All Reviews
export const getAllReviews = async (req, res) => {
  try {
    const { orderType, rating } = req.query;
    const filter = {};
    if (orderType) filter.orderType = orderType;
    if (rating) filter.rating = rating;

    const reviews = await Review.find(filter)
      .populate('userId', 'name email profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Review
export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

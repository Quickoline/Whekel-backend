import Review from '../models/Review.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';

// Helper: Recalculate Vendor Admin Average Rating
export const recalculateVendorRating = async (vendorAdminId) => {
  try {
    if (!vendorAdminId) return null;

    const allVendorReviews = await Review.find({ vendorAdminId });
    if (allVendorReviews.length === 0) return null;

    const totalStars = allVendorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalStars / allVendorReviews.length).toFixed(1));

    const updatedAdmin = await Admin.findByIdAndUpdate(
      vendorAdminId,
      {
        'vendorProfile.rating': avgRating
      },
      { new: true }
    );

    return avgRating;
  } catch (error) {
    console.error(`[Rating Recalculation Error]: ${error.message}`);
    return null;
  }
};

// User: Create Order / Trip / Vendor Review & Recalculate Vendor Rating
export const createReview = async (req, res) => {
  try {
    const {
      orderId,
      relatedOrderId,
      orderType,
      vendorAdminId,
      vendorId,
      assignedVendorId,
      rating,
      ratingMessage,
      comment,
      title
    } = req.body;

    const targetOrderId = orderId || relatedOrderId || req.params.id;

    if (!targetOrderId) {
      return res.status(400).json({ success: false, message: 'orderId / relatedOrderId is required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'rating parameter (1-5) is required' });
    }

    // Lookup order in Vendor collection if applicable
    let targetVendorAdminId = vendorAdminId || assignedVendorId || vendorId || null;
    let vendorOrder = await Vendor.findById(targetOrderId);

    if (vendorOrder) {
      if (!targetVendorAdminId && vendorOrder.assignedVendorId) {
        targetVendorAdminId = vendorOrder.assignedVendorId;
      }
      // Update order status to completed when rated
      vendorOrder.status = 'completed';
      await vendorOrder.save();
    }

    const existingReview = await Review.findOne({
      userId: req.user._id,
      relatedOrderId: targetOrderId
    });

    let review;
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.ratingMessage = ratingMessage || comment || existingReview.ratingMessage;
      existingReview.comment = comment || ratingMessage || existingReview.comment;
      if (targetVendorAdminId) existingReview.vendorAdminId = targetVendorAdminId;
      review = await existingReview.save();
    } else {
      review = await Review.create({
        userId: req.user._id,
        relatedOrderId: targetOrderId,
        orderType: orderType || 'vendor',
        vendorAdminId: targetVendorAdminId,
        rating: Number(rating),
        ratingMessage: ratingMessage || comment || 'Vendor Breakdown Service Review',
        comment: comment || ratingMessage || 'Vendor Breakdown Service Review',
        title: title || 'Service Rating'
      });
    }

    // Recalculate Vendor Rating in Admin Collection
    let newAvgRating = null;
    if (targetVendorAdminId) {
      newAvgRating = await recalculateVendorRating(targetVendorAdminId);
    }

    res.status(201).json({
      success: true,
      message: 'Order review submitted successfully and vendor rating updated',
      data: {
        review,
        vendorAdminRating: newAvgRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Reviews for specific Order
export const getReviewsByOrder = async (req, res) => {
  try {
    const targetOrderId = req.params.orderId || req.params.id;
    const reviews = await Review.find({ relatedOrderId: targetOrderId })
      .populate('userId', 'name profilePhoto')
      .populate('vendorAdminId', 'name phone profilePhoto vendorProfile');

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Reviews for Vendor Admin
export const getReviewsByVendorAdmin = async (req, res) => {
  try {
    const { vendorAdminId } = req.params;
    const reviews = await Review.find({ vendorAdminId })
      .populate('userId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    const totalStars = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? Number((totalStars / reviews.length).toFixed(1)) : 5.0;

    res.json({
      success: true,
      vendorAdminId,
      avgRating,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin / Public: Get All Reviews
export const getAllReviews = async (req, res) => {
  try {
    const { orderType, rating, vendorAdminId } = req.query;
    const filter = {};
    if (orderType) filter.orderType = orderType;
    if (rating) filter.rating = rating;
    if (vendorAdminId) filter.vendorAdminId = vendorAdminId;

    const reviews = await Review.find(filter)
      .populate('userId', 'name email profilePhoto')
      .populate('vendorAdminId', 'name phone profilePhoto vendorProfile')
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

    if (review.vendorAdminId) {
      await recalculateVendorRating(review.vendorAdminId);
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

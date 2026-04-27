const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

//@desc Get all reviews
//@route GET /api/v1/reviews
//@route GET /api/v1/hotels/:hotelId/reviews
/* istanbul ignore next */
exports.getReviews = async (req, res, next) => {
    let query;
    if (req.params.hotelId) {
        query = Review.find({ hotel: req.params.hotelId })
            .populate({ path: 'user', select: 'name email' })
            .sort({ createdAt: -1 });
    } else {
        query = Review.find()
            .populate({ path: 'hotel', select: 'name province' })
            .populate({ path: 'user', select: 'name email' })
            .sort({ createdAt: -1 });
    }

    try {
        const reviews = await query;
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        console.log(err.stack);
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid hotel ID: ${req.params.hotelId}`
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Cannot find Reviews'
        });
    }
};

//@desc Add review
//@route POST /api/v1/hotels/:hotelId/reviews
//@access Private (must have booking record at this hotel)
exports.addReview = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: `No hotel with the id of ${req.params.hotelId}`
            });
        }

        // US2-1 AC: user must have at least one booking at this hotel to review
        const booking = await Booking.findOne({ user: req.user.id, hotel: req.params.hotelId });
        if (!booking) {
            return res.status(403).json({
                success: false,
                message: 'คุณต้องมีประวัติการจองโรงแรมนี้ก่อน จึงจะสามารถเขียนรีวิวได้'
            });
        }

        // One review per user per hotel
        const existing = await Review.findOne({ user: req.user.id, hotel: req.params.hotelId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this hotel'
            });
        }

        // Reject whitespace-only comment (schema trim setter does not guard this at create time)
        if (req.body.comment === undefined || !String(req.body.comment).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be empty or contain only whitespace'
            });
        }

        // Explicit whitelist to prevent mass assignment (likes/dislikes/createdAt spoofing)
        const review = await Review.create({
            score: req.body.score,
            comment: req.body.comment,
            hotel: req.params.hotelId,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: review });
    } catch (err) {
        console.log(err.stack);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this hotel' });
        }
        return res.status(500).json({ success: false, message: 'Cannot create Review' });
    }
};

//@desc Update review
//@route PUT /api/v1/reviews/:id
//@access Private (owner only)
/* istanbul ignore next */
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this review`
            });
        }

        // Reject whitespace-only comment if caller tries to update it
        if (req.body.comment !== undefined && !String(req.body.comment).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be empty or contain only whitespace'
            });
        }

        const updates = {};
        if (req.body.score !== undefined) updates.score = req.body.score;
        if (req.body.comment !== undefined) updates.comment = req.body.comment;

        review = await Review.findByIdAndUpdate(req.params.id, updates, {
            returnDocument: 'after',
            runValidators: true
        });

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.log(err.stack);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(500).json({ success: false, message: 'Cannot update Review' });
    }
};

//@desc Delete review
//@route DELETE /api/v1/reviews/:id
//@access Private (owner or admin)
/* istanbul ignore next */
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        const isOwner = review.user.toString() === req.user.id;
        const isPrivileged = req.user.role === 'admin' || req.user.role === 'PomPhet';
        if (!isOwner && !isPrivileged) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this review`
            });
        }

        await review.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot delete Review' });
    }
};

//@desc Like or dislike a review (toggle)
//@route PUT /api/v1/reviews/:id/like
//@access Private
/* istanbul ignore next */
exports.likeReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        // Cannot like/dislike your own review
        if (review.user.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot like or dislike your own review'
            });
        }

        const { action } = req.body;
        if (action !== 'like' && action !== 'dislike') {
            return res.status(400).json({
                success: false,
                message: 'Action must be "like" or "dislike"'
            });
        }

        const userId = req.user.id;
        const hasLiked = (review.likes || []).some(id => id.toString() === userId);
        const hasDisliked = (review.dislikes || []).some(id => id.toString() === userId);

        // Atomic update
        let update = {};
        if (action === 'like') {
            update = hasLiked
                ? { $pull: { likes: userId } }
                : { $addToSet: { likes: userId }, $pull: { dislikes: userId } };
        } else if (action === 'dislike') {
            update = hasDisliked
                ? { $pull: { dislikes: userId } }
                : { $addToSet: { dislikes: userId }, $pull: { likes: userId } };
        }

        const updated = await Review.findByIdAndUpdate(
            req.params.id,
            update,
            { 
                returnDocument: 'after',
                runValidators: true 
            }
        );

        res.status(200).json({
            success: true,
            data: {
                likes: updated.likes,
                dislikes: updated.dislikes
            }
        });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot update vote' });
    }
};

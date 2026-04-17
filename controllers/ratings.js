const Rating = require('../models/Rating');
const Hotel = require('../models/Hotel');

//@desc Get all ratings
//@route Get /api/v1/ratings
//@route Get /api/v1/hotels/:hotelId/ratings
//@access Public
exports.getRatings = async (req, res, next) => {
    let query;
    if (req.params.hotelId) {
        query = Rating.find({ hotel: req.params.hotelId }).populate({
            path: 'user',
            select: 'name email'
        });
    } else {
        query = Rating.find()
            .populate({ path: 'hotel', select: 'name province' })
            .populate({ path: 'user', select: 'name email' });
    }

    try {
        const ratings = await query;
        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: "Cannot find Ratings"
        });
    }
};

//@desc Add or update rating
//@route POST /api/v1/hotels/:hotelId/ratings
//@access Private
exports.addRating = async (req, res, next) => {
    try {
        req.body.hotel = req.params.hotelId;
        req.body.user = req.user.id;

        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: `No hotel with the id of ${req.params.hotelId}`
            });
        }

        // Check if rating exists for this user/hotel combo; if so, update it
        let rating = await Rating.findOne({ user: req.user.id, hotel: req.params.hotelId });

        //If score = 0 → delete rating instead of update/create
        if (req.body.score === 0) {
            if (rating) {
                await rating.deleteOne();
            }

            return res.status(200).json({
                success: true,
                data: {}
            });
        }

        if (rating) {
            // Update existing rating
            rating = await Rating.findByIdAndUpdate(rating._id, { score: req.body.score }, { new: true, runValidators: true });
        } else {
            // Create new rating
            rating = await Rating.create(req.body);
        }

        res.status(200).json({ success: true, data: rating });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot create/update Rating' });
    }
};

//@desc Delete rating
//@route DELETE /api/v1/ratings/:id
//@access Private
exports.deleteRating = async (req, res, next) => {
    try {
        const rating = await Rating.findById(req.params.id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: `No rating with the id of ${req.params.id}`
            });
        }

        //Make sure user is the rating owner
        if (rating.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this rating`
            });
        }

        await rating.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot delete Rating' });
    }
};

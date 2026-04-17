const express = require('express');
const { getRatings, addRating, deleteRating } = require('../controllers/ratings');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getRatings)
    .post(protect, addRating);

router.route('/:id')
    .delete(protect, deleteRating);

module.exports = router;

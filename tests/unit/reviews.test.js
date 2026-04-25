const { addReview } = require('../../controllers/reviews');
const Review = require('../../models/Review');
const Hotel = require('../../models/Hotel');
const Booking = require('../../models/Booking');

jest.mock('../../models/Review');
jest.mock('../../models/Hotel');
jest.mock('../../models/Booking');

describe('Reviews Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence controller's console.log(err.stack) so test output stays clean
    jest.spyOn(console, 'log').mockImplementation(() => { });
    req = { params: {}, user: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('addReview', () => {
    beforeEach(() => {
      req.params.hotelId = 'hotel123';
      req.user.id = 'user456';
      req.body = { score: 5, comment: 'Great hotel!' };
    });

    it('TC1: returns 404 when hotel not found', async () => {
      Hotel.findById.mockResolvedValue(null);
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('TC2: returns 403 when user has no booking at hotel', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue(null);
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('TC3: returns 400 when user already reviewed this hotel', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue({ _id: 'booking789' });
      Review.findOne.mockResolvedValue({ _id: 'existingReview' });
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('TC4: returns 400 when comment is whitespace only', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue({ _id: 'booking789' });
      Review.findOne.mockResolvedValue(null);
      req.body.comment = '   ';
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('TC5: creates review successfully and returns 201', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue({ _id: 'booking789' });
      Review.findOne.mockResolvedValue(null);
      const created = { _id: 'newReview', score: 5, comment: 'Great hotel!' };
      Review.create.mockResolvedValue(created);
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: created });
    });

    it('TC6: returns 400 on ValidationError from Review.create', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue({ _id: 'booking789' });
      Review.findOne.mockResolvedValue(null);
      Review.create.mockRejectedValue({
        name: 'ValidationError',
        message: 'score invalid',
        stack: 'fake stack'
      });
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('TC7: returns 400 on duplicate key error 11000 (race condition guard)', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue({ _id: 'booking789' });
      Review.findOne.mockResolvedValue(null);
      Review.create.mockRejectedValue({ code: 11000, stack: 'fake stack' });
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('TC8: returns 500 on unexpected error', async () => {
      Hotel.findById.mockResolvedValue({ _id: 'hotel123' });
      Booking.findOne.mockResolvedValue({ _id: 'booking789' });
      Review.findOne.mockResolvedValue(null);
      Review.create.mockRejectedValue(new Error('DB connection lost'));
      await addReview(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxLength: [50, 'Name can not be more than 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  district: {
    type: String,
    required: [true, 'Please add a district']
  },
  province: {
    type: String,
    required: [true, 'Please add a province']
  },
  postalcode: {
    type: String,
    required: [true, 'Please add a postalcode'],
    maxLength: [5, 'Postal Code can not be more than 5 digits']
  },
  tel: {
    type: String,
    required: [true, 'Please add a tel number']
  },
  region: {
    type: String,
    required: [true, 'Please add a region']
  },
  picture: {
    type: String,
    required: [true, 'Please add a picture']
  },
  dailyrate: {
    type: Number,
    required: [true, 'Please add a daily rate']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// virtuals
HotelSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

HotelSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

// cleanup services when hotel deleted
HotelSchema.pre("findOneAndDelete", async function(next) {
  const hotel = await this.model.findOne(this.getFilter());
  if (hotel) {
    await mongoose.model("RoomService").deleteMany({ hotel: hotel._id });
    await mongoose.model("Booking").deleteMany({ hotel: hotel._id });
  }
  next();
});

module.exports = mongoose.model('Hotel', HotelSchema);
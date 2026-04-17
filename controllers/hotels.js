const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

//@desc Get all hotels
//@route GET /api/v1/hotels
//@acess Public
exports.getHotels = async(req, res, next) => {
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Feilds to exclude
    const removeFeilds = ['select', 'sort', 'page', 'limit'];

    //Loop over remove feilds and delete them fron reqQuery
    removeFeilds.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in\b)/g, match => `${match}`);

    //finding resource
    query = Hotel.find(JSON.parse(queryStr)).populate('bookings').populate('ratings');

    //Select Feilds
    if(req.query.select){
        const feilds = req.query.select.split(',').join(' ');
        query = query.select(feilds);
    }

    //Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;

    try{
        const total = await Hotel.countDocuments();
        query = query.skip(startIndex).limit(limit);

        //Execute query
        const hotels = await query;

        //Pagination result
        const pagination = {};
        if(endIndex < total) {
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page: page-1,
                limit
            }
        }

        res.status(200).json({ success: true, count: hotels.length, pagination, data: hotels });

    } catch(err){
        res.status(400).json({success: false});
    }
};

//@desc Get single hotel
//@route GET /api/v1/hotels/:id
//@acess Public
exports.getHotel = async(req, res, next) => {
   try{
    const hotel = await Hotel.findById(req.params.id).populate('ratings');

    if(!hotel){
        return  res.status(400).json({success: false});
    }

    res.status(200).json({success: true, data: hotel});

   } catch(err){
    res.status(400).json({success: false});
   }
};


//@desc Create a hotel
//@route POST /api/v1/hotels
//@acess Private
exports.createHotel= async(reg,res,next)=>{
    const hotel = await Hotel.create(reg.body);
    res.status(201).json({success: true , data: hotel});
};

//@desc Update single hotel
//@route PUT /api/v1/hotels/:id
//@acess Private
exports.updateHotel = async(req, res, next) => {
    try{
        const hotel = await Hotel.findByIdAndUpdate(req.params.id ,req.body,{
            new: true,
            runValidators: true
        });

        if(!hotel){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true,data: hotel});

    } catch(err){
        res.status(400).json({success: false});
    }
};

//@desc Delete single hotel
//@route DELETE /api/v1/hotels/:id
//@acess Private
exports.deleteHotel = async(req, res, next) => {
   try{
        const hotel = await Hotel.findById(req.params.id);

        if(!hotel){
            return res.status(400).json({
                success: false,
                message: `Hotel not found with id of ${req.params.id}`
                });
        }
        await Booking.deleteMany({hotel: req.params.id});
        await Hotel.deleteOne({_id: req.params.id});

        res.status(200).json({success: true, data: {}});
        
   } catch(err){
        return res.status(400).json({
            success: false, 
            msg: `Cannot Delete hotel ${req.params.id}`
        });
   }
};

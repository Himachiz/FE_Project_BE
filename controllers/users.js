const User = require('../models/User');


exports.getUsers = async (req, res, next) => {
    let query;

    // 1. Copy req.query
    const reqQuery = { ...req.query };

    // 2. Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // 3. Create query string & add MongoDB operators ($)
    let queryStr = JSON.stringify(reqQuery);
    // Fixed: Added the '$' sign so MongoDB recognizes gt, gte, etc.
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // 4. Finding resource (Targeting User instead of Hotel)
    // We select only '_id' to make the query extremely fast
    query = User.find(JSON.parse(queryStr));

    // 5. Select Fields (If user wants more than just ID)
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // 6. Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // 7. Pagination Setup
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await User.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // 8. Execute query
        const users = await query;

        // 9. Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({ 
            success: true, 
            count: users.length, 
            pagination, 
            data: users 
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        // 1. Find the user and update them with whatever is in req.body
        // The { new: true } option ensures it returns the updated document, not the old one
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {
                new: true,
                runValidators: true
            }
        );

        // 2. Check if the user actually existed
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with id of ${req.params.id}`
            });
        }

        // 3. Send back the success response with the newly updated user data
        res.status(200).json({ 
            success: true, 
            data: user 
        });

    } catch (err) {
        res.status(500).json({
            success: false, 
            message: `Server Error: ${err.message}`
        });
    }
};

exports.deleteUser = async(req,res,next) => {
try{
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user){
        return res.status(400).json({
            success: false,
            message: `User not found with id of ${req.params.id}`
            });
        }

    res.status(200).json({success: true, data: {}});
        
} catch(err){
    return res.status(400).json({
        success: false, 
        msg: `Cannot Delete User ${req.params.id}`
        });
   }
};

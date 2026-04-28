const User=require('../models/User');

const isStringField = (value) => typeof value === 'string' && !Array.isArray(value);

//@desc Register user
//@route GET /api/v1/auth/register
//@acess Public
exports.register = async(req, res, next) => {
    try{
        const {name, tel, email, password, role} = req.body;
        if (!isStringField(email) || !isStringField(password)) {
            return res.status(400).json({
                success: false,
                msg: 'Email and password must be strings'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide an email and password'
            });
        }

        //Create user
        const user=await User.create({
            name,
            tel,
            email: normalizedEmail,
            password: normalizedPassword,
            role
        });

        //Create token
        // const token=user.getSignedJwtToken();

        // res.status(200).json({success: true, token});
        sendTokenResponse(user, 200, res);

    } catch(err){ 
        console.log(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

//@desc Login user
//@route POST /api/v1/auth/login
//@access Publiv
exports.login = async(req, res, next) => {
    try {
        const {email, password}=req.body;

        if (!isStringField(email) || !isStringField(password)) {
            return res.status(400).json({
                success: false,
                msg: 'Email and password must be strings'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        //Validate email & password
        if(!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({success: false, msg: 'Please provide an email and password'}) ;
        }

        //Check for user
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if(!user) {
            return res.status(400).json({success: false, msg: 'Invalid credentials'}) ;
        }

        if (user.isban) {
            return res.status(403).json({ success: false, message: 'Your account is banned' });
        }

        //Check if password matches
        const isMatch = await user.matchPassword(normalizedPassword) ;

        if(!isMatch) {
            return res.status(401).json({success: false, msg: 'Invalid credentials'}) ;
        }

        sendTokenResponse(user, 200, res);
    } catch(err) {
        console.log(err);
        res.status(500).json({success: false, message: 'Server error during login'});
    }
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res)=>{
    //Create token
    const token=user.getSignedJwtToken();
    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true  
    };

    if(process.env.NODE_ENV==='production'){
        options.secure=true;
    }

    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        tel: user.tel,
        role: user.role,
        createdAt: user.createdAt,
        isban: user.isban
    });
}

//@desc Get current Logged in user
//@route POST /api/vl/auth/me
//@access Private
exports.getMe = async(req, res, next)=>{
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({success: true, data: user});
    } catch(err) {
        console.log(err);
        res.status(500).json({success: false, message: 'Cannot fetch user profile'});
    }
};

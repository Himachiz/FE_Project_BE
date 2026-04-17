const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require("cookie-parser");
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//Route files
const hotels = require ('./routes/hotels');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const users = require('./routes/users');
const ratings = require('./routes/ratings');

const app = express();

//add cookie parser
app.use(cookieParser());

//add body parser
app.use(express.json());

//Mount routers
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/users',users);
app.use('/api/v1/ratings', ratings);

//Extend Parser
app.set('query parser', 'extended');

const PORT=process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(
        'Server running in ', 
        process.env.NODE_ENV, 
        'mode on port', 
        process.env.HOST + ": " + PORT
    )
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
})
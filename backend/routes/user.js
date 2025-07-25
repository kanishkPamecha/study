const express = require('express');
const router = express.Router();

// Controllers
const {
    signup,
    login,
    changePassword
} = require('../controllers/auth');




// Middleware
const { auth } = require('../middleware/auth');


// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route for sending OTP to the user's email
// router.post('/sendotp', sendOTP);

// Route for Changing the password
router.post('/changepassword', auth, changePassword);






module.exports = router

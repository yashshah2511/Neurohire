const express = require('express');
const router = express.Router();
const uploadProfile = require("../middlewares/Multer");
const { verifyToken } = require("../middlewares/AuthMiddleware");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Import all controllers (make sure usercontroller.js exports functions like: exports.createUser = ...)
const userController = require('../controllers/Usercontroller');

// User routes
router.get('/users', userController.getAllUsers);
router.post('/user/signup', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOTP);
router.post('/verify-otp', userController.verifyOTP);
router.post('/change-password', userController.changePassword);
router.post('/recruiter/signup', userController.recruiterSignup);
router.post('/recruiter/verify', userController.verifyRecruiterOTP);
router.get(  "/user/profile/:userId",verifyToken,userController.getUserProfile);
router.put("/user/update-profile/:userId",verifyToken,uploadProfile,userController.updateUserProfile);

// public company profile
router.get('/company/:recruiterId', userController.getPublicCompany);



// ---------------- GOOGLE AUTH ROUTES ----------------

// ---------------- GOOGLE AUTH ----------------
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  userController.googleLoginSuccess
);

router.get("/google/failure", userController.googleLoginFailure);

module.exports = router;

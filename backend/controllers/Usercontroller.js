const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/SendEmail');
const client = require('../utils/SendSms');
const axios = require('axios');
const { checkCompanyWebsite, normalizeUrl } = require("../utils/checkWebsite");
const { checkLinkedInCompany } = require("../utils/CheckLinkedIn");
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const Job = require('../models/JobModel');


exports.createUser = async (req, res) => {
  try {
    const { fullname, email, password, phoneno } = req.body;
    console.log(req.body);

    // 🔍 Validate required fields
    if (!fullname || !email || !password || !phoneno) {
      return res.status(400).json({ message: "Name, email,phone number and password are required." });
    }

    // 🔄 Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists. Please use a different email." });
    }

    // 🔄 Check if the phoneno already exists
    const existingphoneno = await User.findOne({ phoneno });
    if (existingphoneno) {
      return res.status(409).json({ message: "phone no already exists. Please use a different phone no" });
    }

    // 🔐 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate OTP and create user (require email verification)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      phoneno,
      otp,
      otpExpiresAt,
      isOtpVerified: false,
    });

    await user.save();

    // send OTP email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your NeuroHire account',
        html: `
          <h2>Welcome to NeuroHire</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing:3px;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        `,
      });
    } catch (e) {
      console.error('Failed to send signup OTP email', e);
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify OTP sent to your email.',
      data: { email }
    });
  } catch (err) {
    console.error("Error while creating user:", err);
    res.status(500).json({
      message: "Something went wrong while creating the user",
      error: err.message
    });
  }
};


// ✅ Get all users (with optional role filter)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // 👈 role comes from frontend (query param)

    let filter = {};
    if (role) {
      filter.role = role; // if role=user/admin → apply filter
    }

    const users = await User.find(filter);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }

    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error while fetching users:', error);
    res.status(500).json({
      message: 'Something went wrong while fetching users',
      error: error.message
    });
  }
};

// Login Route
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    // console.log("Login attempt for email:", email);
    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }


    // Check if the user exists
    const user = await User.findOne({ email });
    // console.log("User found:", user);
    if (!user) {
      return res.status(401).json({ message: "email is invalid" });
    }

    // Ensure user registered with local auth
    if (user.authProvider !== 'local') {
      return res.status(400).json({
        message: `Please login using ${user.authProvider}`
      });
    }

    //  Only verified recruiters can login
    // -------------------------------
    if (user.role === "recruiter" && !user.isRecruiterVerified) {
      return res.status(403).json({
        message: "Your recruiter account is not verified. Please complete email verification."
      });
    }

    // Require OTP verification for all users before login
    if (!user.isOtpVerified) {
      return res.status(403).json({
        message: "Please verify your account via the OTP sent to your email before logging in."
      });
    }

    // Compare the password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "password is incorrect" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload with user info
      process.env.JWT_SECRET,  // Secret key from .env file
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    // Do not log tokens to avoid leaking secrets

    // Send the response with the token and user data
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phoneno: user.phoneno,
        role: user.role,
        token: token
      }
    });

  } catch (err) {
    console.error("Error while logging in:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
      error: err.message
    });
  }
};



exports.sendOTP = async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ message: "Email or phone is required" });
  }

  const isEmail = /\S+@\S+\.\S+/.test(input);
  const isPhone = /^[0-9]{10}$/.test(input);

  let user;

  /* ---------------- FIND USER ---------------- */
  if (isEmail) {
    user = await User.findOne({ email: input });
    if (!user) return res.status(404).json({ message: "Email not found" });

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please login using Google."
      });
    }
  }
  else if (isPhone) {
    user = await User.findOne({ phoneno: input });
    if (!user) return res.status(404).json({ message: "Phone number not found" });
  }
  else {
    return res.status(400).json({ message: "Invalid email or phone" });
  }

  /* ---------------- BLOCK RE-SEND UNTIL EXPIRY ---------------- */
  if (user.otp && user.otpExpiresAt > Date.now()) {
    const remaining = Math.ceil((user.otpExpiresAt - Date.now()) / 1000);

    return res.status(429).json({
      message: `OTP already sent. Please wait ${remaining} seconds`,
      remainingTime: remaining
    });
  }

  /* ---------------- GENERATE OTP ---------------- */
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {

    /* ---------------- EMAIL OTP ---------------- */
    if (isEmail) {

      await sendEmail({
        to: input,
        subject: "Your OTP Code – NeuroHire",
        html: `
          <h2>NeuroHire OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:3px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <br/>
          <p>If you did not request this, please ignore this email.</p>
        `
      });

      user.otp = otp;
      user.otpExpiresAt = expiry;
      user.isOtpVerified = false;
      await user.save();

      console.log("📧 Email OTP sent:", input);
      return res.json({ message: "OTP sent successfully" });
    }

    /* ---------------- PHONE OTP (TWILIO) ---------------- */
    if (isPhone) {

      await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
        .verifications
        .create({
          to: `+91${input}`,
          channel: "sms"
        });

      // Store backup OTP in DB
      user.otp = otp;
      user.otpExpiresAt = expiry;
      user.isOtpVerified = false;
      await user.save();

      console.log("📱 SMS OTP sent:", input);
      return res.json({ message: "OTP sent successfully" });
    }

  } catch (err) {
    console.error("❌ OTP sending failed:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};




exports.verifyOTP = async (req, res) => {
  try {
    const { input, otp } = req.body;
    console.log(req.body);

    if (!input || !otp)
      return res.status(400).json({ message: "Input & OTP required" });

    const isEmail = /\S+@\S+\.\S+/.test(input);
    const isPhone = /^[0-9]{10}$/.test(input);

    let user;

    if (isEmail) user = await User.findOne({ email: input });
    else if (isPhone) user = await User.findOne({ phoneno: input });
    else return res.status(400).json({ message: "Invalid email or phone format" });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ---------------- EMAIL OTP CHECK ----------------
    if (isEmail) {
      if (!user.otp || user.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

      if (user.otpExpiresAt < Date.now())
        return res.status(400).json({ message: "OTP expired" });

      user.isOtpVerified = true;
      await user.save();

      return res.json({ message: "OTP verified successfully" });
    }

    // ---------------- PHONE OTP CHECK (TWILIO VERIFY) ----------------
    if (isPhone) {
      const result = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
        .verificationChecks
        .create({
          to: `+91${input}`,
          code: otp
        });

      if (result.status !== "approved")
        return res.status(400).json({ message: "Invalid or expired OTP" });

      user.isOtpVerified = true;
      await user.save();

      return res.json({ message: "OTP verified successfully" });
    }

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




exports.changePassword = async (req, res) => {
  const { input, password } = req.body;

  if (!input || !password)
    return res.status(400).json({ message: "Input & Password required" });

  const isEmail = /\S+@\S+\.\S+/.test(input);
  const isPhone = /^[0-9]{10}$/.test(input);

  let user;

  if (isEmail) user = await User.findOne({ email: input });
  else if (isPhone) user = await User.findOne({ phoneno: input });
  else return res.status(400).json({ message: "Invalid email or phone" });

  if (!user) return res.status(404).json({ message: "User not found" });

  // Must verify OTP before changing password
  if (!user.isOtpVerified)
    return res.status(400).json({ message: "OTP not verified or expired" });

  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.isOtpVerified =true;

  await user.save();

  res.json({ message: "Password changed successfully" });
};




// Block personal email domains
const blockedDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
];

// Extract domain from email
const getDomain = (email) => email.split("@")[1].toLowerCase();

exports.recruiterSignup = async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      phoneno,
      companyName,
      companyWebsite,
      linkedinUrl,
      city,
      state,
      country,
    } = req.body;

    // 1️⃣ BASIC VALIDATION
    if (!fullname || !email || !password || !companyName || !companyWebsite) {
      return res.status(400).json({
        message:
          "Full name, email, password, company name, and company website are required",
      });
    }

    // 2️⃣ EMAIL DOMAIN CHECK
    const emailDomain = getDomain(email);
    // /////////////////////////////////////////////////////////id=f condition

    if (blockedDomains.includes(emailDomain)) {
      return res.status(400).json({
        message: "Recruiters must use an official company email",
      });
    }

    // 3️⃣ CHECK EXISTING USER
    // 3️⃣ CHECK EXISTING USER EMAIL
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 3.1️⃣ CHECK COMPANY NAME
    const existingCompany = await User.findOne({ companyName });
    if (existingCompany) {
      return res.status(409).json({
        message: "Company name already registered with another recruiter",
      });
    }

    // 3.2️⃣ CHECK COMPANY WEBSITE
    const existingWebsite = await User.findOne({ companyWebsite });
    if (existingWebsite) {
      return res.status(409).json({
        message: "This company website is already registered",
      });
    }

    // 3.3️⃣ CHECK LINKEDIN URL
    if (linkedinUrl) {
      const existingLinkedin = await User.findOne({ linkedinUrl });
      if (existingLinkedin) {
        return res.status(409).json({
          message: "This LinkedIn company profile is already registered",
        });
      }
    }

    // 4️⃣ NORMALIZE WEBSITE URL (🔥 FIXES INVALID URL ERROR)
    const normalizedWebsite = normalizeUrl(companyWebsite);

    if (!normalizedWebsite) {
      return res.status(400).json({
        message: "Invalid company website",
      });
    }

    // 5️⃣ EMAIL DOMAIN ↔ WEBSITE DOMAIN MATCH
    const websiteDomain = new URL(normalizedWebsite).hostname.replace("www.", "");
// //////////////////////////////////////////////////////////////if condition
    if (!emailDomain.endsWith(websiteDomain)) {
      return res.status(400).json({
        message: "Email domain does not match company website domain",
      });
    }

    // 6️⃣ VERIFY COMPANY WEBSITE EXISTS
    const websiteCheck = await checkCompanyWebsite(normalizedWebsite);

    if (!websiteCheck.valid) {
      return res.status(400).json({
        message: websiteCheck.message,
      });
    }
// //////////////////////////////////////////if condition
    // Optional: require at least one business page
    if (websiteCheck.pagesFound.length === 0) {
      return res.status(400).json({
        message: "Website does not appear to be a business website",
      });
    }

    // 7️⃣ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8️⃣ OTP GENERATION
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 9️⃣ SEND OTP EMAIL
    await sendEmail({
      to: email,
      subject: "Verify Your Recruiter Account – NeuroHire",
      html: `
    <h2>Welcome to NeuroHire 🚀</h2>
    <p>Hello ${fullname},</p>
    <p>Your verification OTP is:</p>
    <h1 style="letter-spacing:3px;">${otp}</h1>
    <p>This OTP will expire in 5 minutes.</p>
    <br/>
    <p>If you did not request this, please ignore this email.</p>
  `
    });


    // 🔟 SAVE RECRUITER
    const recruiter = new User({
      fullname,
      email,
      password: hashedPassword,
      phoneno,
      role: "recruiter",

      companyName,
      companyWebsite: normalizedWebsite,
      linkedinUrl,

      location: { city, state, country },

      otp,
      otpExpiresAt,
      isOtpVerified: false,
      isRecruiterVerified: false,
    });

    await recruiter.save();

    return res.status(201).json({
      success: true,
      message: "Recruiter registered successfully. Please verify OTP.",
    });
  } catch (err) {
    console.error("Recruiter Signup Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


exports.verifyRecruiterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP are required" });
    }

    // Find the recruiter
    const recruiter = await User.findOne({ email, role: "recruiter" });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter account not found" });
    }

    // OTP must exist
    if (!recruiter.otp) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    // OTP expired
    if (recruiter.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    console.log(recruiter.otp, otp);
    // OTP mismatch
    if (recruiter.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is correct → verify recruiter
    recruiter.isOtpVerified = true;
    recruiter.isRecruiterVerified = true;

    // Remove OTP fields
    recruiter.otp = undefined;
    recruiter.otpExpiresAt = undefined;

    await recruiter.save();

    return res.json({
      success: true,
      message: "Recruiter account verified successfully"
    });

  } catch (err) {
    console.error("Recruiter OTP Verification Error:", err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};



// ---------------- GOOGLE LOGIN SUCCESS ----------------
exports.googleLoginSuccess = async (req, res) => {
  try {
    const googleUser = req.user;

    if (!googleUser || !googleUser.email) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=google_user_not_found`
      );
    }

    // ✅ Normalize Google profile image
    const googleProfileImage =
      googleUser.picture ||
      googleUser.googlePicture ||
      (googleUser.photos && googleUser.photos[0]?.value) ||
      null;

    // ---------------- FIND USER IN DB ----------------
    let user = await User.findOne({ email: googleUser.email });

    // ---------------- CREATE NEW USER ----------------
    if (!user) {
      user = await User.create({
        fullname: googleUser.fullname || googleUser.displayName,
        email: googleUser.email,
        googleId: googleUser.googleId || googleUser.id,
        profileImage: googleProfileImage, // ✅ STORED HERE
        authProvider: "google",
        role: "user" // 🚫 recruiter NOT allowed via Google
      });
    }

    // ---------------- EXISTING USER ----------------
    let isUpdated = false;

    if (!user.googleId && (googleUser.googleId || googleUser.id)) {
      user.googleId = googleUser.googleId || googleUser.id;
      isUpdated = true;
    }

    // ✅ Update profile image if missing
    if (!user.profileImage && googleProfileImage) {
      user.profileImage = googleProfileImage;
      isUpdated = true;
    }

    if (user.authProvider !== "google") {
      user.authProvider = "google";
      isUpdated = true;
    }

    if (isUpdated) {
      await user.save();
    }

    // ---------------- BLOCK UNVERIFIED RECRUITER ----------------
    if (user.role === "recruiter" && !user.isRecruiterVerified) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=recruiter_not_verified`
      );
    }

    // ---------------- GENERATE JWT ----------------
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---------------- REDIRECT ----------------
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}&role=${user.role}&userId=${user._id}&email=${encodeURIComponent(
        user.email
      )}&phoneNo=${user.phoneno || ""}`
    );

  } catch (error) {
    console.error("Google Login Error:", error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=google_login_failed`
    );
  }
};


// ---------------- GOOGLE LOGIN FAILURE ----------------
exports.googleLoginFailure = (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed"
  });
};

// ---------------- GET USER PROFILE ----------------
exports.getUserProfile = async (req, res) => {
  try {
    const paramUserId = req.params.userId;
    const tokenUserId = req.user.userId;

    // 🔐 SECURITY CHECK
    if (paramUserId !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this profile",
      });
    }

    const user = await User.findById(paramUserId).select(
      "-password -otp -otpExpiresAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};


// ---------------- UPDATE USER PROFILE ----------------
exports.updateUserProfile = async (req, res) => {
  try {
    const paramUserId = req.params.userId;      // from URL
    const tokenUserId = req.user.userId;        // from JWT

    // 🔐 SECURITY CHECK
    if (paramUserId !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this profile",
      });
    }

    const {
      fullname,
      dob,
      gender,
      street,
      city,
      state,
      pincode,
      country,
      companyName,
      companyWebsite,
      linkedinUrl,
      companyDescription,
      industry,
      companySize,
      companyAddress,
      foundedYear,
      mission,
      values,
      skills,
      contactEmail,
      contactPhone,
    } = req.body;

    const user = await User.findById(paramUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ---------------- PROFILE IMAGE HANDLING ----------------
    // Multer already:
    // ✔ creates folder
    // ✔ overwrites old image
    // ❌ DO NOT delete files here

    // handle profileImage and resume from multipart fields
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        const file = req.files.profileImage[0];
        const relativePath = path
          .relative(path.join(__dirname, ".."), file.path)
          .replace(/\\/g, "/");
        user.profileImage = relativePath;
      }
      if (req.files.resume && req.files.resume[0]) {
        const rfile = req.files.resume[0];
        const relativeResume = path
          .relative(path.join(__dirname, ".."), rfile.path)
          .replace(/\\/g, "/");
        user.resume = relativeResume;
      }
      if (req.files.companyLogo && req.files.companyLogo[0]) {
        const cfile = req.files.companyLogo[0];
        const relLogo = path
          .relative(path.join(__dirname, ".."), cfile.path)
          .replace(/\\/g, "/");
        user.companyLogo = relLogo;
      }
    }

    // ---------------- UPDATE OTHER FIELDS ----------------
    if (fullname) user.fullname = fullname;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (street) user.street = street;
    if (city) user.city = city;
    if (state) user.state = state;
    if (pincode) user.pincode = pincode;
    if (country) user.country = country;

    // recruiter/company fields (only update if user is a recruiter)
    if (user.role === 'recruiter') {
      if (companyName) user.companyName = companyName;
      if (companyWebsite) user.companyWebsite = companyWebsite;
      if (linkedinUrl) user.linkedinUrl = linkedinUrl;
      if (companyDescription) user.companyDescription = companyDescription;
      if (industry) user.industry = industry;
      if (companySize) user.companySize = companySize;
      if (companyAddress) user.companyAddress = companyAddress;
      if (foundedYear) user.foundedYear = foundedYear;
      if (mission) user.mission = mission;
      if (contactEmail) user.contactEmail = contactEmail;
      if (contactPhone) user.contactPhone = contactPhone;

      // parse comma-separated values/skills if provided as string
      if (values) {
        if (typeof values === 'string') {
          user.values = values.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(values)) user.values = values;
      }

      if (skills) {
        if (typeof skills === 'string') {
          user.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(skills)) user.skills = skills;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        fullname: user.fullname,
        profileImage: user.profileImage,
        dob: user.dob,
        gender: user.gender,
        street: user.street,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
      },
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Public: get company profile and their open jobs
exports.getPublicCompany = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId;
    const user = await User.findById(recruiterId).select('companyName companyWebsite linkedinUrl companyDescription industry companySize companyAddress foundedYear profileImage fullname mission values skills contactEmail contactPhone companyLogo');
    if (!user) return res.status(404).json({ success: false, message: 'Company not found' });

    // fetch open jobs by this recruiter
    const jobs = await Job.find({ recruiterId: recruiterId, status: 'open' }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: { company: user, jobs } });
  } catch (e) {
    console.error('getPublicCompany error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch company profile' });
  }
};
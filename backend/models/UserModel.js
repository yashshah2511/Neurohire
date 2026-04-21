const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    // ---------- Basic User Fields ----------
    fullname: String,
    email: { type: String, unique: true },
    password: String,
    phoneno:String,


     // ---------- Profile ----------
    profileImage: String, // Store image file name or full URL
    googlePicture: String,    
    
    dob: Date,
    gender: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,


    // ---------- Role System ----------
    role: {
        type: String,
        enum: ['admin', 'user', 'recruiter'],
        default: 'user' // default role
    },


     // ---------- Google Auth ----------
    googleId: { type: String, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    

    // ---------- OTP System ----------
    otp: String,
    otpExpiresAt: Date,
    isOtpVerified: {
    type: Boolean,
    default: false
    },


    // ---------- Recruiter Verification ----------
    companyName: { type: String },
    companyWebsite: { type: String },
    linkedinUrl: { type: String },
    isRecruiterVerified: {
        type: Boolean,
        default: false
    }

    ,
    // ---------- Company Details (for recruiters)
    companyDescription: { type: String },
    industry: { type: String },
    companySize: { type: String },
    companyAddress: { type: String },
    foundedYear: { type: String },
    // Additional company details
    mission: { type: String },
    values: [{ type: String }],
    skills: [{ type: String }],
    contactEmail: { type: String },
    contactPhone: { type: String },
    companyLogo: { type: String },

        
        // ---------- Admin Controls ----------
        blocked: {
            type: Boolean,
            default: false
        }

        ,
        // ---------- Extracted Skills ----------
        skills: [
            { type: String }
        ]
        ,
        // ---------- Profile Resume ----------
        resume: { type: String }, // path to resume PDF stored on server

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

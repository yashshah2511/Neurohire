# NeuroHire Backend - Node.js API Server

A robust, scalable Node.js/Express backend API for the NeuroHire AI-powered recruitment platform. Built with Express, MongoDB, JWT authentication, and ML integration for resume matching.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Architecture](#architecture)
- [File Organization](#file-organization)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication & Security](#authentication--security)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The NeuroHire backend is a comprehensive REST API serving a modern recruitment platform. It handles:
- User authentication & authorization (JWT-based)
- Job posting and management
- Application processing & status tracking
- Resume parsing and ML-based candidate matching
- Bidirectional feedback system (User ↔ Recruiter)
- Admin dashboard and monitoring
- File uploads (profile pictures, resumes, job images)
- Email notifications and SMS alerts

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | ^16+ |
| **Framework** | Express.js | ^5.2.1 |
| **Database** | MongoDB | Latest |
| **ODM** | Mongoose | ^9.0.1 |
| **Authentication** | JWT (jsonwebtoken) | ^9.0.3 |
| **Password Hashing** | bcryptjs & bcrypt | ^3.0.3, ^6.0.0 |
| **File Upload** | Multer | ^2.0.2 |
| **PDF Processing** | pdf-parse, pdf2json | ^1.1.1, ^1.1.7 |
| **Emails** | Nodemailer | ^7.0.11 |
| **SMS** | Twilio | ^5.10.7 |
| **OAuth** | Passport + Google OAuth | ^0.7.0, ^2.0.0 |
| **Session** | express-session | ^1.18.2 |
| **HTTP** | Axios | ^1.13.2 |
| **CORS** | cors | ^2.8.5 |
| **Env Config** | dotenv | ^17.2.3 |
| **Dev Tool** | Nodemon | ^3.1.11 |

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                        # MongoDB connection setup
│   └── passport.js                  # Google OAuth configuration
├── controllers/
│   ├── Usercontroller.js            # User CRUD & profile management
│   ├── recruiterController.js       # Recruiter-specific operations
│   ├── adminController.js           # Admin operations & stats
│   ├── jobController.js             # Job posting CRUD
│   ├── applicationController.js     # Application management
│   ├── postController.js            # Social posts management
│   ├── feedbackController.js        # Feedback system (user ↔ recruiter)
│   ├── mlController.js              # ML-based matching
│   └── mlUtils.js                   # ML utility functions
├── models/
│   ├── UserModel.js                 # User schema (job seekers)
│   ├── JobModel.js                  # Job posting schema
│   ├── ApplicationModel.js          # Job application schema
│   ├── PostModel.js                 # Social post schema
│   ├── UserFeedbackModel.js         # User→Recruiter feedback
│   └── RecruiterFeedbackModel.js    # Recruiter→User feedback
├── routes/
│   ├── UserRoutes.js                # User endpoints
│   ├── recruiterRouter.js           # Recruiter endpoints (dashboard, charts)
│   ├── adminRouter.js               # Admin endpoints
│   ├── jobRoutes.js                 # Job management endpoints
│   ├── applicationRoutes.js         # Application endpoints
│   ├── postRoutes.js                # Post endpoints
│   ├── mlRoutes.js                  # ML matching endpoints
│   └── feedbackRoutes.js            # Feedback endpoints
├── middlewares/
│   ├── AuthMiddleware.js            # JWT verification middleware
│   ├── Multer.js                    # Profile image upload configuration
│   ├── JobImageMulter.js            # Job image upload configuration
│   └── ResumeMulter.js              # Resume file upload configuration
├── upload/
│   ├── companylogos/                # Uploaded company logos
│   ├── jobposts/                    # Job post images
│   ├── posts/                       # Social post images
│   ├── profileimages/               # User profile pictures
│   └── resumes/                     # Uploaded resumes
├── utils/
│   ├── CheckLinkedIn.js             # LinkedIn profile validation
│   ├── CheckWebsite.js              # Website URL validation
│   ├── SendEmail.js                 # Email sending utility
│   └── SendSms.js                   # SMS sending utility
├── tools/
│   └── test_ml_match.js             # ML testing tools
├── app.js                           # Express app configuration
├── index.js                         # Server entry point
├── package.json                     # Dependencies
.env                                 # Environment variables (NOT in repo)
└── .gitignore                       # Git ignore rules
```

---

## 📋 Prerequisites

Before installing, ensure you have:

1. **Node.js** (v16 or higher)
   ```bash
   node --version  # Should be v16+
   ```

2. **npm** (v8 or higher)
   ```bash
   npm --version  # Should be v8+
   ```

3. **MongoDB** (Local or Cloud)
   - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

4. **Git**
   ```bash
   git --version
   ```

5. **API Keys/Credentials Required:**
   - MongoDB Connection String
   - JWT Secret Key
   - Google OAuth credentials (optional)
   - Twilio Account SID & Auth Token (for SMS)
   - Nodemailer email configuration (for notifications)

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/neurohire.git
cd neurohire/backend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`:
- Express.js and related middleware
- Mongoose for MongoDB ODM
- JWT for authentication
- Multer for file uploads
- Email and SMS services
- And more...

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=2000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/neurohire
# OR use MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/neurohire

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=30d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:2000/auth/google/callback

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@neurohire.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./upload

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Verify MongoDB Connection

Start MongoDB service:
```bash
# On Windows
mongod

# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### 5. Start the Development Server

```bash
npm start
```

Server will start on `http://localhost:2000`  
It uses Nodemon for auto-reload on file changes

---

## 🏗 Architecture

### Request-Response Flow

```
1. Client sends HTTP Request
   ↓
2. Express Router matches endpoint
   ↓
3. Authentication Middleware (verifyToken)
   ↓
4. Request lives in Controller
   ↓
5. Controller interacts with Database via Mongoose
   ↓
6. Business logic (validation, ML matching, etc.)
   ↓
7. Response formatted and sent to client
   ↓
8. Client receives data with status code
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│        HTTP Request (Frontend)      │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Routes (Express Router)        │ ← Define endpoints
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Middlewares                    │ ← Auth, validation, CORS
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Controllers                    │ ← Business logic
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Models (Mongoose)              │ ← Database schema & validation
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      MongoDB Database               │ ← Data persistence
└─────────────────────────────────────┘
```

### Authentication Flow

```
1. User registers or logs in
   ↓
2. Credentials validated
   ↓
3. JWT token generated (includes userId & role)
   ↓
4. Token sent to frontend, stored in localStorage
   ↓
5. Frontend includes token in Authorization header for future requests
   ↓
6. Backend verifies token signature and expiration
   ↓
7. Request proceeds or returns 401 Unauthorized
```

---

## 📂 File Organization Details

### Controllers (Business Logic)

| File | Purpose | Key Methods |
|------|---------|-------------|
| **Usercontroller.js** | User account management | register, login, getProfile, updateProfile, deleteAccount |
| **recruiterController.js** | Recruiter operations | companyJobs, applicationStats, hiringAnalytics |
| **adminController.js** | Admin operations | getDashboard, getPlatformStats, manageUsers |
| **jobController.js** | Job CRUD operations | createJob, getJobs, updateJob, deleteJob, getJobDetails |
| **applicationController.js** | Application management | submitApplication, getApplications, updateStatus |
| **feedbackController.js** | Feedback system | createUserFeedback, createRecruiterFeedback, getFeedback, adminGetAllFeedback, deleteFeedback |
| **mlController.js** | ML-based matching | matchResume, calculateScore, rankCandidates |
| **postController.js** | Social posts | createPost, getPosts, updatePost, deletePost |

### Models (Database Schema)

| File | Collection | Key Fields |
|------|-----------|-----------|
| **UserModel.js** | users | userId, email, password, profile, resume, skills |
| **JobModel.js** | jobs | title, company, location, salary, requirements, status |
| **ApplicationModel.js** | applications | userId, jobId, status, resume, coverLetter, appliedAt |
| **UserFeedbackModel.js** | userfeedbacks | userId, recruiterId, interviewRating, companyRating, comments |
| **RecruiterFeedbackModel.js** | recruiterfeedbacks | userId, recruiterId, candidateRating, skillsFeedback, improvementAreas |
| **PostModel.js** | posts | userId, title, description, images, likes, comments |

### Routes (API Endpoints)

| File | Base URL | Purpose |
|------|----------|---------|
| **UserRoutes.js** | /api/user | User profile, auth |
| **recruiterRouter.js** | /api/recruiter | Dashboard, charts, applicants |
| **jobRoutes.js** | /api/jobs | Job CRUD |
| **applicationRoutes.js** | /api/applications | Application management |
| **feedbackRoutes.js** | /api/feedback | Feedback submission & retrieval |
| **mlRoutes.js** | /api/ml | Resume matching |
| **adminRouter.js** | /api/admin | Admin operations |

### Middlewares (Request Processing)

| File | Purpose | Usage |
|------|---------|-------|
| **AuthMiddleware.js** | JWT verification | Protects private routes, extracts userId |
| **Multer.js** | Profile image upload | Handles multipart/form-data for profiles |
| **JobImageMulter.js** | Job image upload | File size limit, directory config |
| **ResumeMulter.js** | Resume upload | PDF/DOC validation, storage path |

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/user/register              # Register new user
POST   /api/user/login                 # Login user/recruiter
GET    /api/user/profile               # Get current user profile (protected)
PUT    /api/user/profile               # Update user profile (protected)
DELETE /api/user/account               # Delete account (protected)
```

### Jobs

```
GET    /api/jobs                       # Get all jobs (paginated, filterable)
GET    /api/jobs/:id                   # Get job details
POST   /api/jobs                       # Create new job (protected, recruiter)
PUT    /api/jobs/:id                   # Update job (protected, recruiter)
DELETE /api/jobs/:id                   # Delete job (protected, recruiter)
GET    /api/recruiter/jobs             # Get my jobs (protected, recruiter)
```

### Applications

```
POST   /api/applications               # Submit job application (protected)
GET    /api/applications               # Get my applications (protected)
GET    /api/applications/:id           # Get application details (protected)
PUT    /api/applications/:id/status    # Update app status (protected, recruiter)
GET    /api/recruiter/applicants       # Get job applicants (protected, recruiter)
```

### Feedback

```
POST   /api/feedback/user              # Submit user feedback (protected)
GET    /api/feedback/user/:id          # Get user feedback (protected)
POST   /api/feedback/recruiter         # Submit recruiter feedback (protected)
GET    /api/feedback/recruiter/:id     # Get recruiter feedback (protected)
GET    /api/admin/feedback             # Get all feedback (protected, admin)
DELETE /api/admin/feedback/:id         # Delete feedback (protected, admin)
```

### Recruiter Dashboard

```
GET    /api/recruiter/dashboard        # Dashboard stats (protected)
GET    /api/recruiter/dashboard/charts # Chart data (applications momentum) (protected)
```

### Admin

```
GET    /api/admin/dashboard            # Admin dashboard (protected, admin)
GET    /api/admin/users                # Get all users (protected, admin)
GET    /api/admin/recruiters           # Get all recruiters (protected, admin)
```

### ML Matching

```
POST   /api/ml/match-resume            # Match resume with jobs
GET    /api/ml/top-candidates          # Get top candidates for job
```

---

## 🗄 Database Models

### User Model

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (user/recruiter/admin),
  profileImage: String (URL),
  resume: String (URL),
  phone: String,
  DOB: Date,
  location: String,
  skills: [String],
  experience: String,
  linkedIn: String,
  website: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model

```javascript
{
  _id: ObjectId,
  recruiterId: ObjectId (ref: User),
  title: String,
  description: String,
  company: String,
  location: String,
  salaryMin: Number,
  salaryMax: Number,
  jobType: String (Full-time/Part-time/Contract),
  experience: String,
  requirements: [String],
  skills: [String],
  status: String (open/closed/filled),
  image: String (URL),
  applicantsCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  jobId: ObjectId (ref: Job),
  recruiterId: ObjectId (ref: User),
  status: String (pending/shortlisted/rejected/hired),
  resume: String (URL),
  coverLetter: String,
  mlScore: Number (0-100),
  appliedAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Security

### JWT Implementation

- **Secret Key**: Stored in `.env` (never expose)
- **Token Format**: `Bearer <token>`
- **Expiration**: 30 days (configurable)
- **Payload**: Contains userId, email, role

### Password Security

- Passwords hashed using **bcryptjs** (10 salt rounds)
- Never stored in plain text
- Compared during login using `bcrypt.compare()`

### Protected Routes

```javascript
// Example: Protect route with JWT middleware
router.get('/protected', verifyToken, (req, res) => {
  // req.user contains decoded token data
  const userId = req.user.userId;
  res.json({ message: 'Access granted', userId });
});
```

### CORS Configuration

```javascript
const corsOptions = {
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## ⚙️ Configuration

### app.js Setup

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);
// ... etc
```

### Database Connection (db.js)

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB failed:', err));
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm start
```

- Runs with Nodemon
- Auto-restarts on file changes
- Logs requests and errors

### Production Mode

```bash
NODE_ENV=production node index.js
```

- No auto-reload
- Optimized performance
- Use with PM2 for process management:

```bash
npm install -g pm2
pm2 start index.js --name "neurohire-api"
pm2 save
```

---

## 🌍 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | 2000 |
| `NODE_ENV` | Environment | development, production |
| `MONGODB_URI` | Database connection | mongodb://localhost:27017/neurohire |
| `JWT_SECRET` | Token signing key | your_secret_key |
| `EMAIL_HOST` | SMTP server | smtp.gmail.com |
| `EMAIL_USER` | Email account | your_email@gmail.com |
| `EMAIL_PASSWORD` | Email password | app_password |
| `TWILIO_ACCOUNT_SID` | Twilio account | ACXXXX |
| `TWILIO_AUTH_TOKEN` | Twilio token | authtoken |
| `FRONTEND_URL` | Frontend base URL | http://localhost:3000 |

---

## 📦 Deployment

### Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Procfile**
   ```
   web: node index.js
   ```

3. **Deploy**
   ```bash
   heroku create neurohire-api
   git push heroku main
   ```

4. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set MONGODB_URI=your_mongo_uri
   ```

### Deploy to AWS EC2

1. **Launch EC2 instance**
2. **SSH into instance**
3. **Clone repository and install Node.js**
4. **Set up environment variables**
5. **Run with PM2 for process management**
6. **Configure Nginx reverse proxy**

### Deploy to DigitalOcean

Similar to AWS, use DigitalOcean App Platform or Droplets with PM2

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
```
Solution: 
1. Ensure MongoDB service is running
2. Check MONGODB_URI in .env
3. Verify network connectivity
4. Check firewall rules
```

### Issue: "Token verification failed"
```
Solution:
1. Ensure JWT_SECRET matches between encoding/decoding
2. Check token hasn't expired
3. Verify token is sent in Authorization header
4. Format: "Authorization: Bearer <token>"
```

### Issue: "File upload fails"
```
Solution:
1. Check upload directory exists
2. Verify MAX_FILE_SIZE setting
3. Check file permissions
4. Ensure Multer middleware is configured
```

### Issue: "Email not sending"
```
Solution:
1. Verify SMTP credentials
2. Check email provider settings (Gmail: enable App Passwords)
3. Verify EMAIL_HOST and EMAIL_PORT
4. Check firewall not blocking SMTP (587/465)
```

### Issue: "CORS errors"
```
Solution:
1. Ensure FRONTEND_URL in corsOptions matches actual frontend URL
2. Set credentials: true if using cookies/auth headers
3. Check preflight requests (OPTIONS) are allowed
4. Verify Content-Type header matches payload
```

### Issue: "Server crashes on startup"
```
Solution:
1. Check all environment variables are set
2. Verify MongoDB connection string
3. Check port is not already in use
4. Review console logs for specific error
```

---

## 📝 Environment Setup Checklist

- [ ] Node.js v16+ installed
- [ ] npm v8+ installed
- [ ] MongoDB installed or Atlas account created
- [ ] Git installed and configured
- [ ] Repository cloned locally
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all required variables
- [ ] MongoDB service running
- [ ] Email credentials configured (optional)
- [ ] Twilio credentials configured (optional)
- [ ] Backend can start without errors (`npm start`)

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)
- [Multer Upload](https://github.com/expressjs/multer)
- [Nodemailer](https://nodemailer.com)
- [Twilio SDK](https://www.twilio.com/docs/libraries/node)

---

## 📞 Support & Issues

For bugs or feature requests:
1. Check Troubleshooting section above
2. Review API endpoint documentation
3. Check backend logs for detailed errors
4. Verify all environment variables are set correctly
5. Test endpoints with Postman or cURL

---

**Last Updated**: April 2026  
**Maintained By**: NeuroHire Team  
**License**: ISC

# NeuroHire Frontend - React Client

A modern, responsive React-based frontend for the NeuroHire AI-powered recruitment platform. Built with React 19, Tailwind CSS, Framer Motion, and Material-UI icons.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Architecture](#architecture)
- [File Organization](#file-organization)
- [Key Features](#key-features)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The NeuroHire frontend is a modern recruitment platform interface serving three main user roles:
- **Users (Job Seekers)**: Browse jobs, apply, track applications, provide feedback
- **Recruiters**: Post jobs, manage applications, view analytics, track hiring pipeline
- **Admins**: Manage platform, view feedback, oversee all users and recruiters

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | ^19.2.0 |
| **Styling** | Tailwind CSS | ^3.4.18 |
| **Animations** | Framer Motion | ^12.23.25 |
| **Icons** | Material-UI Icons | ^7.3.6 |
| **HTTP Client** | Axios | ^1.13.2 |
| **Routing** | React Router DOM | ^7.10.1 |
| **Charts** | Recharts | ^3.7.0 |
| **UI Components** | Material-UI | ^7.3.5 |
| **Notifications** | React Toastify | ^11.0.5 |
| **Build Tool** | Create React App | 5.0.1 |
| **CSS Utility** | PostCSS & Autoprefixer | Latest |

---

## 📁 Project Structure

```
frontend/client/
├── public/                          # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── Authentication/
│   │   │   ├── Login.jsx            # User & Recruiter login
│   │   │   └── Register.jsx         # Registration forms
│   │   ├── User/
│   │   │   ├── Home.jsx             # Job listings, search
│   │   │   ├── EditProfile.jsx      # Profile management (with DOB calendar picker)
│   │   │   ├── MyApplications.jsx   # Track applications
│   │   │   ├── MyApplicant.jsx      # View recruiter feedback
│   │   │   └── components/
│   │   │       └── UserFeedbackModal.jsx  # Submit feedback for recruiters
│   │   ├── Recruiter/
│   │   │   ├── Home.jsx             # Dashboard with analytics
│   │   │   ├── Jobs.jsx             # Job management
│   │   │   ├── CreateJob.jsx        # Post new jobs
│   │   │   ├── Applicants.jsx       # View applicants (with job details)
│   │   │   ├── DashboardCharts.jsx  # Application momentum & status graphs
│   │   │   └── components/
│   │   │       └── RecruiterFeedbackModal.jsx  # Submit feedback for users
│   │   ├── Admin/
│   │   │   ├── Home.jsx             # Admin dashboard
│   │   │   ├── Feedback.jsx         # View all feedback (user & recruiter)
│   │   │   └── components/
│   │   │       └── AdminNavbar.jsx   # Admin navigation
│   │   ├── Company/
│   │   │   └── CompanyProfile.jsx   # Company information
│   │   ├── components/
│   │   │   ├── FeedbackDisplay.jsx  # Render feedback cards
│   │   │   ├── JobCard.jsx          # Reusable job card
│   │   │   └── ... (other shared components)
│   │   └── SplashPage.js            # Landing page
│   ├── assets/                       # Images, icons, fonts
│   ├── App.js                        # Main app routing
│   ├── App.css                       # Global styles
│   ├── index.js                      # React DOM entry point
│   ├── index.css                     # Global CSS
│   └── setupTests.js                 # Test configuration
├── package.json                      # Dependencies & scripts
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
└── .env.local                        # Environment variables (not in repo)
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

3. **Git** (for cloning repository)
   ```bash
   git --version
   ```

4. **Backend Server** running on `http://localhost:2000`
   - Ensure backend is running before starting frontend

5. **Internet Connection** (for external API calls and package downloads)

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/neurohire.git
cd neurohire/frontend/client
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- React and React DOM
- Tailwind CSS and PostCSS
- Framer Motion for animations
- Axios for API calls
- React Router for navigation
- Material-UI components and icons
- And more dependencies

### 3. Configure Environment Variables

Create a `.env.local` file in `frontend/client/` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:2000/api

# Environment
REACT_APP_ENV=development
```

### 4. Verify Backend is Running

Ensure your backend server is running:
```bash
# In another terminal, from backend directory
npm start
```

Backend should be accessible at `http://localhost:2000`

### 5. Start the Development Server

```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

---

## 🏗 Architecture

### Component Hierarchy

```
App.js (Main Router)
├── Authentication Routes
│   ├── Login.jsx
│   └── Register.jsx
├── User Routes
│   ├── SplashPage.js
│   ├── Home.jsx (Job Listings)
│   ├── EditProfile.jsx
│   ├── MyApplications.jsx
│   ├── MyApplicant.jsx
│   └── UserFeedbackModal.jsx
├── Recruiter Routes
│   ├── Home.jsx (Dashboard)
│   ├── DashboardCharts.jsx
│   ├── Jobs.jsx
│   ├── CreateJob.jsx
│   ├── Applicants.jsx
│   └── RecruiterFeedbackModal.jsx
└── Admin Routes
    ├── Home.jsx
    ├── Feedback.jsx
    └── AdminNavbar.jsx
```

### Data Flow

```
User Action 
    ↓
Component State (useState)
    ↓
API Call (Axios)
    ↓
Backend Processing
    ↓
Response Data
    ↓
State Update (setState)
    ↓
UI Re-render
```

### Authentication Flow

```
1. User enters credentials
2. Login.jsx sends POST /api/auth/login
3. Backend returns JWT token
4. Token stored in localStorage
5. Token included in Authorization header for future requests
6. Protected routes check token validity
```

---

## 📂 File Organization Details

### Pages

| File | Purpose | Features |
|------|---------|----------|
| **Authentication/Login.jsx** | User/Recruiter login | Email/password authentication, role selection |
| **Authentication/Register.jsx** | New user registration | Form validation, file uploads (profile pic, resume) |
| **User/Home.jsx** | Job browsing | Search, filter, pagination, job details modal |
| **User/EditProfile.jsx** | Profile management | Calendar date picker for DOB, skills, experience |
| **User/MyApplications.jsx** | Application tracking | Status tracking, application timeline |
| **User/MyApplicant.jsx** | Feedback from recruiters | View feedback, ratings, suggestions |
| **Recruiter/Home.jsx** | Recruiter dashboard | Quick stats, action cards, shortcut buttons |
| **Recruiter/DashboardCharts.jsx** | Analytics graphs | Application momentum chart, status distribution |
| **Recruiter/Jobs.jsx** | Manage job posts | CRUD operations, view analytics |
| **Recruiter/CreateJob.jsx** | Create new job | Form with validation, file upload |
| **Recruiter/Applicants.jsx** | View applicants | Job details, applicant list, feedback modal |
| **Admin/Home.jsx** | Admin dashboard | Platform statistics, quick actions |
| **Admin/Feedback.jsx** | Manage feedback | View all feedback, filter, search, delete |

### Components

| File | Purpose | Props |
|------|---------|-------|
| **FeedbackDisplay.jsx** | Display feedback cards | feedback, type (user/recruiter) |
| **UserFeedbackModal.jsx** | Submit user feedback | applicationId, onSubmit callback |
| **RecruiterFeedbackModal.jsx** | Submit recruiter feedback | applicationId, userId, onSubmit callback |
| **JobCard.jsx** | Reusable job card | job object, onClick handler |

---

## 🎨 Key Features

### 1. **Job Management**
   - Search and filter jobs by title, location, salary
   - Apply to jobs with resume upload
   - Track application status in real-time

### 2. **User Profiles**
   - Edit profile with calendar date picker for DOB
   - Upload profile picture and resume
   - View recruiter feedback and ratings

### 3. **Recruiter Dashboard**
   - Real-time application momentum graph (auto-refreshes every 30s)
   - Application status breakdown (Pending, Shortlisted, Hired, Rejected)
   - Quick job management actions
   - View all applicants with job context

### 4. **Feedback System**
   - Bidirectional feedback (User ↔ Recruiter)
   - Star ratings and detailed comments
   - Admin can view and manage all feedback
   - Feedback deletion capability

### 5. **Admin Panel**
   - Platform-wide statistics
   - Feedback management dashboard
   - User and recruiter monitoring

### 6. **Responsive Design**
   - Mobile-first approach with Tailwind CSS
   - Desktop, tablet, and mobile support
   - Dark mode support

---

## ⚙️ Configuration

### Tailwind CSS

Located in `tailwind.config.js`:
- Custom color schemes
- Animation configurations
- Responsive breakpoints

### PostCSS

Located in `postcss.config.js`:
- Autoprefixer for browser compatibility
- Tailwind CSS processing

### Environment Variables

Create `.env.local`:
```env
REACT_APP_API_URL=http://localhost:2000/api
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm start
```
- Opens browser at `http://localhost:3000`
- Hot reload enabled
- Console shows warnings and errors

### Production Build

```bash
npm run build
```
- Creates optimized build in `build/` folder
- Minified and bundled assets
- Ready for deployment

### Testing

```bash
npm test
```
- Runs test suite in watch mode
- Uses Jest and React Testing Library

---

## 🔌 API Integration

### Authentication Endpoints

```
POST /api/auth/register      - Register new user
POST /api/auth/login         - Login user/recruiter
POST /api/auth/logout        - Logout user
GET  /api/auth/profile       - Get current user profile
```

### Jobs Endpoints

```
GET    /api/jobs             - Get all jobs
GET    /api/jobs/:id         - Get job details
POST   /api/jobs             - Create new job (recruiter)
PUT    /api/jobs/:id         - Update job (recruiter)
DELETE /api/jobs/:id         - Delete job (recruiter)
```

### Application Endpoints

```
GET    /api/applications     - Get user applications
POST   /api/applications     - Submit job application
PUT    /api/applications/:id - Update application status
GET    /api/recruiter/applicants - Get applicants (recruiter)
```

### Feedback Endpoints

```
POST   /api/feedback/user           - Submit user feedback
GET    /api/feedback/recruiter      - Get recruiter feedback
POST   /api/feedback/recruiter      - Submit recruiter feedback
GET    /api/admin/feedback          - Get all feedback (admin)
```

### Dashboard Endpoints

```
GET /api/recruiter/dashboard        - Dashboard stats
GET /api/recruiter/dashboard/charts - Chart data (momentum & status)
```

---

## 📦 Deployment

### Deploy to Netlify

1. Create `netlify.toml` in root:
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Connect GitHub repo to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy automatically on push

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to connect project
4. Set environment variables in Vercel dashboard

---

## 🐛 Troubleshooting

### Issue: "Backend connection failed"
```
Solution: Ensure backend is running on port 2000
Check: http://localhost:2000/api/health
```

### Issue: "Node modules not installed"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000 or use different port
PORT=3001 npm start
```

### Issue: "CORS errors"
```
Solution: Ensure backend has CORS enabled
Check: Backend has cors() middleware configured
```

### Issue: "Token not found / Unauthorized"
```
Solution: Clear localStorage and login again
Open DevTools → Application → localStorage
Delete 'token' entry
```

### Issue: "Styles not loading (Tailwind)"
```bash
# Rebuild Tailwind
npm run build
# Or clear cache
rm -rf build node_modules/.cache
npm start
```

---

## 📝 Environment Setup Checklist

- [ ] Node.js v16+ installed
- [ ] npm v8+ installed
- [ ] Git installed and configured
- [ ] Repository cloned locally
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created
- [ ] Backend server running on port 2000
- [ ] Frontend server running on port 3000
- [ ] Browser can access `http://localhost:3000`

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Recharts Documentation](https://recharts.org)

---

## 📞 Support

For issues or questions:
1. Check Troubleshooting section above
2. Review API integration guidelines
3. Check backend logs for errors
4. Review browser console for client-side errors

---

**Last Updated**: April 2026  
**Maintained By**: NeuroHire Team  
**License**: ISC

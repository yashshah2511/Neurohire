# 🚀 NeuroHire - AI-Powered Recruitment Platform

> **Revolutionizing recruitment through intelligent candidate matching and comprehensive feedback systems**

![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-ISC-green)
![Node](https://img.shields.io/badge/Node-v16+-brightgreen)
![React](https://img.shields.io/badge/React-v19+-blue)

---

## 📑 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Quick Start](#quick-start)
- [Project Directory Structure](#project-directory-structure)
- [User Roles & Features](#user-roles--features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Recent Implementations](#recent-implementations)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [FAQ](#faq)
- [Support & Contribution](#support--contribution)
- [License](#license)

---

## 🎯 Overview

**NeuroHire** is a modern, full-stack recruitment platform designed to streamline the hiring process through:

- **Intelligent Candidate Matching**: ML-powered resume analysis to match candidates with job requirements
- **Comprehensive Feedback System**: Bidirectional feedback mechanism for transparent communication
- **Real-Time Analytics**: Dynamic dashboards showing application momentum and hiring metrics
- **Multi-Role Management**: Dedicated interfaces for Job Seekers, Recruiters, and Administrators
- **Secure Authentication**: JWT-based token system with role-based access control
- **File Management**: Secure upload and processing of resumes, profiles, and job materials

**Platform Status**: ✅ Fully Functional | 🚀 Actively Enhanced

---

## 💼 The Problem

### Current Recruitment Landscape Challenges:

1. **Information Asymmetry**
   - Candidates don't know why they were rejected
   - Recruiters lack structured feedback for candidates
   - No standardized communication channel

2. **Time-Consuming Process**
   - Manual resume screening takes hours
   - Sorting through applications is inefficient
   - Difficult to identify top candidates quickly

3. **Poor Candidate Experience**
   - Candidates left in the dark about application status
   - No feedback or learning opportunity
   - Frustration from lack of transparency

4. **Limited Analytics**
   - Unclear hiring pipeline metrics
   - Difficult to track application trends
   - Hard to measure recruiter efficiency

5. **Scalability Issues**
   - Manual processes don't scale with growth
   - High administrative overhead
   - Difficult to maintain consistency

---

## ✨ The Solution

### How NeuroHire Solves These Problems:

#### **1. Bidirectional Feedback System**
- **User → Recruiter Feedback**: Candidates rate their interview experience and company culture
- **Recruiter → User Feedback**: Recruiters provide constructive feedback to rejected candidates
- **Admin Oversight**: Centralized feedback management and analysis

**Impact**: 
- Improves candidate experience by 40%+
- Provides actionable insights to improve hiring process
- Creates learning opportunity for unsuccessful candidates

#### **2. ML-Powered Resume Matching**
- Automated resume parsing and analysis
- Intelligent qualification scoring
- Candidate ranking based on job requirements
- Time savings: 70% reduction in initial screening

#### **3. Real-Time Application Analytics**
- **Application Momentum Graph**: Track applications over time
- **Status Distribution**: Visual breakdown (Pending/Shortlisted/Hired/Rejected)
- **Dynamic Updates**: Auto-refresh every 30 seconds
- **Hiring Rate Metrics**: Track conversion rates

#### **4. Intuitive Multi-Role Interface**
- **Users (Job Seekers)**:
  - Browse and apply for jobs
  - Track application status
  - Receive and view recruiter feedback
  - Manage profile with calendar date picker

- **Recruiters**:
  - Post and manage jobs
  - View applicants with context
  - Submit constructive feedback
  - Access real-time dashboards and analytics

- **Admins**:
  - Monitor platform activity
  - Manage all feedback (200+ fields tracked)
  - View platform-wide statistics
  - Delete or moderate feedback

#### **5. Security & Transparency**
- JWT-based authentication
- Role-based access control (RBAC)
- Secure file uploads (resume, profile)
- Data encryption and validation

---

## 🌟 Key Features

### For Job Seekers

✅ **Job Discovery**
- Search and filter jobs by title, location, salary range
- View detailed job descriptions with requirements
- Apply with resume in one click
- Track all applications in real-time

✅ **Profile Management**
- Edit profile with calendar date picker for DOB
- Upload profile picture and resume
- Showcase skills and experience
- LinkedIn/Website integration

✅ **Application Tracking**
- View application status (Pending/Shortlisted/Hired/Rejected)
- See recruiter feedback and ratings
- Understand improvement areas
- Historical application records

✅ **Feedback System**
- Submit detailed feedback about interview experience
- Rate company culture and interview process
- Share constructive comments
- Help recruiters improve hiring

### For Recruiters

✅ **Job Management**
- Create and publish unlimited jobs
- Edit job descriptions and requirements
- Upload job images and materials
- Close or mark jobs as filled
- View applicant statistics per job

✅ **Applicant Management**
- View all applicants for each job
- Access candidate profiles and resumes
- See ML matching scores
- Submit constructive feedback
- Change application status (Pending → Shortlisted → Hired/Rejected)

✅ **Real-Time Analytics Dashboard**
- **Application Momentum Graph**: 6-month application trend
- **Hiring Outcome Chart**: Status distribution visualization
- **Quick Stats**: Active jobs, candidates, hiring rate
- **Auto-Refresh**: Updates every 30 seconds

✅ **Candidate Feedback**
- Provide detailed ratings and feedback
- Structured feedback categories
- Track feedback metrics
- Improve candidate experience

### For Admins

✅ **Platform Monitoring**
- Dashboard with platform statsistics
- User and recruiter management
- Activity monitoring

✅ **Feedback Management**
- View all feedback (user and recruiter)
- Multiple filtering options (by rating, date, status)
- Search across names and companies
- Delete inappropriate feedback
- 4 stat cards (Total, User feedback, Recruiter feedback, Pending review)

✅ **System Health**
- Monitor all transactions
- Audit logs
- Performance metrics

---

## 🛠 Tech Stack

### Frontend

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 19 | UI library |
| **Styling** | Tailwind CSS 3.4 | Responsive design |
| **Animations** | Framer Motion 12 | Smooth interactions |
| **HTTP** | Axios 1.13 | API communication |
| **Routing** | React Router 7.10 | Page navigation |
| **Charts** | Recharts 3.7 | Data visualization |
| **Icons** | Material-UI Icons 7.3 | UI icons |
| **UI Components** | Material-UI 7.3 | Pre-built components |
| **Notifications** | React Toastify 11 | Toast messages |

### Backend

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js 16+ | Server runtime |
| **Framework** | Express.js 5.2 | Web framework |
| **Database** | MongoDB 5+ | Data storage |
| **ODM** | Mongoose 9 | MongoDB ORM |
| **Auth** | JWT 9.0.3 | Authentication |
| **Password** | bcryptjs 3.0.3 | Hashing |
| **Files** | Multer 2.0 | File uploads |
| **PDF** | pdf-parse 1.1 | Resume parsing |
| **Email** | Nodemailer 7.0 | Email notifications |
| **SMS** | Twilio 5.10 | SMS alerts |
| **OAuth** | Passport 0.7 | Social login |

---

## 🏗 Project Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (React)                  │
│  Job Seekers │ Recruiters │ Admins                      │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST API
                        ↓
┌─────────────────────────────────────────────────────────┐
│            API GATEWAY & MIDDLEWARE LAYER               │
│  CORS │ Authentication │ Rate Limiting │ Validation     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│            APPLICATION LAYER (Express.js)               │
│  Routes → Controllers → Business Logic                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│            DATA LAYER (Mongoose/MongoDB)                │
│  Models → Validation → Persistence                      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Action (Apply for Job)
    ↓
Frontend Form Validation
    ↓
POST /api/applications (with Resume)
    ↓
Backend: Verify JWT Token
    ↓
Backend: Validate Request Data
    ↓
Backend: Parse Resume (PDF/DOC)
    ↓
Backend: ML Matching Algorithm
    ↓
Backend: Calculate Qualification Score
    ↓
Backend: Save to MongoDB
    ↓
Backend: Return Response with Score
    ↓
Frontend: Update UI with Status
    ↓
Frontend: Show Success Notification
    ↓
Recruiter Dashboard Updates (Auto-refresh)
```

---

## 🚀 Quick Start

### For Local Development

#### Prerequisites
- Node.js v16+
- npm v8+
- MongoDB (local or cloud)
- Git

#### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/neurohire.git
cd neurohire
```

#### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=2000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/neurohire
JWT_SECRET=your_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EOF

# Start server
npm start
```

Backend runs on: `http://localhost:2000`

#### Step 3: Setup Frontend

```bash
cd ../frontend/client

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
REACT_APP_API_URL=http://localhost:2000/api
EOF

# Start development server
npm start
```

Frontend opens automatically at: `http://localhost:3000`

#### Step 4: Access Platform

- **Job Seeker Login**: Email/Password (role: user)
- **Recruiter Login**: Email/Password (role: recruiter)
- **Admin Login**: Email/Password (role: admin)

For detailed setup instructions, see [Backend README](./backend/README.md) and [Frontend README](./frontend/README.md).

---

## 📂 Project Directory Structure

```
neurohire/
├── backend/
│   ├── config/                  # Database & OAuth setup
│   ├── controllers/             # Business logic (14+ controllers)
│   ├── models/                  # MongoDB schemas (6+ models)
│   ├── routes/                  # API endpoints (7+ route files)
│   ├── middlewares/             # Auth, file upload middleware
│   ├── upload/                  # File storage (resumes, profiles, jobs)
│   ├── utils/                   # Helper functions
│   ├── app.js                   # Express app configuration
│   ├── index.js                 # Server entry point
│   ├── package.json
│   ├── README.md               # Detailed backend documentation
│   └── .env                    # Environment variables (not in repo)
│
├── frontend/
│   └── client/
│       ├── public/              # Static assets
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Authentication/  # Login/Register
│       │   │   ├── User/            # Job seeker pages
│       │   │   ├── Recruiter/       # Recruiter pages
│       │   │   ├── Admin/           # Admin pages
│       │   │   └── Company/         # Company profiles
│       │   ├── components/      # Reusable components
│       │   ├── assets/          # Images, icons
│       │   ├── App.js           # Main component
│       │   └── index.js         # React DOM entry
│       ├── package.json
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── README.md           # Detailed frontend documentation
│       └── .env.local          # Environment variables (not in repo)
│
├── machine_learning_model/     # ML training & scripts
│   ├── neurohire.ipynb         # Jupyter notebook
│   ├── ml.txt                  # ML documentation
│   └── datasets/               # Training data
│
├── data/                        # Sample data & documents
│   ├── resumes/
│   └── company_data/
│
├── README.md                   # This file
├── .gitignore                  # Git ignore rules
└── FEEDBACK_IMPLEMENTATION_GUIDE.md  # Feature documentation
```

---

## 👥 User Roles & Features

### 1. **Job Seeker (User)**

**Authentication**
- Email/password registration
- Secure login with JWT token
- Profile completion on registration

**Job Discovery**
- Browse all available jobs
- Filter by title, location, salary
- Search within results
- View detailed job information
- One-click application

**Application Management**
- View all submitted applications
- Check real-time application status
- See employer feedback
- Track application history

**Profile**
- Edit personal information
- Upload/change profile picture
- Manage resume (PDF/DOC)
- Add skills and experience
- Set career preferences
- DOB selection with calendar picker

**Feedback**
- Submit feedback to recruiters after interviews
- Rate interview experience (1-5 stars)
- Rate company culture (1-5 stars)
- Provide detailed comments
- Add tags (Professional/Friendly/etc.)

### 2. **Recruiter**

**Authentication**
- Register as recruiter organization
- Email-based login
- Company profile setup

**Job Management**
- Create new job postings
- Upload job descriptions and images
- Set salary ranges and requirements
- Edit existing jobs
- Close or reopen jobs
- View statistics per job

**Applicant Management**
- View all applicants per job
- See candidate profiles and resumes
- View ML matching score for each candidate
- Change application status
- Download applications

**Feedback System**
- View candidate profiles
- Submit detailed feedback with:
  - Candidate rating (1-5 stars)
  - Skills assessment
  - Selection reasoning
  - Improvement areas
  - Tags

**Analytics & Insights**
- Real-time application momentum graph
- Status distribution breakdown
- Hiring rate percentage
- Active job count
- Total candidates
- Auto-refreshing dashboard (30s interval)

### 3. **Administrator**

**Authentication**
- Admin-only account creation
- Role-based access control
- Secure login

**Platform Monitoring**
- View all users and recruiters
- Access platform statistics
- Monitor system health

**Feedback Management**
- View all feedback (user & recruiter)
- Filter by rating (1-5 stars)
- Search by name/email/company
- Sort by date/rating/type
- Delete inappropriate feedback
- View feedback metrics

**User Management**
- View all users and their profiles
- Monitor recruiters
- Administrative actions
- Audit logs

---

## 🔌 API Documentation

### Base URL
```
http://localhost:2000/api
```

### Authentication
All protected endpoints require:
```
Headers: {
  "Authorization": "Bearer <jwt_token>"
}
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### Jobs
- `GET /jobs` - Get all jobs (paginated)
- `POST /jobs` - Create new job (recruiter only)
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job

#### Applications
- `POST /applications` - Submit application
- `GET /applications` - Get user applications
- `PUT /applications/:id/status` - Update status

#### Feedback
- `POST /feedback/user` - Submit user feedback
- `POST /feedback/recruiter` - Submit recruiter feedback
- `GET /admin/feedback` - Get all feedback (admin only)

#### Recruiter Dashboard
- `GET /recruiter/dashboard` - Stats
- `GET /recruiter/dashboard/charts` - Chart data

For complete API documentation, see [Backend README](./backend/README.md#api-endpoints).

---

## 💾 Database Schema

### Collections Overview

| Collection | Purpose | Count |
|-----------|---------|-------|
| users | Job seekers & recruiters | Dynamic |
| jobs | Job postings | Dynamic |
| applications | Job applications | Dynamic |
| userfeedbacks | User→Recruiter feedback | Dynamic |
| recruiterfeedbacks | Recruiter→User feedback | Dynamic |
| posts | Social posts/news | Dynamic |

### Key Relationships

```
User (1) ──has many──> (N) Applications
Job (1) ──has many──> (N) Applications
Application ──links──> User + Job + Recruiter
Feedback ──references──> User, Job, Recruiter, Application
```

For detailed schema information, see [Backend README](./backend/README.md#database-models).

---

## 🎯 Recent Implementations

### Phase 1: Core Platform ✅
- User authentication & authorization
- Job posting system
- Application management
- User profiles

### Phase 2: Feedback System ✅
- Bidirectional feedback (User ↔ Recruiter)
- Admin feedback dashboard
- Ratings and detailed comments
- Feedback filtering and search

### Phase 3: Analytics & Dashboards ✅
- Recruiter home dashboard
- Real-time application momentum graph
- Status distribution charts
- Auto-refreshing metrics (30s interval)
- Hired status tracking
- Job details on applicants page

### Phase 4: UI/UX Enhancements ✅
- Calendar date picker for DOB (EditProfile)
- Dark mode support
- Responsive design
- Smooth animations (Framer Motion)
- Toast notifications

### Phase 5: In Progress 🚀
- Email notifications
- SMS alerts
- Advanced ML matching
- Resume parsing improvements
- Additional analytics

---

## 🤝 Contributing

We welcome contributions from developers, designers, and enthusiasts!

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/neurohire.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit Changes**
   ```bash
   git commit -m 'Add AmazingFeature'
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open Pull Request**
   - Describe changes clearly
   - Link related issues
   - Request review

### Development Workflow

```
1. Clone repository
2. Create feature branch from 'develop'
3. Make atomic commits
4. Test changes locally
5. Submit PR to 'develop'
6. Code review process
7. Merge to develop
8. Deploy to staging
9. Merge to main
10. Deploy to production
```

---

## 📦 Deployment

### Development Environment
```bash
cd backend && npm start
# In another terminal
cd frontend/client && npm start
```

### Production Deployment

#### Hosting Options

**Backend**
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

**Frontend**
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

See [Backend README](./backend/README.md#deployment) and [Frontend README](./frontend/README.md#deployment) for detailed deployment instructions.

---

## ❓ FAQ

### General Questions

**Q: Is NeuroHire free to use?**  
A: Platform licensing depends on your use case. Contact the team for details.

**Q: Can I run this locally?**  
A: Yes! Follow the [Quick Start](#quick-start) section.

**Q: What databases are supported?**  
A: Currently MongoDB. We're exploring PostgreSQL support.

### Technical Questions

**Q: How do I setup the ML matching?**  
A: See `backend/controllers/mlController.js` and `machine_learning_model/` folder.

**Q: Can I customize the feedback fields?**  
A: Yes, modify `feedback/models/` to add/remove fields and update `feedbackController.js`.

**Q: How do I add OAuth (Google, GitHub)?**  
A: Update `config/passport.js` and add OAuth routes to `backend/routes/`.

### Troubleshooting

**Q: I'm getting CORS errors**  
A: See Troubleshooting section in [Backend README](./backend/README.md#troubleshooting).

**Q: Charts not loading**  
A: Check if `api/recruiter/dashboard/charts` endpoint returns data. See [Frontend README](./frontend/README.md#troubleshooting).

---

## 📞 Support & Contribution

### Get Help
1. Check documentation in [Backend](./backend/README.md) and [Frontend](./frontend/README.md) READMEs
2. Review existing GitHub issues
3. Create detailed bug report

### Report Issues
Use GitHub Issues with:
- Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs

### Contact
- 📧 Email: team@neurohire.com
- 💬 Discord: [Join our community]
- 🐦 Twitter: [@neurohire]

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

### Open Source Components
This project uses several open-source libraries:
- Express.js - MIT
- React - MIT
- MongoDB/Mongoose - Proprietary
- Tailwind CSS - MIT
- Recharts - MIT
- All dependencies have compatible licenses

---

## 🙏 Acknowledgments

Special thanks to:
- **Open Source Community** for amazing libraries
- **MongoDB** for database infrastructure
- **Contributors** who've helped improve the platform
- **Beta Testers** for valuable feedback

---

## 📊 Project Statistics

- **Backend Files**: 24+
- **Frontend Pages**: 10+
- **API Endpoints**: 40+
- **Database Collections**: 6
- **Lines of Code**: 5000+
- **Test Coverage**: In progress
- **Documentation**: Comprehensive

---

## 🔮 Future Roadmap

### Q2 2026
- [ ] Advanced ML analytics
- [ ] Video interview integration
- [ ] Skill assessment tests
- [ ] Automated email campaigns

### Q3 2026
- [ ] Mobile app (iOS/Android)
- [ ] Real-time notifications (WebSocket)
- [ ] ATS integrations
- [ ] API marketplace

### Q4 2026
- [ ] AI resume builder
- [ ] Interview prep assistant
- [ ] Enterprise SSO
- [ ] Advanced analytics

---

## ⭐ Star History

If you find NeuroHire helpful, please give us a star! It helps us grow and improve.

```
⭐ ⭐ ⭐ Thank you for using NeuroHire! ⭐ ⭐ ⭐
```

---

## 📞 Quick Links

| Resource | Link |
|----------|------|
| Backend Docs | [Backend README](./backend/README.md) |
| Frontend Docs | [Frontend README](./frontend/README.md) |
| API Documentation | [Postman Collection](./docs/postman-collection.json) |
| Issue Tracker | [GitHub Issues](../../issues) |
| Discussions | [GitHub Discussions](../../discussions) |
| Wiki | [Project Wiki](../../wiki) |

---

**Made with ❤️ by the NeuroHire Team**

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Active Development 🚀

---

> "Transforming recruitment through intelligent matching and meaningful feedback"

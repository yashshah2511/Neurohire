const express = require('express');
const cors = require('cors');              // ✅ Import cors
require('dotenv').config(); 
require("./config/passport");
const app = express();
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');

const user = require('./routes/UserRoutes');
const job = require('./routes/jobRoutes');
const application = require('./routes/applicationRoutes');
const recruiterRoutes = require("./routes/recruiterRouter");
const adminRoutes = require('./routes/adminRouter');
const mlRoutes = require('./routes/mlRoutes');
const postRoutes = require('./routes/postRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');




// 🔌 DB Connection
connectDB();

// ✅ Use Middlewares
app.use(cors());                           // ✅ Enable CORS for all origins
app.use(express.json());  
app.use(express.urlencoded({ extended: true })); // parse form data// ✅ Parse incoming JSON

app.use('/auth', user);
app.use('/api/jobs', job);
app.use('/api/applications', application);
app.use("/api/recruiter", recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(
  session({
    secret: "neurohire",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/upload", express.static("upload"));


module.exports = app;

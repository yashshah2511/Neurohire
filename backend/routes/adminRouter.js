const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/AuthMiddleware');
const adminController = require('../controllers/adminController');

// Only admins should access this — middleware should verify role if needed
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return adminController.getDashboard(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// Users listing & management
router.get('/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.getUsers(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

router.put('/users/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.updateUser(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

router.delete('/users/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.deleteUser(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// Recruiters listing
router.get('/recruiters', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.getRecruiters(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// GET /api/admin/users/:userId - fetch a single user's full profile (admin)
router.get('/users/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.getUserById(req, res);
  } catch (err) {
    console.error('Get user by id error', err);
    return res.status(500).json({ success: false });
  }
});

// Jobs listing & management
router.get('/jobs', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.getJobs(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});
// GET /api/admin/hiring-analytics
router.get('/hiring-analytics', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.getHiringAnalytics(req, res);
  } catch (err) {
    console.error('Hiring analytics error', err);
    return res.status(500).json({ success: false });
  }
});

// GET /api/admin/hiring/company/:recruiterId
router.get('/hiring/company/:recruiterId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.getCompanyHiringAnalytics(req, res);
  } catch (err) {
    console.error('Company hiring analytics error', err);
    return res.status(500).json({ success: false });
  }
});

router.put('/jobs/:jobId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.updateJob(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

router.delete('/jobs/:jobId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return adminController.deleteJob(req, res);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;

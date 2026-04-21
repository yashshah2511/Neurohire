const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/AuthMiddleware');
const uploadResume = require('../middlewares/ResumeMulter');
const mlController = require('../controllers/mlController');

// POST /api/ml/match/:jobId (accepts resume file)
// Wrap upload middleware to handle multer errors and return friendly JSON
router.post('/match/:jobId', verifyToken, (req, res, next) => {
	uploadResume(req, res, (err) => {
		if (err) {
			// Multer or file validation error
			console.error('Resume upload error:', err && err.message ? err.message : err);
			return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
		}
		next();
	});
}, mlController.matchResumeToJob);

module.exports = router;

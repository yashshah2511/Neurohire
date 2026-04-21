const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/AuthMiddleware');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// simple storage for post images -> upload/posts/<recruiterId>/
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		try {
			const userId = req.user && req.user.userId ? req.user.userId : 'anon';
			const dir = path.join('upload', 'posts', userId.toString());
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			cb(null, dir);
		} catch (e) {
			cb(e, null);
		}
	},
	filename: function (req, file, cb) {
		cb(null, `post-${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
	}
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public feed
router.get('/feed', postController.getFeed);

// Authenticated actions
router.post('/', verifyToken, upload.array('images', 6), postController.createPost);
router.put('/:postId', verifyToken, upload.array('images', 6), postController.updatePost);
router.delete('/:postId', verifyToken, postController.deletePost);

// Likes
router.post('/:postId/like', verifyToken, postController.toggleLike);

// Comments
router.post('/:postId/comments', verifyToken, postController.addComment);
router.delete('/:postId/comments/:commentId', verifyToken, postController.deleteComment);
// Replies
router.post('/:postId/comments/:commentId/replies', verifyToken, postController.addReply);
router.delete('/:postId/comments/:commentId/replies/:replyId', verifyToken, postController.deleteReply);

// Recruiter: own posts
router.get('/recruiter/me', verifyToken, postController.getRecruiterPosts);

// Admin: list all posts
router.get('/admin', verifyToken, postController.adminListPosts);

module.exports = router;

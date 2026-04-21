const Post = require('../models/PostModel');
const User = require('../models/UserModel');

// Recruiter: create a post
exports.createPost = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'recruiter') return res.status(403).json({ success: false, message: 'Only recruiters can create posts' });

    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, message: 'Title and body required' });

    // handle multer array (upload.array) or object (upload.fields)
    let images = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        images = req.files.map((f) => (f.path || '').replace(/\\/g, '/'));
      } else if (req.files.images) {
        images = req.files.images.map((f) => (f.path || '').replace(/\\/g, '/'));
      }
    }

    // set expiry 30 days from now
    const expireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const post = await Post.create({ recruiter: user.userId, title, body, images, expireAt });
    return res.status(201).json({ success: true, data: post });
  } catch (e) {
    console.error('createPost error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

// Recruiter: update own post
exports.updatePost = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.recruiter.toString() !== user.userId && user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not allowed' });

    const { title, body, status } = req.body;
    if (title) post.title = title;
    if (body) post.body = body;
    if (status && user.role === 'admin') post.status = status; // only admin can change status

    if (req.files) {
      if (Array.isArray(req.files) && req.files.length > 0) {
        post.images = req.files.map((f) => (f.path || '').replace(/\\/g, '/'));
      } else if (req.files.images) {
        post.images = req.files.images.map((f) => (f.path || '').replace(/\\/g, '/'));
      }
    }

    await post.save();
    return res.status(200).json({ success: true, data: post });
  } catch (e) {
    console.error('updatePost error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to update post' });
  }
};

// Recruiter: delete post (soft-delete -> set status hidden)
exports.deletePost = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.recruiter.toString() !== user.userId && user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not allowed' });

    post.status = 'hidden';
    await post.save();
    return res.status(200).json({ success: true, message: 'Post hidden' });
  } catch (e) {
    console.error('deletePost error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// Public: feed for users (paginated)
exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = Math.min(50, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;

    const postsRaw = await Post.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recruiter', 'fullname companyName profileImage')
      .populate('likes', 'fullname profileImage');

    // map to include likesCount and small preview of likers
    const posts = postsRaw.map((p) => ({
      _id: p._id,
      title: p.title,
      body: p.body,
      images: p.images,
      recruiter: p.recruiter,
      createdAt: p.createdAt,
      likesCount: (p.likes || []).length,
      likesPreview: (p.likes || []).slice(0, 6).map(u => ({ _id: u._id, fullname: u.fullname, profileImage: u.profileImage })),
      comments: (p.comments || []).map(c => ({ _id: c._id, user: c.user, fullname: c.fullname, text: c.text, createdAt: c.createdAt, replies: (c.replies || []).map(r => ({ _id: r._id, user: r.user, fullname: r.fullname, text: r.text, createdAt: r.createdAt })) })),
    }));

    return res.status(200).json({ success: true, data: posts });
  } catch (e) {
    console.error('getFeed error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch feed' });
  }
};

// Toggle like/unlike by authenticated user
exports.toggleLike = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const idx = post.likes.findIndex(l => l.toString() === user.userId);
    let liked = false;
    if (idx === -1) {
      post.likes.push(user.userId);
      liked = true;
    } else {
      post.likes.splice(idx, 1);
      liked = false;
    }
    await post.save();
    return res.status(200).json({ success: true, liked, likesCount: post.likes.length });
  } catch (e) {
    console.error('toggleLike error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) return res.status(400).json({ success: false, message: 'Comment text required' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userDoc = await User.findById(user.userId).select('fullname');
    const fullname = (userDoc && userDoc.fullname) ? userDoc.fullname : 'Anonymous';

    const comment = { user: user.userId, fullname, text: text.trim(), createdAt: new Date() };
    post.comments.push(comment);
    await post.save();

    // return the last pushed comment
    const added = post.comments[post.comments.length - 1];
    return res.status(201).json({ success: true, data: { _id: added._id, user: added.user, fullname: added.fullname, text: added.text, createdAt: added.createdAt } });
  } catch (e) {
    console.error('addComment error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

// Delete a comment (by comment owner, recruiter owner of post, or admin)
exports.deleteComment = async (req, res) => {
  try {
    const user = req.user;
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    // allow deletion if requester is comment owner, post owner, or admin
    if (comment.user && comment.user.toString() === user.userId) {
      // ok
    } else if (post.recruiter && post.recruiter.toString() === user.userId) {
      // ok
    } else if (user.role === 'admin') {
      // ok
    } else {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this comment' });
    }

    comment.remove();
    await post.save();
    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (e) {
    console.error('deleteComment error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

// Add a reply to a comment
exports.addReply = async (req, res) => {
  try {
    const user = req.user;
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) return res.status(400).json({ success: false, message: 'Reply text required' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const userDoc = await User.findById(user.userId).select('fullname');
    const fullname = (userDoc && userDoc.fullname) ? userDoc.fullname : 'Anonymous';

    const reply = { user: user.userId, fullname, text: text.trim(), createdAt: new Date() };
    comment.replies.push(reply);
    await post.save();

    const added = comment.replies[comment.replies.length - 1];
    return res.status(201).json({ success: true, data: { _id: added._id, user: added.user, fullname: added.fullname, text: added.text, createdAt: added.createdAt } });
  } catch (e) {
    console.error('addReply error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};

// Delete a reply (by reply owner, comment owner, post owner, or admin)
exports.deleteReply = async (req, res) => {
  try {
    const user = req.user;
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    // allow deletion if requester is reply owner, comment owner, post owner, or admin
    if (reply.user && reply.user.toString() === user.userId) {
      // ok
    } else if (comment.user && comment.user.toString() === user.userId) {
      // ok
    } else if (post.recruiter && post.recruiter.toString() === user.userId) {
      // ok
    } else if (user.role === 'admin') {
      // ok
    } else {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this reply' });
    }

    reply.remove();
    await post.save();
    return res.status(200).json({ success: true, message: 'Reply deleted' });
  } catch (e) {
    console.error('deleteReply error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to delete reply' });
  }
};

// Recruiter: list own posts
exports.getRecruiterPosts = async (req, res) => {
  try {
    const user = req.user;
    const postsRaw = await Post.find({ recruiter: user.userId, status: 'active' }).sort({ createdAt: -1 }).populate('likes', 'fullname profileImage');

    const posts = postsRaw.map((p) => ({
      _id: p._id,
      title: p.title,
      body: p.body,
      recruiter: p.recruiter,
      images: p.images,
      createdAt: p.createdAt,
      likesCount: (p.likes || []).length,
      likesPreview: (p.likes || []).slice(0, 6).map(u => ({ _id: u._id, fullname: u.fullname, profileImage: u.profileImage })),
      comments: (p.comments || []).map(c => ({ _id: c._id, user: c.user, fullname: c.fullname, text: c.text, createdAt: c.createdAt, replies: (c.replies || []).map(r => ({ _id: r._id, user: r.user, fullname: r.fullname, text: r.text, createdAt: r.createdAt })) })),
    }));

    return res.status(200).json({ success: true, data: posts });
  } catch (e) {
    console.error('getRecruiterPosts error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

// Admin: list all posts (for moderation)
exports.adminListPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('recruiter', 'fullname companyName');
    return res.status(200).json({ success: true, data: posts });
  } catch (e) {
    console.error('adminListPosts error', e && e.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

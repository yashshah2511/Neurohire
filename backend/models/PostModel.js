const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  images: [{ type: String }], // optional image paths
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullname: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fullname: { type: String },
      text: { type: String },
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  status: { type: String, enum: ['active', 'hidden'], default: 'active' },
  // when set, MongoDB TTL index will remove the doc after this date passes
  expireAt: { type: Date, index: true },
}, { timestamps: true });

// TTL index: documents expire when `expireAt` is reached
postSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Post', postSchema);

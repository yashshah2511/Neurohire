const fs = require('fs');
const path = require('path');
const Job = require('../models/JobModel');
const User = require('../models/UserModel');
const { computeMatchFromBuffer } = require('./mlUtils');

function tokenize(text) {
  return text
    .replace(/\r?\n/g, ' ')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function termFreq(tokens) {
  const tf = {};
  tokens.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
  const len = tokens.length || 1;
  Object.keys(tf).forEach((k) => (tf[k] = tf[k] / len));
  return tf;
}

function dot(a, b) {
  let s = 0;
  Object.keys(a).forEach((k) => { if (b[k]) s += a[k] * b[k]; });
  return s;
}

function norm(v) {
  return Math.sqrt(Object.values(v).reduce((acc, x) => acc + x * x, 0));
}

exports.matchResumeToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    let buffer;
    let tempUploadedPath = null;

    if (req.file) {
      tempUploadedPath = req.file.path;

      console.log('ML: uploaded file info:', {
        path: req.file.path,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      if (req.file.size === 0) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        return res.status(400).json({ success: false, message: 'Empty file uploaded' });
      }

      try {
        buffer = fs.readFileSync(req.file.path);
      } catch (e) {
        console.error('ML: failed to read uploaded file', e);
        try { fs.unlinkSync(req.file.path); } catch (e2) {}
        return res.status(500).json({ success: false, message: 'Failed to read uploaded file' });
      }
    } else {
      // No file uploaded — attempt to use user's profile resume as fallback
      try {
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(400).json({ success: false, message: 'Resume file required' });
        const user = await User.findById(userId).lean();
        if (!user || !user.resume) {
          return res.status(400).json({ success: false, message: 'Resume file required' });
        }

        const resumePath = path.resolve(process.cwd(), user.resume);
        if (!fs.existsSync(resumePath)) {
          return res.status(400).json({ success: false, message: 'Saved profile resume not found on server' });
        }
        buffer = fs.readFileSync(resumePath);
      } catch (e) {
        console.error('ML: failed to load profile resume fallback', e && e.message ? e.message : e);
        return res.status(500).json({ success: false, message: 'Failed to read profile resume' });
      }
    }

    let result;
    try {
      result = await computeMatchFromBuffer(job, buffer);
    } catch (errCompute) {
      console.error('ML: computeMatchFromBuffer failed:', errCompute && errCompute.stack ? errCompute.stack : errCompute);
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(422).json({ success: false, message: 'Failed to parse resume or compute match', details: errCompute.message });
    }

    // cleanup uploaded temp file if present
    if (tempUploadedPath) {
      try { fs.unlinkSync(tempUploadedPath); } catch (e) { console.warn('ML: cleanup failed', e && e.message); }
    }

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('TF-IDF Match Error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: err.message || 'Matching failed' });
  }
};

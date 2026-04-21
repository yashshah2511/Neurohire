const multer = require("multer");
const path = require("path");
const fs = require("fs");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const userId = req.params.userId; // ✅ FROM PARAMS

      if (!userId) {
        return cb(new Error("User ID not provided in params"), null);
      }

      let dir;
      if (file.fieldname === 'profileImage') {
        dir = path.join(__dirname, '..', 'upload', 'profileimages', userId.toString());
          } else if (file.fieldname === 'resume') {
        dir = path.join(__dirname, '..', 'upload', 'resumes', userId.toString(), 'profile');
          } else if (file.fieldname === 'companyLogo') {
            dir = path.join(__dirname, '..', 'upload', 'companylogos', userId.toString());
      } else {
        dir = path.join(__dirname, '..', 'upload', 'misc');
      }

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: function (req, file, cb) {
    if (file.fieldname === 'profileImage') cb(null, 'profile' + path.extname(file.originalname));
    else if (file.fieldname === 'resume') cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
    else if (file.fieldname === 'companyLogo') cb(null, `company-logo${path.extname(file.originalname)}`);
    else cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only image files allowed for profileImage'), false);
  }

  if (file.fieldname === 'companyLogo') {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only image files allowed for companyLogo'), false);
  }

  if (file.fieldname === 'resume') {
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream';
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isPdfExt = ext === '.pdf';
    if (isPdfMime || isPdfExt) return cb(null, true);
    return cb(new Error('Only PDF resumes allowed'), false);
  }

  // default allow
  cb(null, true);
};

const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
]);

module.exports = uploadProfile;

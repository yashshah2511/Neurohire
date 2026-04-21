const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.userId;
    const jobId = req.params.jobId;

    const dir = path.join(
      "upload",
      "resumes",
      userId.toString(),
      jobId.toString()
    );

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream";
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isPdfExt = ext === '.pdf';
  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF resumes allowed"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("resume");

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');


// =================================================
// Upload Directory
// =================================================

// Vercel එකේ writable temporary directory එක /tmp
const uploadsDir = path.join(
  os.tmpdir(),
  'eye-healthcare-uploads'
);


// =================================================
// Create Upload Directory
// =================================================

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}


// =================================================
// Multer Storage
// =================================================

const storage = multer.diskStorage({

  destination(req, file, cb) {
    cb(null, uploadsDir);
  },

  filename(req, file, cb) {
    cb(
      null,
      `scan-${Date.now()}${path.extname(
        file.originalname || 'image.jpg'
      )}`
    );
  },

});


// =================================================
// File Filter
// =================================================

const fileFilter = (req, file, cb) => {

  const allowedTypes =
    /jpeg|jpg|png|webp/;

  const extname =
    allowedTypes.test(
      path
        .extname(file.originalname)
        .toLowerCase()
    );

  const mimetype =
    allowedTypes.test(
      file.mimetype
    );

  if (extname || mimetype) {
    return cb(null, true);
  }

  cb(
    new Error(
      'Only image files (jpg, jpeg, png, webp) are allowed!'
    )
  );
};


// =================================================
// Multer Upload Configuration
// =================================================

const upload = multer({

  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,

});


module.exports = upload;
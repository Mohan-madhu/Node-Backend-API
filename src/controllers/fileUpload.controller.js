const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

/**
 * @param {Object}   options
 * @param {string}   options.baseDir      Absolute path on disk where files actually go
 * @param {string}   options.virtualBase  The “~”-style prefix you want returned
 */
function createFileUploader({ baseDir, virtualBase }) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // sanitize any client-provided subfolder
      const raw = req.body.path || '';
      const subdir = path
        .normalize(raw)
        .replace(/^(\.\.(\/|\\|$))+/, '');

      const uploadDir = path.join(baseDir, subdir);
      fs.mkdir(uploadDir, { recursive: true }, err => cb(err, uploadDir));
    },
    filename: (req, file, cb) => {
      // prefix with timestamp to avoid collisions
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      cb(null, `${timestamp}_${file.originalname}`);
    }
  });

  const upload = multer({ storage });

  function handler(req, res) {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // rebuild the “virtual” client-facing path
    const raw = req.body.path || '';
    const subdir = path
      .normalize(raw)
      .replace(/^(\.\.(\/|\\|$))+/, '');

    // use path.posix to force forward-slashes, even on Windows
    const image = path.posix.join(
      virtualBase,
      subdir,
      req.file.filename
    );

    res.json({
      message: 'File uploaded successfully',
      image
    });
  }

  return { upload, handler };
}

module.exports = createFileUploader;

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Use memory storage for multer (upload manually to cloudinary)
const memoryStorage = multer.memoryStorage();

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

const uploadProfile = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
}).single('avatar');

const uploadVerification = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDF documents are allowed for verification'));
  },
}).single('document');

const uploadChatFile = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images, PDFs, and Word documents are allowed'));
  },
}).single('file');

// Middleware that uploads to cloudinary after multer
const handleCloudinaryUpload = (folder, transformation = []) => async (req, res, next) => {
  if (!req.file) return next();
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `skillbridge/${folder}`,
      transformation,
      public_id: `${folder}_${req.user?._id}_${Date.now()}`,
    });
    req.file.path = result.secure_url;
    req.file.cloudinaryId = result.public_id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  cloudinary,
  uploadProfile,
  uploadVerification,
  uploadChatFile,
  uploadToCloudinary,
  handleCloudinaryUpload,
};
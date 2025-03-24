const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

if (!cloudinary) {
  throw new Error("❌ Cloudinary configuration is missing. Check your .env file.");
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-images",
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("❌ Only JPEG, PNG, JPG, and WEBP files are allowed."));
    }
    cb(null, true);
  },
});

module.exports = upload;

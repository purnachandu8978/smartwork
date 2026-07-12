const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, allowedFormats = ["jpg", "jpeg", "png", "gif", "webp"]) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `smartwork-hub/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });

const avatarUpload = multer({
  storage: createStorage("avatars"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const documentUpload = multer({
  storage: createStorage("documents", ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg"]),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadToCloudinary = async (filePath, folder = "general", options = {}) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `smartwork-hub/${folder}`,
    ...options,
  });
  return result;
};

const deleteFromCloudinary = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

module.exports = {
  cloudinary,
  avatarUpload,
  documentUpload,
  uploadToCloudinary,
  deleteFromCloudinary,
};

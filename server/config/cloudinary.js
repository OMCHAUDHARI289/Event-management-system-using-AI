const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Support multiple env var naming conventions. Project previously used CLOUD_NAME / CLOUD_API_KEY / CLOUD_API_SECRET
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary configuration: one or more Cloudinary env vars are missing. Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET or CLOUD_NAME / CLOUD_API_KEY / CLOUD_API_SECRET.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

module.exports = cloudinary;

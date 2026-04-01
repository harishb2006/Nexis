import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration for general uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexis/uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// Multer storage configuration for product images
const pstorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexis/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// Initialize upload object
const upload = multer({ storage: storage });
const pupload = multer({ storage: pstorage });

export { upload, pupload };
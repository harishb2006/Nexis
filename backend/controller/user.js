import express from "express";
import path from "path";
import fs from "fs";
import User from "../model/user.js";
import { upload } from "../multer.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { isAuthenticatedUser } from '../middleware/auth.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const router = express.Router();

router.post(
  "/create-user",
  upload.single("file"), // Expect file to be named "file"
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    let fileUrl = "";
    if (req.file) {
      fileUrl = req.file.path; // Cloudinary secure URL
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      avatar: {
        public_id: req.file?.filename || "default_avatar",
        url: fileUrl || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      },
    });

    res.status(201).json({ success: true, user });
    console.log("User created successfully:", user);
  })
);

router.post("/login", catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  // Generate JWT token with 7 days expiry
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "randomtoken1234567890",
    { expiresIn: "7d" }
  );

  // Set token in an HttpOnly cookie (7 days)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  user.password = undefined; // Remove password from response
  res.status(200).json({
    success: true,
    token,
    user,
  });

}));

router.get("/getuser", isAuthenticatedUser, catchAsyncErrors(async (req, res, next) => {
  // Return current authenticated user from cookie
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      phoneNumber: req.user.phoneNumber,
    },
  });
}));

router.post("/logout", catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}));

router.get("/profile", isAuthenticatedUser, catchAsyncErrors(async (req, res, next) => {
  const { email } = req.query;
  if (!email) {
    return next(new ErrorHandler("Please provide an email", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatar.url
    },
    addresses: user.addresses,
  });
}));

router.post("/add-address", isAuthenticatedUser, catchAsyncErrors(async (req, res, next) => {
  const { country, city, address1, address2, zipCode, addressType, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const newAddress = {
    country,
    city,
    address1,
    address2,
    zipCode,
    addressType,
  };
  user.addresses.push(newAddress);
  await user.save();
  res.status(201).json({
    success: true,
    addresses: user.addresses,
  });
}));

router.get("/addresses", isAuthenticatedUser, catchAsyncErrors(async (req, res, next) => {
  const { email } = req.query;
  if (!email) {
    return next(new ErrorHandler("Please provide an email", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    addresses: user.addresses,
  });
}
));

export default router;
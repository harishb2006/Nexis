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
      console.log("Creating user...");
      const { name, email, password } = req.body;
  
      const userEmail = await User.findOne({ email });
      if (userEmail) {
        if (req.file) {
          const filepath = path.join(__dirname, "../uploads", req.file.filename);
          try {
            fs.unlinkSync(filepath); // Delete the file if user already exists
          } catch (err) {
            console.log("Error removing file:", err);
            return res.status(500).json({ message: "Error removing file" });
          }
        }
        return next(new ErrorHandler("User already exists", 400));
      }
  
      let fileUrl = "";
      if (req.file) {
        fileUrl = path.join("uploads", req.file.filename); // Construct file URL
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        avatar: {
          public_id: req.file?.filename || "",
          url: fileUrl,
        },
      });
  
      res.status(201).json({ success: true, user});
    })
  );

  router.post("/login", catchAsyncErrors(async (req, res, next) => {
    console.log("Logging in user...");
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    console.log(isPasswordMatched)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "randomtoken1234567890",
      { expiresIn: "1h" }
  );

  // Set token in an HttpOnly cookie
  res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // use true in production
      // sameSite: "Strict",
      secure: true, // Must be true for cross-site cookies
      sameSite: "None", // Important for cross-site cookies
      maxAge: 3600000, // 1 hour
  });

  user.password = undefined; // Remove password from response
  res.status(200).json({
    success: true,
    token, 
    user,
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
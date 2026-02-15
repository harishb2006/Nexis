import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import catchAsyncErrors from './catchAsyncErrors.js';
//  const JWT=process.env.JWT_SECRET;

 const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
     const token = req.cookies.token;
     console.log("Token from cookies:", token);
     console.log(req.cookies);
 
     if (!token) {
         return next(new ErrorHandler("Please login to access this resource", 401));
     }
 
     let decodedData;
     try {
         // Verify token using your JWT secret
         decodedData = jwt.verify(token, "randomtoken1234567890");
         console.log("Decoded data:", decodedData);
     } catch (err) {
         // If this block executes, jwt.verify() threw an error
         console.error("JWT verification error:", err.name, err.message);
         return next(new ErrorHandler("Invalid or expired token", 401));
     }
 
     // Now attach user details to request
     req.user = await User.findById(decodedData.id);
     if (!req.user) {
         return next(new ErrorHandler("User not found", 404));
     }
 
     next();
 });

 // Admin role check middleware
 const isAdmin = catchAsyncErrors(async (req, res, next) => {
     if (!req.user) {
         return next(new ErrorHandler("Please login first", 401));
     }

     if (req.user.role !== "admin") {
         return next(new ErrorHandler("Access denied. Admin privileges required.", 403));
     }

     next();
 });
 
 export { isAuthenticated, isAdmin };
 
 // Alias for backward compatibility
 export const isAuthenticatedUser = isAuthenticated;
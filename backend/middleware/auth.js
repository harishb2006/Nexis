import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import catchAsyncErrors from './catchAsyncErrors.js';
//  const JWT=process.env.JWT_SECRET;

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log("Auth failed: No token found in cookies");
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    let decodedData;
    try {
        // Verify token using your JWT secret
        decodedData = jwt.verify(token, "randomtoken1234567890");
    } catch (err) {
        console.log("Auth failed: jwt.verify error", err.message);
        // If this block executes, jwt.verify() threw an error
        return next(new ErrorHandler("Invalid or expired token", 401));
    }

    // Now attach user details to request
    req.user = await User.findById(decodedData.id);
    if (!req.user) {
        console.log("Auth failed: User not found with ID", decodedData.id);
        return next(new ErrorHandler("User not found", 404));
    }

    next();
});

// Admin role check middleware
const isAdmin = catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
        console.log("Admin check failed: req.user not found");
        return next(new ErrorHandler("Please login first", 401));
    }

    if (req.user.role !== "admin") {
        console.log("Admin check failed: User is not admin. Role:", req.user.role);
        return next(new ErrorHandler("Access denied. Admin privileges required.", 403));
    }

    next();
});

export { isAuthenticated, isAdmin };

// Alias for backward compatibility
export const isAuthenticatedUser = isAuthenticated;
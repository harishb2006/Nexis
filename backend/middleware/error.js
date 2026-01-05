const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server Error";

    // wrong MongoDB ID error
    if (err.name === "CastError") {
        const message = `Resource not found with this ID. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    // wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Your URL is invalid. Please try again later.`;
        err = new ErrorHandler(message, 400);
    }

    // JWT expired
    if (err.name === "TokenExpiredError") {
        const message = `Your URL has expired. Please try again later!`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
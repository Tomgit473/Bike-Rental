import mongoose from "mongoose";

const normalizeError = (error) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: "Validation failed.",
      details: Object.values(error.errors).map((item) => item.message)
    };
  }

  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern || {});
    return {
      statusCode: 409,
      message: `${fields.join(", ") || "Record"} already exists.`,
      details: error.keyValue
    };
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      message: "Invalid or expired authentication token."
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.message || "Something went wrong.",
    details: error.details
  };
};

export const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);

  if (process.env.NODE_ENV !== "test") {
    console.error(`[${req.method}] ${req.originalUrl}`, error);
  }

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    details: normalized.details,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};

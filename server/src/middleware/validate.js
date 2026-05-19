import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(422, "Request validation failed.", errors.array()));
  }

  next();
};

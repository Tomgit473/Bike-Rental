import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

export const sendToken = (res, user, statusCode = 200) => {
  const token = generateToken(user);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toAuthJSON()
  });
};

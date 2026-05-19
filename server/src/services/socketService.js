import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const configureSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id name role");
      if (user) socket.user = user;

      next();
    } catch (_error) {
      next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.user?._id) {
      socket.join(`user:${socket.user._id}`);
    }

    socket.on("chat:join", (bookingId) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on("chat:message", ({ bookingId, message }) => {
      io.to(`booking:${bookingId}`).emit("chat:message", {
        bookingId,
        message,
        sender: socket.user
          ? { id: socket.user._id, name: socket.user.name, role: socket.user.role }
          : null,
        createdAt: new Date()
      });
    });
  });
};

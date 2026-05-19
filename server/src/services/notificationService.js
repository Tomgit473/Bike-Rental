import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";

export const createNotification = async ({
  user,
  title,
  message,
  type = "system",
  channels = { email: true, sms: false, push: true },
  data = {}
}) => {
  const notification = await Notification.create({
    user: user._id || user,
    title,
    message,
    type,
    channels,
    data
  });

  if (channels.email && user.email) {
    await sendEmail({
      to: user.email,
      subject: title,
      text: message,
      html: `<p>${message}</p>`
    });
  }

  return notification;
};

export const emitToUser = (io, userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

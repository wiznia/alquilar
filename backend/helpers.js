import Notification from './notificationSchema.js';
import { pubsub } from './pubsub.js';

export const handleNotification = async (
  senderId,
  receiverId,
  content,
  type,
  listingId = null,
) => {
  const notification = new Notification({
    sender: senderId,
    receiver: receiverId,
    content,
    type,
    listingId,
    createdAt: new Date(),
  });

  await notification.save();

  pubsub.publish(`NOTIFICATION_RECEIVED_${receiverId.toString()}`, {
    notificationReceived: notification,
  });

  return notification;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

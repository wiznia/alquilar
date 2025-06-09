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

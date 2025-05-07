import Notification from './notificationSchema.js';

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
  });
  await notification.save();
};

import { useSubscription } from '@apollo/client';
import { SUBSCRIBE_NEW_NOTIFICATION } from '@/components/queries/queries';

export default function useListingNotificationRefetch({
  userId,
  listingId,
  onListingNotification,
}) {
  useSubscription(SUBSCRIBE_NEW_NOTIFICATION, {
    variables: { userId },
    onData: ({ data }) => {
      const notification = data?.data?.notificationReceived;
      if (notification?.listingId === listingId) {
        onListingNotification?.();
      }
    },
    skip: !userId || !listingId,
  });
}

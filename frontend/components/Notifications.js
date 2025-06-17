'use client';

import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_NOTIFICATIONS,
  SUBSCRIBE_NEW_NOTIFICATION,
} from './queries/queries';
import formatDateTime from '@/lib/formatDateTime';
import { useEffect, useState } from 'react';

export default function Notifications({
  userId,
  setNotificationCount,
  setNotificationData,
}) {
  const [notifications, setNotifications] = useState([]);
  const shouldSubscribe = Boolean(userId);
  const { data, loading, error } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId },
  });
  const sortedNotifications = [...notifications].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  useSubscription(SUBSCRIBE_NEW_NOTIFICATION, {
    variables: { userId },
    onData: ({ data }) => {
      const newNotification = data?.data?.notificationReceived;
      if (newNotification) {
        setNotifications((prev) => {
          const exists = prev.some((n) => n._id === newNotification._id);
          if (exists) return prev;
          return [newNotification, ...prev];
        });
        setNotificationCount((prev) => prev + 1);
        setNotificationData((prev) => [newNotification, ...prev]);
      } else {
        console.warn('❌ No se recibió notificationReceived en la data.');
      }
    },
    onError: (err) => {
      console.error('🧨 Error en subscription:', err);
    },
    skip: !shouldSubscribe,
  });

  useEffect(() => {
    if (data && data.getNotifications) {
      setNotifications(data.getNotifications);
      setNotificationCount(data.getNotifications.length);
      setNotificationData(data.getNotifications);
    }
  }, [data, setNotificationCount, setNotificationData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {sortedNotifications.length > 0 ? (
        sortedNotifications.map((notification) => (
          <div key={notification._id} className="notification">
            <div className="notification__pic">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="31"
                height="31"
                fill="none"
              >
                <rect
                  width="30"
                  height="29"
                  fill="#FF9500"
                  rx="14.5"
                  transform="matrix(.99998 -.00315 -.00173 1.00002 .084 1.055)"
                />
                <path
                  fill="#FAFAFA"
                  d="M15.061 14.008a3.48 3.48 0 0 1-3.494-3.49 3.52 3.52 0 0 1 3.506-3.51 3.48 3.48 0 0 1 3.494 3.489 3.52 3.52 0 0 1-3.506 3.51ZM8.047 22.28l-.002.875a.87.87 0 0 0 .874.872l12.25-.038a.88.88 0 0 0 .876-.878l.002-.875a5.225 5.225 0 0 0-1.532-3.708 5.224 5.224 0 0 0-3.71-1.526l-3.5.011a5.275 5.275 0 0 0-3.714 1.55 5.276 5.276 0 0 0-1.544 3.717Z"
                />
              </svg>
            </div>
            <div className="notification__info small">
              <div
                dangerouslySetInnerHTML={{ __html: notification.content }}
              ></div>
              <small>{formatDateTime(notification.createdAt)}</small>
            </div>
          </div>
        ))
      ) : (
        <small className="notification">No tenés notificaciones!</small>
      )}
    </ul>
  );
}

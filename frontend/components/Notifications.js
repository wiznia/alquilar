'use client';

import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_NOTIFICATIONS,
  SUBSCRIBE_NEW_NOTIFICATION,
} from './queries/queries';
import formatDateTime from '@/lib/formatDateTime';
import { useEffect, useState } from 'react';
import Icon from './Icon';

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
              <Icon name="user" />
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

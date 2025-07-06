'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import NavbarPopover from './NavbarPopover';
import Notifications from './Notifications';
import { useRef, useState } from 'react';
import { MARK_NOTIFICATIONS_AS_READ } from './queries/queries';
import { useMutation } from '@apollo/client';
import Icon from './Icon';
import Gravatar from 'react-gravatar';

export default function Nav() {
  const { user, logout } = useAuth();
  const notificationsAnchorName = `--anchor-notifications`;
  const accountAnchorName = `--anchor-account`;
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationData, setNotificationData] = useState([]);
  const notificationsRef = useRef(null);
  const [markNotificationsAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ, {
    onCompleted: () => {
      const updatedCount = notificationData.filter(
        (n) => n.read === false,
      ).length;
      setNotificationCount(updatedCount);
    },
  });

  const handleNotifications = () => {
    const unreadNotifications = notificationData
      .filter((notification) => notification.read !== true)
      .map((notification) => notification.id);

    if (unreadNotifications.length > 0) {
      markNotificationsAsRead({
        variables: { notifications: unreadNotifications },
      });

      setNotificationData((prev) =>
        prev.map((notification) =>
          unreadNotifications.includes(notification.id)
            ? { ...notification, read: true }
            : notification,
        ),
      );
    }
  };

  return (
    <nav>
      <Link href="/listings">FAQs</Link>
      {user ? (
        <>
          <button
            popoverTarget="account"
            style={{ anchorName: accountAnchorName }}
          >
            <a>
              <Gravatar email={user?.email} className="gravatar" />
              {user?.nombre} {user?.apellido.slice(0, 1)}.
            </a>
          </button>
          <NavbarPopover id="account">
            <Link href="/account/settings">Mi cuenta</Link>
            <Link href={`/user/${user?.id}`}>Perfil</Link>
            <a onClick={logout}>Salir</a>
          </NavbarPopover>
          <button
            className="notifications"
            popoverTarget="notifications"
            style={{ anchorName: notificationsAnchorName }}
            onClick={handleNotifications}
          >
            <Icon name="notification" />
            {notificationCount !== 0 && (
              <span className="notifications__count">{notificationCount}</span>
            )}
          </button>
          <NavbarPopover id="notifications" popoverAction="auto">
            <Notifications
              userId={user?.id}
              setNotificationCount={setNotificationCount}
              setNotificationData={setNotificationData}
              ref={notificationsRef}
            />
          </NavbarPopover>
          {user?.tipo_de_cuenta === 'Dueño' && (
            <Link className="button" href="/account/listings/createListing">
              Publicar
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href="/login">Iniciar sesión</Link>
          <Link className="button" href="/register">
            Registrarse
            <Icon name="arrowRight" className="register" />
          </Link>
        </>
      )}
    </nav>
  );
}

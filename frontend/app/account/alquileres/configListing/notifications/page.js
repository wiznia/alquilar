'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import {
  GET_USER_LISTING_NOTIFICATIONS,
  SINGLE_LISTING_QUERY,
} from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useEffect, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';
import formatDateTime from '@/lib/formatDateTime';
import Gravatar from 'react-gravatar';

function Notifications() {
  const { user } = useAuth();
  const pathname = usePathname();
  const page = pathname.split('/').findLast((element) => element);
  const id = useSearchParams().get('id');
  const [shouldFetchNotifications, setShouldFetchNotifications] =
    useState(false);
  const { data, loading, error } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const {
    data: dataNotifications,
    loading: loadingNotifications,
    error: errorNotifications,
  } = useQuery(GET_USER_LISTING_NOTIFICATIONS, {
    variables: {
      userId: user?.id,
      listingId: id,
    },
    skip: !shouldFetchNotifications,
  });
  const sortedNotifications = dataNotifications?.getUserListingNotifications
    ? [...dataNotifications.getUserListingNotifications].sort((a, b) => {
        return Number(b.createdAt) - Number(a.createdAt);
      })
    : [];

  useEffect(() => {
    if (user?.id) {
      setShouldFetchNotifications(true);
    } else {
      setShouldFetchNotifications(false);
    }
  }, [user]);

  if (loading) {
    return (
      <Loading>
        <h4>Cargando inmueble...</h4>
      </Loading>
    );
  }

  if (error) {
    return (
      <Loading>
        <p>
          Hubo un problema al cargar el inmueble:
          {error.message}
        </p>
      </Loading>
    );
  }

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <Breadcrumb
          direccion={data?.getListingById?.direccion}
          title={user?.tipo_de_cuenta === 'Dueño' ? 'inmuebles' : 'alquileres'}
          user={user}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} listingData={data} />
        {sortedNotifications?.length === 0 ? (
          <p>Aún no hay notificaciones para este inmueble.</p>
        ) : (
          sortedNotifications.map((notification, i) => (
            <div key={i} className="account__info-ownership-item">
              <Gravatar email={user?.email} className="gravatar" />
              <small
                dangerouslySetInnerHTML={{ __html: notification.content }}
              ></small>
              <small className="date">
                {formatDateTime(notification.createdAt)}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Notifications />
    </Suspense>
  );
}

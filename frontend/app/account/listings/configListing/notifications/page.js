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

  if (loadingNotifications) {
    return (
      <Loading>
        <h4>Cargando notificaciones...</h4>
      </Loading>
    );
  }

  if (errorNotifications) {
    return (
      <Loading>
        <p>
          Hubo un problema al cargar las notificaciones:
          {errorNotifications.message}
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
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} />
        {dataNotifications?.getUserListingNotifications?.length === 0 ? (
          <div>Aún no hay notificaciones para este inmueble.</div>
        ) : (
          dataNotifications?.getUserListingNotifications.map(
            (notification, i) => (
              <div key={i} className="account__info-ownership-item">
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
                <small
                  dangerouslySetInnerHTML={{ __html: notification.content }}
                ></small>
              </div>
            ),
          )
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

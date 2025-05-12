'use client';

import AccountSidebar from '@/components/AccountSidebar';
import { useAuth } from '@/components/AuthContext';
import AccountListing from '@/components/AccountListing';
import Loading from '@/components/Loading';
import { GET_LISTINGS_BY_OWNER } from '@/components/queries/queries';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Page() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const { data, loading, error, refetch } = useQuery(GET_LISTINGS_BY_OWNER, {
    variables: {
      id: userId,
    },
    skip: !userId,
  });

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      refetch({
        id: userId,
      });
    }
  }, [userId]);

  if (loading) {
    return (
      <Loading>
        <h4>Cargando publicaciones...</h4>
      </Loading>
    );
  }

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__column">
        {!loading && data?.getListings?.listings.length === 0 ? (
          <>
            <h2>Mis inmuebles</h2>
            <div className="account__column-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="512"
                height="294"
                fill="#000"
              >
                <path d="M486.53 121.3 408.87 31a5.09 5.09 0 0 0-3.87-1.8H292.87c-.16-.01-.321-.01-.48 0l-25.93-25a15.001 15.001 0 0 0-20.91 0l-25.93 25H107a5.113 5.113 0 0 0-3.87 1.78L25.47 121.3a5.096 5.096 0 0 0-.775 5.453 5.1 5.1 0 0 0 4.635 2.977h10.18v159.21a5.098 5.098 0 0 0 5.1 5.1h422.78a5.1 5.1 0 0 0 5.1-5.1V129.73h10.18a5.1 5.1 0 0 0 3.86-8.43Zm-83.87-81.9 68.89 80.13H373.8a21.007 21.007 0 0 0-6.2-17.71L302.93 39.4h99.73Zm-150-27.86a4.838 4.838 0 0 1 6.75 0l101.14 97.62a10.843 10.843 0 0 1 .52 14.9 10.611 10.611 0 0 1-7.79 3.8 10.443 10.443 0 0 1-8.06-3.21l-5.41-5.51a5.083 5.083 0 0 0-2.06-2.1l-71.13-72.43a15.121 15.121 0 0 0-21.23 0L174.28 117a5.071 5.071 0 0 0-2.06 2.1l-5.41 5.51a10.574 10.574 0 0 1-8.05 3.21 10.996 10.996 0 0 1-9.682-6.999 11 11 0 0 1 2.412-11.701l101.17-97.58ZM109.34 39.4h99.73l-64.66 62.42a20.81 20.81 0 0 0-6.16 17.71h-97.8l68.89-80.13Zm-59.63 90.33h92.75c.24.31.46.62.71.92a21.004 21.004 0 0 0 15.21 7.4h.77a20.942 20.942 0 0 0 12.48-4.14v149.93H49.71V129.73Zm178 154.11v-56.66a28 28 0 0 1 28-28h.66a28 28 0 0 1 28 28v56.66h-56.66Zm66.84 0v-56.66A38.234 38.234 0 0 0 256.33 189h-.66a38.228 38.228 0 0 0-38.19 38.19v56.66h-35.65V123.92l70.75-72.06a4.857 4.857 0 0 1 6.78-.05l70.81 72.1v159.93h-35.62Zm167.77 0H340.37V133.93a20.93 20.93 0 0 0 28.63-3.52c.19-.22.35-.46.52-.68h92.73l.07 154.11Z" />
                <path d="M365.75 167.35a5.1 5.1 0 0 0-5.1 5.1v68.75a5.109 5.109 0 0 0 5.1 5.1h68.76a5.107 5.107 0 0 0 3.607-1.494 5.092 5.092 0 0 0 1.493-3.606v-68.75a5.107 5.107 0 0 0-1.493-3.606 5.11 5.11 0 0 0-3.607-1.494h-68.76Zm29.25 10.2v24.17h-24.15v-24.17H395Zm-24.18 34.37H395v24.18h-24.15l-.03-24.18Zm34.38 24.18v-24.18h24.18v24.18H405.2Zm24.18-34.38h-24.15v-24.17h24.18l-.03 24.17ZM146.25 167.35H77.5a5.098 5.098 0 0 0-5.1 5.1v68.75a5.098 5.098 0 0 0 5.1 5.1h68.75a5.113 5.113 0 0 0 5.1-5.1v-68.75a5.1 5.1 0 0 0-5.1-5.1Zm-5.1 34.37H117v-24.17h24.18l-.03 24.17Zm-34.38-24.17v24.17H82.6v-24.17h24.17ZM82.6 211.92h24.17v24.18H82.6v-24.18ZM117 236.1v-24.18h24.18v24.18H117Z" />
              </svg>
              <h4>¡Todavía no publicaste ningún inmueble!</h4>
              <Link className="button" href="/account/listings/createListing">
                Publicar nuevo inmueble +
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="account__header">
              <h2>Inmuebles publicados</h2>
              <Link className="button" href="/account/listings/createListing">
                Publicar nuevo inmueble +
              </Link>
            </div>
            <div className="account-listing-container">
              {data?.getListings?.listings.map((listing) => (
                <AccountListing
                  key={listing.id}
                  listing={listing}
                  user={user}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

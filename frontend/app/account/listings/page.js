'use client';

import AccountSidebar from '@/components/AccountSidebar';
import { useAuth } from '@/components/AuthContext';
import AccountListing from '@/components/AccountListing';
import Loading from '@/components/Loading';
import { GET_LISTINGS_BY_OWNER } from '@/components/queries/queries';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';

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

  if (error) {
    return (
      <Loading>
        <p>
          Hubo un problema al cargar los inmuebles:
          {error.message}
        </p>
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
              <Icon name="house" />
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

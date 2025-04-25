'use client';

import AccountSidebar from '@/components/AccountSidebar';
import { useAuth } from '@/components/AuthContext';
import Listing from '@/components/Listing';
import Loading from '@/components/Loading';
import { ALL_LISTINGS_QUERY } from '@/components/queries/queries';
import { useQuery } from '@apollo/client';

export default function Wishlist() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(ALL_LISTINGS_QUERY, {
    variables: {
      likes: [user?.id],
      estado: ['Activo'],
    },
    skip: !user?.id,
  });

  if (loading) {
    return (
      <Loading>
        <h4>Cargando publicaciones...</h4>
      </Loading>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <p>
          Hubo un problema al cargar el listado de publicaciones:
          {error.message}
        </p>
      </div>
    );
  }
  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__column">
        <h2>Wishlist</h2>
        {data?.getListings.count === 0 ? (
          <>
            <h4>Todavía no tenés publicaciones guardadas en tu wishlist.</h4>
          </>
        ) : (
          <div className="entries">
            {data?.getListings?.listings.map((listing) => (
              <Listing key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

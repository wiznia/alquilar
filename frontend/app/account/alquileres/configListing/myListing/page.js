'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';
import { SINGLE_LISTING_QUERY } from '@/components/queries/queries';

function ConfigListing() {
  const { user } = useAuth();
  const id = useSearchParams().get('id');
  const pathname = usePathname();
  const page = pathname.split('/').findLast((element) => element);
  const { data, loading, error } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });

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
          title="alquileres"
          user={user}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} listingData={data} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ConfigListing />
    </Suspense>
  );
}

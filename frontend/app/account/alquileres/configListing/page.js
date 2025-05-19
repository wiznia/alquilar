'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { SINGLE_LISTING_QUERY } from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useEffect, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';

function ConfigListing() {
  const { user } = useAuth();
  const id = useSearchParams().get('id');
  const pathname = usePathname();
  const page = pathname.split('/').findLast((element) => element);
  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
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
          title={user?.tipo_de_cuenta === 'Dueño' ? 'inmuebles' : 'alquileres'}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} />
        {data?.getListingById?.documentation.length === 0 && (
          <div className="account__info-inner">
            <p>
              Para poder ver la información de este inmueble, primero tenés que
              subir tus documentos en la pestaña de "documentación". Una vez que
              lo hayas hecho vas a poder ver la configuración en esta pestaña.
            </p>
          </div>
        )}
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

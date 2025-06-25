'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import {
  NEW_PAYMENT_SUBSCRIPTION,
  SINGLE_LISTING_QUERY,
  UPDATE_LISTING,
} from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import formatMoney from '@/lib/formatMoney';
import useListingNotificationRefetch from '@/app/hooks/useListingNotificationRefetch';

function ConfigListing() {
  const { user } = useAuth();
  const id = useSearchParams().get('id');
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [, setPaymentData] = useState({});
  const page = pathname.split('/').findLast((element) => element);
  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });

  useListingNotificationRefetch({
    userId: user?.id,
    listingId: id,
    onListingNotification: refetch,
  });

  useSubscription(NEW_PAYMENT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const paymentData = data?.data?.newPayment;
      if (!paymentData) return;

      setPaymentData(paymentData);
      refetch();
    },
  });

  const userDocumentation = data?.getListingById?.documentation.filter(
    (documentation) => documentation.id === user?.id,
  );
  const cbu = data?.getListingById?.payment?.cbu;
  const sena = data?.getListingById?.sena;
  const mpPaymentLink = data?.getListingById?.mpPaymentLink;
  const canBook = (cbu && sena) || (mpPaymentLink && sena);
  const { form, setForm, errors, validateFormCheck } = useFormValidation(
    data?.getListingById,
    'updateListing',
  );
  const [updateListing] = useMutation(UPDATE_LISTING);

  const handlePaidReservation = async (e) => {
    e.preventDefault();

    if (!validateFormCheck()) {
      return;
    }

    setIsLoading(true);

    await updateListing({
      variables: {
        id,
        input: {
          payment: {
            paymentDone: true,
          },
          id,
        },
        senderId: user?.id,
      },
    });

    setIsLoading(false);
    await refetch();
  };

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
        <div className="account__info-inner">
          {userDocumentation.length === 0 &&
            !user?.documentation.documentsAreGlobal && (
              <>
                <p>
                  Para poder ver la información de este inmueble, primero tenés
                  que subir tus documentos en la pestaña de "documentación". Una
                  vez que lo hayas hecho vas a poder ver la configuración en
                  esta pestaña.
                </p>
              </>
            )}
          {sena > 0 &&
            data?.getListingById?.payment?.status !== 'approved' &&
            !data?.getListingById?.payment?.paymentDone && (
              <>
                <h6>Seña:</h6>
                <h5>{formatMoney(sena)}</h5>
                {((cbu && mpPaymentLink) ||
                  (!cbu && mpPaymentLink) ||
                  (!mpPaymentLink && cbu)) && (
                  <>
                    <p>
                      Enviá la seña{' '}
                      {mpPaymentLink && !cbu
                        ? 'por Mercado Pago'
                        : !mpPaymentLink && cbu
                          ? 'al siguiente CBU'
                          : mpPaymentLink && cbu
                            ? 'por Mercado Pago o al siguiente CBU'
                            : ''}{' '}
                      y clickeá en "Ya pagué" para avisarle al dueño.
                    </p>
                    {cbu && <h6>{cbu}</h6>}
                    <div className="button-container">
                      <button
                        className={`button ${cbu && !mpPaymentLink ? '' : 'button--secondary'}`}
                        onClick={handlePaidReservation}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="loader"></span>
                        ) : (
                          <span>Ya pagué</span>
                        )}
                      </button>
                      {mpPaymentLink && (
                        <Link
                          className="button"
                          href={mpPaymentLink}
                          target="_blank"
                        >
                          Reservar por MP
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          {!canBook && (
            <p>
              Aún no podés continuar con la reserva porque el dueño no configuró
              un método de pago.
            </p>
          )}
          {(data?.getListingById?.payment?.status === 'approved' ||
            data?.getListingById?.payment?.paymentDone) && (
            <>
              {data?.getListingById?.contract?.potentialTenantAgreed && (
                <>
                  {data?.getListingById?.signature ? (
                    <>
                      <h5 className="text-success">
                        Felicidades! ya reservaste el inmueble!
                      </h5>
                      <h6>Datos de mi reserva:</h6>
                      {data?.getListingById?.payment?.mpPaymentId ? (
                        <p>
                          Pagaste {formatMoney(data?.getListingById?.sena)} con
                          Mercado Pago.
                        </p>
                      ) : (
                        <p>
                          Pagaste {formatMoney(data?.getListingById?.sena)} por
                          transferencia bancaria.
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      Arreglá con el dueño la firma de contrato para cerrar la
                      operación.
                    </p>
                  )}
                </>
              )}
              {!data?.getListingById?.contract?.potentialTenantAgreed &&
                data?.getListingById?.contract?.documents?.length > 0 && (
                  <p>
                    <Link
                      className="dark"
                      href={`/account/alquileres/configListing/documents?id=${id}`}
                    >
                      Confirmá
                    </Link>{' '}
                    que el contrato esté en orden y tus datos estén bien.
                  </p>
                )}
            </>
          )}
        </div>
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

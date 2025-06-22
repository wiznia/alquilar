import Link from 'next/link';

export default function InlineNav({ id, page, user, listingData }) {
  return (
    <nav className="inline-nav">
      <ul>
        {(listingData?.getListingById?.payment?.paymentDone ||
          listingData?.getListingById?.payment?.mpPaymentId) &&
          listingData?.getListingById?.signature &&
          listingData?.getListingById?.contract?.potentialTenantAgreed &&
          user?.tipo_de_cuenta === 'Inquilino' && (
            <li
              className={
                page === 'myListing'
                  ? 'inline-nav__item--active'
                  : 'inline-nav__item'
              }
            >
              <Link
                href={{
                  pathname: '/account/alquileres/configListing/myListing',
                  query: {
                    id,
                  },
                }}
              >
                <h6>Mi alquiler</h6>
              </Link>
            </li>
          )}
        <li
          className={
            page === 'configListing'
              ? 'inline-nav__item--active'
              : 'inline-nav__item'
          }
        >
          <Link
            href={{
              pathname:
                user?.tipo_de_cuenta === 'Dueño'
                  ? '/account/listings/configListing'
                  : '/account/alquileres/configListing',
              query: {
                id,
              },
            }}
          >
            <h6>
              {user?.tipo_de_cuenta === 'Dueño'
                ? 'Configuración'
                : listingData?.getListingById?.signature
                  ? 'Mi reserva'
                  : 'Reservar inmueble'}
            </h6>
          </Link>
        </li>
        <li
          className={
            page === 'notifications'
              ? 'inline-nav__item--active'
              : 'inline-nav__item'
          }
        >
          <Link
            href={{
              pathname:
                user?.tipo_de_cuenta === 'Dueño'
                  ? '/account/listings/configListing/notifications'
                  : '/account/alquileres/configListing/notifications',
              query: {
                id,
              },
            }}
          >
            <h6>Notificaciones</h6>
          </Link>
        </li>
        <li
          className={
            page === 'documents' || page === 'generateContract'
              ? 'inline-nav__item--active'
              : 'inline-nav__item'
          }
        >
          <Link
            href={{
              pathname:
                user?.tipo_de_cuenta === 'Dueño'
                  ? '/account/listings/configListing/documents'
                  : '/account/alquileres/configListing/documents',
              query: {
                id,
              },
            }}
          >
            <h6>Documentación</h6>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

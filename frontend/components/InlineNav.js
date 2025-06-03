import Link from 'next/link';

export default function InlineNav({ id, page, user }) {
  return (
    <nav className="inline-nav">
      <ul>
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
            <h6>Configuración</h6>
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

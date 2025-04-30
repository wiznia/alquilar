import Link from 'next/link';

export default function InlineNav({ id }) {
  return (
    <nav className="inline-nav">
      <ul>
        <li className="inline-nav__item--active">
          <Link
            href={{
              pathname: `/account/listings/configListing`,
              query: {
                id,
              },
            }}
          >
            <h6>Configuración</h6>
          </Link>
        </li>
        <li className="inline-nav__item">
          <Link
            href={{
              pathname: `/account/listings/configListing/notifications`,
              query: {
                id,
              },
            }}
          >
            <h6>Notificaciones</h6>
          </Link>
        </li>
        <li className="inline-nav__item">
          <Link
            href={{
              pathname: `/account/listings/configListing/documents`,
              query: {
                id,
              },
            }}
          >
            <h6>Documentación</h6>
          </Link>
        </li>
        <li className="inline-nav__item">
          <Link
            href={{
              pathname: `/account/listings/configListing/payments`,
              query: {
                id,
              },
            }}
          >
            <h6>Pagos</h6>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

import Link from 'next/link';
import Icon from './Icon';

export default function Listing({ listing, user }) {
  const { direccion, provincia, barrio, estado, id } = listing;

  let pillColor = '';
  switch (estado[0]) {
    case 'Borrador':
      pillColor = 'borrador';
      break;
    case 'Activo':
      pillColor = 'activo';
      break;
    case 'Pausado':
      pillColor = 'pausado';
      break;
    case 'Reservado':
      pillColor = 'reservado';
      break;
    case 'Alquilado':
      pillColor = 'alquilado';
      break;
  }

  return (
    <div className="shadow account-listing">
      <div className="account-listing__info">
        <h6>
          <Link href={`/listing/${id}`}>{direccion}</Link>
        </h6>
        <p>
          {barrio}, {provincia}
        </p>
        <span className={`pill ${pillColor}`}>{estado}</span>
      </div>
      <div className="account-listing__buttons">
        {listing?.owner?.id === user?.id &&
          !listing?.estado.includes('Reservado') &&
          !listing.estado.includes('Alquilado') && (
            <>
              <Link
                className="button button--danger button--small"
                href={{
                  pathname: `/account/listings/deleteListing`,
                  query: {
                    id: listing.id,
                  },
                }}
              >
                <Icon name="trash" fill="#fff" />
                Eliminar publicación
              </Link>
              <Link
                className="button button--secondary button--small"
                href={{
                  pathname: '/account/listings/updateListing',
                  query: {
                    id: listing.id,
                  },
                }}
              >
                <Icon name="edit" />
                Editar
              </Link>
            </>
          )}
        <Link
          className="button button--small"
          href={{
            pathname:
              user?.tipo_de_cuenta === 'Dueño'
                ? '/account/listings/configListing'
                : user?.tipo_de_cuenta !== 'Dueño' && estado[0] === 'Alquilado'
                  ? '/account/alquileres/configListing/myListing'
                  : '/account/alquileres/configListing',
            query: {
              id: listing.id,
            },
          }}
        >
          <Icon name="config" />
          {user?.tipo_de_cuenta === 'Dueño'
            ? 'Configurar inmueble'
            : 'Ver detalles'}
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function Listing({ listing }) {
  const { direccion, provincia, barrio, estado } = listing;

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
    case 'En negociación':
      pillColor = 'negociacion';
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
        <h6>{direccion}</h6>
        <p>
          {barrio}, {provincia}
        </p>
        <span className={`pill ${pillColor}`}>{estado}</span>
      </div>
      <div className="account-listing__buttons">
        {estado[0] === 'Alquilado' ||
        estado[0] === 'Reservado' ||
        estado[0] === 'En negociación' ? (
          <Link
            className="button"
            href={{
              pathname: '/account/listings/configListing',
              query: {
                id: listing.id,
              },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
            >
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M17.4 11c0-.3.1-.6.1-1s0-.7-.1-1l2.1-1.7c.2-.2.2-.4.1-.6l-2-3.5c-.1-.1-.3-.2-.6-.1l-2.5 1c-.5-.4-1.1-.7-1.7-1L12.4.5c.1-.3-.2-.5-.4-.5H8c-.2 0-.5.2-.5.4l-.4 2.7c-.6.2-1.1.6-1.7 1L3 3.1c-.3-.1-.5 0-.7.2l-2 3.5c-.1.1 0 .4.2.6L2.6 9c0 .3-.1.6-.1 1s0 .7.1 1L.5 12.7c-.2.2-.2.4-.1.6l2 3.5c.1.1.3.2.6.1l2.5-1c.5.4 1.1.7 1.7 1l.4 2.6c0 .2.2.4.5.4h4c.2 0 .5-.2.5-.4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1c.2.1.5 0 .6-.2l2-3.5c.1-.2.1-.5-.1-.6L17.4 11ZM10 13.5c-1.9 0-3.5-1.6-3.5-3.5S8.1 6.5 10 6.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5Z"
                clipRule="evenodd"
              />
            </svg>
            Configurar
          </Link>
        ) : (
          <>
            <Link
              className="button button--danger"
              href={{
                pathname: `/account/listings/deleteListing`,
                query: {
                  id: listing.id,
                },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="22"
                fill="none"
              >
                <path
                  fill="#fff"
                  d="M17.357 3.929h-3.31l-1.366-2.28c-.382-.58-.973-.935-1.648-.935H6.967c-.675 0-1.302.355-1.647.935l-1.367 2.28H.643A.641.641 0 0 0 0 4.572v.642a.64.64 0 0 0 .643.643h.643v12.857a2.571 2.571 0 0 0 2.571 2.572h10.286a2.571 2.571 0 0 0 2.571-2.572V5.857h.643A.64.64 0 0 0 18 5.214v-.643a.64.64 0 0 0-.643-.642Zm-10.45-1.17c.04-.07.12-.116.205-.116h3.776c.086 0 .166.045.206.115l.702 1.17H6.204l.703-1.17Zm7.236 16.598H3.857a.643.643 0 0 1-.643-.643V5.857h11.572v12.857c0 .354-.29.643-.643.643ZM9 17.43a.642.642 0 0 0 .643-.643V8.429a.642.642 0 1 0-1.286 0v8.357c0 .353.29.643.643.643Zm-3.214 0c.353 0 .643-.29.643-.643V8.429a.642.642 0 1 0-1.286 0v8.357c0 .353.29.643.643.643Zm6.428 0a.642.642 0 0 0 .643-.643V8.429a.642.642 0 1 0-1.286 0v8.357c0 .353.29.643.643.643Z"
                />
              </svg>
              Eliminar publicación
            </Link>
            <Link
              className="button button--secondary"
              href={{
                pathname: '/account/listings/updateListing',
                query: {
                  id: listing.id,
                },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
              >
                <g
                  stroke="#FF9500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M9.167 3.333H3.334A1.667 1.667 0 0 0 1.667 5v11.667a1.666 1.666 0 0 0 1.667 1.666H15a1.666 1.666 0 0 0 1.667-1.666v-5.834" />
                  <path d="M15.417 2.083a1.768 1.768 0 0 1 2.5 2.5L10 12.5l-3.333.833L7.5 10l7.917-7.917Z" />
                </g>
              </svg>
              Editar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

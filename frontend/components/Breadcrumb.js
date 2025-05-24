import Link from 'next/link';

export default function Breadcrumb({ direccion, title, user }) {
  return (
    <div className="breadcrumb">
      <Link
        href={
          user?.tipo_de_cuenta === 'Dueño'
            ? '/account/listings'
            : '/account/alquileres'
        }
        className="breadcrumb--active"
      >
        Mis {title}
      </Link>
      {'>'}
      <div>{direccion}</div>
    </div>
  );
}

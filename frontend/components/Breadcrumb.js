import Link from 'next/link';

export default function Breadcrumb({ direccion, title }) {
  return (
    <div className="breadcrumb">
      <Link href="/account/listings" className="breadcrumb--active">
        Mis {title}
      </Link>
      {'>'}
      <div>{direccion}</div>
    </div>
  );
}

import Link from 'next/link';

export default function InlineNav() {
  return (
    <nav className="inline-nav">
      <ul>
        <li className="inline-nav__item--active">
          <Link href="/configListing/config">
            <h6>Configuración</h6>
          </Link>
        </li>
        <li className="inline-nav__item">
          <Link href="/configListing/notifications">
            <h6>Notificaciones</h6>
          </Link>
        </li>
        <li className="inline-nav__item">
          <Link href="/configListing/documentation">
            <h6>Documentación</h6>
          </Link>
        </li>
        <li className="inline-nav__item">
          <Link href="/configListing/payments">
            <h6>Pagos</h6>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

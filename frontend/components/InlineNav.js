import Link from 'next/link';

export default function InlineNav() {
  return (
    <nav className="inline-nav">
      <ul>
        <li className="inline-nav__item--active">Configuración</li>
        <li>
          <Link href="/configListing/notifications">Notificaciones</Link>
        </li>
        <li>
          <Link href="/configListing/documentation">Documentación</Link>
        </li>
        <li>
          <Link href="/configListing/payments">Pagos</Link>
        </li>
      </ul>
    </nav>
  );
}

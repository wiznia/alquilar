'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountSidebar() {
  const { user } = useAuth();
  const currentPath = usePathname();
  const navPagesDueno = [
    { name: 'Configuración general', path: '/account/settings' },
    { name: 'Mis inmuebles', path: '/account/listings' },
    { name: 'Mis documentos', path: '/account/documents' },
    { name: 'Mensajes', path: '/account/messages' },
    { name: 'Calendario', path: '/account/calendar' },
  ];
  const navPagesInquilino = [
    { name: 'Configuración general', path: '/account/settings' },
    { name: 'Mis alquileres', path: '/account/alquileres' },
    { name: 'Mis documentos', path: '/account/documents' },
    { name: 'Wishlist', path: '/account/wishlist' },
    { name: 'Mensajes', path: '/account/messages' },
    { name: 'Calendario', path: '/account/calendar' },
  ];
  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };
  const navPages =
    user?.tipo_de_cuenta === 'Dueño' ? navPagesDueno : navPagesInquilino;

  return (
    <nav className="account-navbar">
      <ul>
        {navPages.map((page) => (
          <li key={page.name}>
            <Link
              href={page.path}
              className={isActive(page.path) ? 'small active' : 'small'}
            >
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

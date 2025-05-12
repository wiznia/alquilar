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
    { name: 'Mensajes', path: '/account/messages' },
    { name: 'Calendario', path: '/account/calendar' },
  ];
  const navPagesInquilino = [
    { name: 'Configuración general', path: '/account/settings' },
    { name: 'Mis alquileres', path: '/account/alquileres' },
    { name: 'Wishlist', path: '/account/wishlist' },
    { name: 'Mensajes', path: '/account/messages' },
    { name: 'Calendario', path: '/account/calendar' },
  ];
  const isActive = (path) => {
    return currentPath === path;
  };

  return (
    <nav className="account-navbar">
      <ul>
        {user?.tipo_de_cuenta === 'Dueño' ? (
          <>
            {navPagesDueno.map((page) => (
              <li key={page.name}>
                <Link
                  className={isActive(page.path) ? 'small active' : 'small'}
                  href={page.path}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </>
        ) : (
          <>
            {navPagesInquilino.map((page) => (
              <li key={page.name}>
                <Link
                  href={page.path}
                  className={isActive(page.path) ? 'small active' : 'small'}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </>
        )}
      </ul>
    </nav>
  );
}

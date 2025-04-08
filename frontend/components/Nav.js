'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import NavbarPopover from './NavbarPopover';

export default function Nav() {
  const { user, logout } = useAuth();
  const notificationsAnchorName = `--anchor-notifications`;
  const accountAnchorName = `--anchor-account`;

  return (
    <nav>
      <Link href="/listings">FAQs</Link>
      {user ? (
        <>
          <button
            popoverTarget="account"
            style={{ anchorName: accountAnchorName }}
          >
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
              >
                <circle cx="12" cy="12" r="12" fill="#FF9500" />
                <path
                  fill="#fff"
                  d="M12 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 17v.75a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V17a4.5 4.5 0 0 1 4.5-4.5h3A4.5 4.5 0 0 1 18 17Z"
                />
              </svg>
              {user?.nombre} {user?.apellido.slice(0, 1)}.
            </a>
          </button>
          <NavbarPopover id="account">
            <Link href="/account/settings">Mi cuenta</Link>
            <a onClick={logout}>Salir</a>
          </NavbarPopover>
          <button
            className="notifications"
            popoverTarget="notifications"
            style={{ anchorName: notificationsAnchorName }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
            >
              <path
                fill="#FF9500"
                d="M13.7 20h-3.5c-.7 0-1.3.8-.9 1.5.6.9 1.6 1.5 2.7 1.5s2.1-.6 2.6-1.5c.4-.7-.1-1.5-.9-1.5ZM21.8 16.7l-.4-.5C19.8 14.1 19 11.6 19 9v-.7c0-3.6-2.6-6.8-6.2-7.2C8.6.6 5 3.9 5 8v1c0 2.6-.8 5.1-2.4 7.2l-.4.5c-.2.2-.3.6-.2.8.3.9 1.1 1.5 2 1.5h16c.9 0 1.7-.6 1.9-1.5.1-.3 0-.6-.1-.8Z"
              />
            </svg>
            <span className="notifications__count">1</span>
          </button>
          <NavbarPopover id="notifications">
            <div className="notification">
              <div className="notification__pic">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="31"
                  height="31"
                  fill="none"
                >
                  <rect
                    width="30"
                    height="29"
                    fill="#FF9500"
                    rx="14.5"
                    transform="matrix(.99998 -.00315 -.00173 1.00002 .084 1.055)"
                  />
                  <path
                    fill="#FAFAFA"
                    d="M15.061 14.008a3.48 3.48 0 0 1-3.494-3.49 3.52 3.52 0 0 1 3.506-3.51 3.48 3.48 0 0 1 3.494 3.489 3.52 3.52 0 0 1-3.506 3.51ZM8.047 22.28l-.002.875a.87.87 0 0 0 .874.872l12.25-.038a.88.88 0 0 0 .876-.878l.002-.875a5.225 5.225 0 0 0-1.532-3.708 5.224 5.224 0 0 0-3.71-1.526l-3.5.011a5.275 5.275 0 0 0-3.714 1.55 5.276 5.276 0 0 0-1.544 3.717Z"
                  />
                </svg>
              </div>
              <div className="notification__info small">
                <a href="/user/">Ariel Wiznia</a> subió documentos a su perfil
                de usuario.
              </div>
            </div>
            <div className="notification">
              <div className="notification__pic">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="31"
                  height="31"
                  fill="none"
                >
                  <rect
                    width="30"
                    height="29"
                    fill="#FF9500"
                    rx="14.5"
                    transform="matrix(.99998 -.00315 -.00173 1.00002 .084 1.055)"
                  />
                  <path
                    fill="#FAFAFA"
                    d="M15.061 14.008a3.48 3.48 0 0 1-3.494-3.49 3.52 3.52 0 0 1 3.506-3.51 3.48 3.48 0 0 1 3.494 3.489 3.52 3.52 0 0 1-3.506 3.51ZM8.047 22.28l-.002.875a.87.87 0 0 0 .874.872l12.25-.038a.88.88 0 0 0 .876-.878l.002-.875a5.225 5.225 0 0 0-1.532-3.708 5.224 5.224 0 0 0-3.71-1.526l-3.5.011a5.275 5.275 0 0 0-3.714 1.55 5.276 5.276 0 0 0-1.544 3.717Z"
                  />
                </svg>
              </div>
              <div className="notification__info small">
                <a href="/user/">Ariel Wiznia</a> está interesado en tu{' '}
                <a href="/listings/listing">publicación</a>
              </div>
            </div>
          </NavbarPopover>
          {user?.tipo_de_cuenta === 'Dueño' && (
            <Link className="button" href="/account/listings/createListing">
              Publicar
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href="/login">Iniciar sesión</Link>
          <Link className="button" href="/register">
            Registrarse
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="11"
              fill="none"
              className="register"
            >
              <path
                fill="#fff"
                d="M0 5.5c0-.19.079-.371.22-.505a.77.77 0 0 1 .53-.21h8.688l-3.22-3.064a.698.698 0 0 1-.22-.506c0-.19.08-.371.22-.506A.77.77 0 0 1 6.75.5c.2 0 .39.075.531.21l4.5 4.284A.713.713 0 0 1 12 5.5a.685.685 0 0 1-.22.506l-4.5 4.285a.77.77 0 0 1-.53.209.77.77 0 0 1-.532-.21.698.698 0 0 1-.22-.505c0-.19.08-.372.22-.506l3.22-3.065H.75a.77.77 0 0 1-.53-.209A.697.697 0 0 1 0 5.5Z"
              />
            </svg>
          </Link>
        </>
      )}
    </nav>
  );
}

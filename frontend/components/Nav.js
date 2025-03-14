import Link from 'next/link';

export default function Nav() {
  return (
    <nav>
      <Link href="/listings">FAQs</Link>
      <Link href="/login">Iniciar sesión</Link>
      <Link className="button" href="/register">
        Registrarse
      </Link>
    </nav>
  );
}

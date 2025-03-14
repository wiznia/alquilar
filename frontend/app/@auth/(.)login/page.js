import { Modal } from '@/components/Modal';
import Link from 'next/link';

export default function Page() {
  return (
    <Modal>
      <h1>Ingresá a tu cuenta</h1>
      <fieldset>
        <label htmlFor="usuario">Usuario:</label>
        <input
          type="text"
          className="small"
          id="usuario"
          placeholder="Usuario"
          required
        />
      </fieldset>
      <fieldset>
        <label htmlFor="contrasena">Contraseña:</label>
        <input
          type="password"
          className="small"
          id="contrasena"
          placeholder="Contraseña"
          required
        />
      </fieldset>
      <Link href="/forgot">Olvidé mi contraseña</Link>
      <a className="button button--large">Ingresar</a>
    </Modal>
  );
}

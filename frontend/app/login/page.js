import Link from 'next/link';

export default function Login() {
  return (
    <div className="modal-container">
      <h1>Ingresá a tu cuenta</h1>
      <fieldset>
        <label htmlFor="usuario">Usuario:</label>
        <input type="text" name="usuario" placeholder="Usuario" required />
      </fieldset>
      <fieldset>
        <label htmlFor="contrasena">Contraseña:</label>
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          required
        />
      </fieldset>
      <Link href="/forgot">Olvidé mi contraseña</Link>
      <a className="button button--large">Ingresar</a>
    </div>
  );
}

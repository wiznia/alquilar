import { Modal } from '@/components/Modal';

export default function Page() {
  return (
    <Modal>
      <h1>Reseteá tu contraseña</h1>
      <fieldset>
        <label htmlFor="contrasena">Contraseña:</label>
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          required
        />
      </fieldset>
      <fieldset>
        <label htmlFor="repetir-contrasena">Repetir contraseña:</label>
        <input
          type="password"
          name="repetir-contrasena"
          placeholder="Repetir contraseña"
          required
        />
      </fieldset>
      <a className="button button--large">Resetear contraseña</a>
    </Modal>
  );
}

import { Modal } from '@/components/Modal';

export default function Page() {
  return (
    <Modal>
      <h1>Reseteá tu contraseña</h1>
      <p>
        Ingresá tu correo electrónico para que te mandemos un link para resetear
        tu contraseña.
      </p>
      <fieldset>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          className="small"
          id="email"
          placeholder="Email"
          required
        />
      </fieldset>
      <a className="button button--large">
        Mandar link a mi correo electrónico
      </a>
    </Modal>
  );
}

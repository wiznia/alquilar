import { Modal } from '@/components/Modal';

export default function Page() {
  return (
    <Modal>
      <h1>Registrá tu cuenta</h1>
      <fieldset>
        <label htmlFor="tipo_de_cuenta">Tipo de cuenta:</label>
        <select
          className="popover-button small"
          type="text"
          id="tipo_de_cuenta"
          placeholder="Tipo de cuenta"
          required
        >
          <button>
            <selectedcontent></selectedcontent>
            <span className="arrow"></span>
          </button>
          <option value="" hidden>
            <span>Tipo de cuenta</span>
          </option>
          <option>Inquilino</option>
          <option>Dueño</option>
          <option>Escribano</option>
        </select>
      </fieldset>
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
      <fieldset>
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          className="small"
          id="nombre"
          placeholder="Nombre"
          required
        />
      </fieldset>
      <fieldset>
        <label htmlFor="apellido">Apellido:</label>
        <input
          type="text"
          className="small"
          id="apellido"
          placeholder="Apellido"
          required
        />
      </fieldset>
      <fieldset>
        <label htmlFor="condicion_fiscal">Condición fiscal:</label>
        <select
          className="popover-button small"
          type="text"
          id="condicion_fiscal"
          placeholder="Condición fiscal"
          required
        >
          <button>
            <selectedcontent></selectedcontent>
            <span className="arrow"></span>
          </button>
          <option value="" hidden>
            <span>Condición fiscal</span>
          </option>
          <option>Consumidor final</option>
          <option>Monotributista</option>
          <option>Responsable Inscripto</option>
          <option>Exento</option>
        </select>
      </fieldset>
      <fieldset>
        <label htmlFor="DNI">DNI:</label>
        <input
          type="number"
          className="small"
          id="DNI"
          placeholder="DNI"
          required
        />
      </fieldset>
      <fieldset>
        <label htmlFor="telefono">Teléfono:</label>
        <input
          type="tel"
          className="small"
          id="telefono"
          placeholder="Teléfono"
        />
      </fieldset>
      <fieldset>
        <label htmlFor="celular">Celular:</label>
        <input
          type="tel"
          className="small"
          id="celular"
          placeholder="Celular"
        />
      </fieldset>
      <fieldset className="terms">
        <input
          type="checkbox"
          id="terms"
          placeholder="Acepto los términos y condiciones de uso"
        />
        <label htmlFor="terms">
          Acepto los <a href="/">Términos y condiciones de uso</a>
        </label>
      </fieldset>
      <a className="button button--large">Registrarse</a>
    </Modal>
  );
}

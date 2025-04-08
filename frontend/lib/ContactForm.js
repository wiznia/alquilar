import Link from 'next/link';

export default function ContactForm({ contactCard, owner }) {
  return (
    <div className="entry__contact shadow">
      <h5>Contactá con el anunciante:</h5>
      {contactCard && (
        <div className="contact-card shadow">
          <div className="contact-card__profile-pic">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="67"
              height="68"
              fill="none"
            >
              <rect width="67" height="67" y=".5" fill="#FF9500" rx="33.5" />
              <path
                fill="#FAFAFA"
                d="M33.5 32.5a8.292 8.292 0 1 0 0-16.584 8.292 8.292 0 0 0 0 16.584Zm16.916 15.438v2.073c0 .55-.223 1.077-.62 1.466a2.136 2.136 0 0 1-1.495.607H18.698c-.56 0-1.098-.218-1.495-.607a2.053 2.053 0 0 1-.619-1.466v-2.073c0-3.299 1.337-6.462 3.716-8.795a12.817 12.817 0 0 1 8.97-3.643h8.459a12.81 12.81 0 0 1 8.97 3.643 12.316 12.316 0 0 1 3.717 8.795Z"
              />
            </svg>
          </div>
          <div className="contact-card__info">
            <h6>
              {owner?.nombre} {owner?.apellido}
            </h6>
            {(owner?.celular || owner?.telefono) && (
              <>
                <h6>
                  <a
                    href={`tel:${owner?.celular ? owner?.celular : owner?.telefono}`}
                    className="contact-card__phone"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                    >
                      <path
                        fill="#FF9500"
                        d="m19.969 15.117-.909 3.938a1.214 1.214 0 0 1-1.19.946C8.017 20 0 11.984 0 2.129c0-.573.39-1.063.946-1.19L4.884.031A1.226 1.226 0 0 1 6.28.74l1.817 4.238c.213.5.07 1.081-.35 1.424L5.645 8.09a13.659 13.659 0 0 0 6.23 6.23l1.722-2.101c.34-.421.925-.567 1.425-.35l4.238 1.816c.51.268.842.862.709 1.432Z"
                      />
                    </svg>
                    {owner?.celular ? owner?.celular : owner?.telefono}
                  </a>
                </h6>
              </>
            )}
          </div>
          <Link className="button" href={`/user/${owner?.id}`}>
            Ver perfil
          </Link>
        </div>
      )}
      <fieldset>
        <label htmlFor="nombre">Nombre</label>
        <input type="text" placeholder="Nombre" required id="nombre" />
      </fieldset>
      <fieldset>
        <label htmlFor="apellido">Apellido</label>
        <input type="text" placeholder="Apellido" required id="apellido" />
      </fieldset>
      <fieldset>
        <label htmlFor="email">Email</label>
        <input type="email" placeholder="Email" required id="email" />
      </fieldset>
      <fieldset>
        <label htmlFor="asunto">Asunto</label>
        <textarea placeholder="Asunto" id="asunto" required></textarea>
      </fieldset>
      <div className="button-container">
        <button className="button button--secondary">
          Ver disponibilidad horaria
        </button>
        <button className="button">Enviar</button>
      </div>
    </div>
  );
}

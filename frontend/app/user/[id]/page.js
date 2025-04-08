'use client';

import Loading from '@/components/Loading';
import { GET_USER_BY_ID } from '@/components/queries/queries';
import Rating from '@/components/Rating';
import ContactForm from '@/lib/ContactForm';
import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';

export default function Id() {
  const params = useParams();
  const { id } = params;
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: {
      id,
    },
  });
  const {
    nombre,
    apellido,
    celular,
    telefono,
    tipo_de_cuenta,
    email,
    ratings,
  } = data?.getUser || {};

  if (loading) {
    return (
      <Loading>
        <h4>Cargando perfil...</h4>
      </Loading>
    );
  }
  if (error) {
    return (
      <div className="loading">
        <p>
          Hubo un problema al cargar el listado de publicaciones:
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="user-profile-header">
        <div className="user-profile-header__pic">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="250"
            height="250"
            fill="none"
          >
            <rect width="250" height="250" fill="#FF9500" rx="125" />
            <path
              fill="#FAFAFA"
              d="M125 123.5c18.778 0 34-15.222 34-34s-15.222-34-34-34-34 15.222-34 34 15.222 34 34 34ZM194 177.5v8.5a8.44 8.44 0 0 1-2.526 6.01 8.693 8.693 0 0 1-6.099 2.49H64.625a8.69 8.69 0 0 1-6.099-2.49A8.438 8.438 0 0 1 56 186v-8.5c0-13.526 5.452-26.498 15.157-36.062 9.705-9.565 22.868-14.938 36.593-14.938h34.5c13.725 0 26.888 5.373 36.593 14.938C188.548 151.002 194 163.974 194 177.5Z"
            />
          </svg>
        </div>
        <div className="user-profile-header__info">
          <h1>
            {nombre} {apellido}
          </h1>
          <div className="user-profile-header__info-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="none"
            >
              <path
                fill="#FF9500"
                d="m29.953 22.676-1.362 5.906a1.821 1.821 0 0 1-1.785 1.42C12.023 30 0 17.976 0 3.192A1.82 1.82 0 0 1 1.42 1.41L7.324.047c.86-.2 1.74.247 2.097 1.062l2.726 6.357a1.834 1.834 0 0 1-.527 2.136l-3.154 2.533a20.488 20.488 0 0 0 9.345 9.346l2.583-3.153a1.823 1.823 0 0 1 2.137-.526l6.358 2.726c.764.402 1.262 1.292 1.063 2.148Z"
              />
            </svg>
            <h3>
              <a href={`tel:${celular || telefono}`}>{celular || telefono}</a>
            </h3>
          </div>
          <div className="user-profile-header__info-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="24"
              fill="none"
            >
              <path fill="#FF9500" d="M0 4v20h32V4L16 14 0 4Z" />
              <path fill="#FF9500" d="m0 2 16 10L32 2V0H0v2Z" />
            </svg>
            <h3>
              <a href={`mailto:${email}`}>{email}</a>
            </h3>
          </div>
          <div className="badge">{tipo_de_cuenta}</div>
        </div>
      </div>
      <div className="user-profile-content">
        <div className="user-profile-content__left">
          <Rating ratings={ratings} />
          <ContactForm />
        </div>
        <div className="user-profile-content__right"></div>
      </div>
    </>
  );
}

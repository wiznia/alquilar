'use client';

import Loading from '@/components/Loading';
import { GET_USER_BY_ID } from '@/components/queries/queries';
import Rating from '@/components/Rating';
import Related from '@/components/Related';
import ContactForm from '@/components/ContactForm';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function Id() {
  const { user } = useAuth();
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
  const owner = {
    id,
  };

  const buildStars = (rating) => {
    return (
      <div className="rating-stars">
        {Array.from({ length: 5 }, (_, index) =>
          index < rating ? (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
            >
              <path
                fill="#F1C40F"
                d="m4.802 4.632-4.39.486a.42.42 0 0 0-.35.286c-.053.161 0 .329.116.434C1.483 7.03 3.444 8.813 3.444 8.813c-.002 0-.538 2.594-.895 4.324a.414.414 0 0 0 .612.445c1.536-.873 3.838-2.186 3.838-2.186l3.837 2.187a.42.42 0 0 0 .45-.024.417.417 0 0 0 .163-.42l-.893-4.326 3.266-2.972a.416.416 0 0 0-.233-.72c-1.757-.198-4.39-.49-4.39-.49S8.105 2.218 7.378.608a.416.416 0 0 0-.758 0L4.802 4.632Z"
              />
            </svg>
          ) : (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
            >
              <path
                fill="#BEBEBE"
                d="m4.802 4.632-4.39.486a.42.42 0 0 0-.35.286c-.053.161 0 .329.116.434C1.483 7.03 3.444 8.813 3.444 8.813c-.002 0-.538 2.594-.895 4.324a.414.414 0 0 0 .612.445c1.536-.873 3.838-2.186 3.838-2.186l3.837 2.187a.42.42 0 0 0 .45-.024.417.417 0 0 0 .163-.42l-.893-4.326 3.266-2.972a.416.416 0 0 0-.233-.72c-1.757-.198-4.39-.49-4.39-.49S8.105 2.218 7.378.608a.416.416 0 0 0-.758 0L4.802 4.632Z"
              />
            </svg>
          ),
        )}
      </div>
    );
  };

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
          {telefono && (
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
                <a href={`tel:${telefono}`}>{telefono}</a>
              </h3>
            </div>
          )}
          {celular && (
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
                <a href={`tel:${celular}`}>{celular}</a>
              </h3>
            </div>
          )}
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
          {ratings.length > 0 && <Rating ratings={ratings} />}
          {user?.id !== id && (
            <ContactForm tipoDeCuenta={tipo_de_cuenta} id={id} email={email} />
          )}
        </div>
        <div className="user-profile-content__right">
          {ratings?.length > 0 && (
            <>
              <h6>{ratings.length} opiniones</h6>
              {ratings.map((rating, i) => {
                return (
                  <div key={i} className="rating-item">
                    <div className="rating-item__profile-pic">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="67"
                        height="67"
                        fill="none"
                      >
                        <rect width="67" height="67" fill="#FF9500" rx="33.5" />
                        <path
                          fill="#FAFAFA"
                          d="M33.5 32a8.292 8.292 0 1 0 0-16.584A8.292 8.292 0 0 0 33.5 32ZM50.416 47.438v2.073c0 .55-.223 1.077-.62 1.466a2.136 2.136 0 0 1-1.495.607H18.698c-.56 0-1.098-.218-1.495-.607a2.053 2.053 0 0 1-.619-1.466v-2.073c0-3.299 1.337-6.462 3.716-8.795A12.817 12.817 0 0 1 29.27 35h8.459c3.365 0 6.592 1.31 8.97 3.643a12.316 12.316 0 0 1 3.717 8.795Z"
                        />
                      </svg>
                    </div>
                    <div className="rating-item__info">
                      <h6>
                        <Link href={`/user/${rating.user.id}`}>
                          {rating.user.nombre} {rating.user.apellido}
                        </Link>
                      </h6>
                      {buildStars(rating.rating)}
                      <p>{rating.message}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <Related owner={owner} />
    </>
  );
}

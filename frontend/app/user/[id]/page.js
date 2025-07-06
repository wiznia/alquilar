'use client';

import Loading from '@/components/Loading';
import { GET_USER_BY_ID, REPLY_RATING } from '@/components/queries/queries';
import Rating from '@/components/Rating';
import Related from '@/components/Related';
import ContactForm from '@/components/ContactForm';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useState } from 'react';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { useToast } from '@/components/ToastContext';
import Icon from '@/components/Icon';
import Gravatar from 'react-gravatar';

export default function Id() {
  const { user } = useAuth();
  const showToast = useToast();
  const params = useParams();
  const { id } = params;
  const [activeReplyIndex, setActiveReplyIndex] = useState(null);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: {
      id,
    },
  });
  const [replyRating] = useMutation(REPLY_RATING);
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
  const { form, setForm, errors, handleChange, validateFormCheck } =
    useFormValidation(
      {
        ...data?.getUser,
        message: '',
      },
      'replyReview',
    );
  const handleReply = (index, e) => {
    e.preventDefault();
    setActiveReplyIndex(index);
  };

  const handleReplyRating = async (ratingId) => {
    if (!validateFormCheck(undefined, 'replyRating')) {
      return;
    }

    setIsLoadingReply(true);

    try {
      await replyRating({
        variables: {
          senderId: id,
          receiverId: ratingId,
          message: form?.ratingReply,
        },
      });
      setIsLoadingReply(false);
      showToast('Respuesta enviada!');
      setActiveReplyIndex(null);
    } catch (error) {
      console.error('Error respondiendo a la review:', error.message);
      showToast(
        `Hubo un error al tratar de responderle al usuario: ${error}`,
        'error',
      );
      setIsLoadingReply(false);
    }
  };

  const buildStars = (rating) => {
    return (
      <div className="rating-stars">
        {Array.from({ length: 5 }, (_, index) =>
          index < rating ? (
            <Icon name="starFilled" key={index} />
          ) : (
            <Icon name="star" key={index} />
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
          {user ? (
            <Gravatar email={user?.email} className="gravatar" size={250} />
          ) : (
            <Icon name="user" />
          )}
        </div>
        <div className="user-profile-header__info">
          <h1>
            {nombre} {apellido}
          </h1>
          {telefono && (
            <div className="user-profile-header__info-item">
              <Icon name="phone" />
              <h3>
                <a href={`tel:${telefono}`}>{telefono}</a>
              </h3>
            </div>
          )}
          {celular && (
            <div className="user-profile-header__info-item">
              <Icon name="phone" />
              <h3>
                <a href={`tel:${celular}`}>{celular}</a>
              </h3>
            </div>
          )}
          <div className="user-profile-header__info-item">
            <Icon name="mail" />
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
              <h6>
                {ratings.length}{' '}
                {ratings.length === 1 ? 'opinión' : 'opiniones'}
              </h6>
              {ratings.map((rating, i) => {
                const ownerReply = rating.replies.find(
                  (reply) => reply.user.id === user?.id,
                );
                return (
                  <div key={i} className="rating-item">
                    <div className="rating-item__profile-pic">
                      {user ? (
                        <Gravatar
                          email={user?.email}
                          className="gravatar"
                          size={67}
                        />
                      ) : (
                        <Icon name="user" />
                      )}
                    </div>
                    <div className="rating-item__info">
                      <h6>
                        <Link href={`/user/${rating.user.id}`}>
                          {rating.user.nombre} {rating.user.apellido}
                        </Link>
                      </h6>
                      {buildStars(rating.rating)}
                      <h6>{rating.message}</h6>
                      {user?.id === id && !ownerReply && (
                        <Link
                          className="small"
                          href=""
                          onClick={(e) => handleReply(i, e)}
                        >
                          Responder
                        </Link>
                      )}
                      {activeReplyIndex === i && (
                        <>
                          <fieldset>
                            <textarea
                              name="ratingReply"
                              required
                              placeholder="Tu respuesta"
                              onChange={handleChange}
                            ></textarea>
                          </fieldset>
                          <div className="button-container">
                            <button
                              className="button"
                              onClick={() =>
                                handleReplyRating(rating?.user?.id)
                              }
                            >
                              {isLoadingReply ? (
                                <span className="loader"></span>
                              ) : (
                                <span>Responder</span>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                      {rating.replies.map((reply) => {
                        return (
                          <div className="rating-reply" key={reply.user}>
                            <h6>
                              <strong>Respuesta del dueño:</strong>
                            </h6>
                            <h6>{reply.message}</h6>
                          </div>
                        );
                      })}
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

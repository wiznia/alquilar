import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { SEND_EMAIL, SEND_MESSAGE } from '../components/queries/queries';
import { useAuth } from '../components/AuthContext';
import { useRef, useState } from 'react';
import { useToast } from './ToastContext';
import Icon from './Icon';

export default function ContactForm({
  contactCard,
  owner,
  tipoDeCuenta,
  id,
  email,
  listingId,
}) {
  const formRef = useRef(null);
  const accountType = `${tipoDeCuenta.charAt(0).toLowerCase()}${tipoDeCuenta.slice(1)}`;
  const { user } = useAuth();
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [sendEmail] = useMutation(SEND_EMAIL);
  const [isSentForm, setIsSentForm] = useState(false);
  const initialState = {
    nombre: '',
    apellido: '',
    email: '',
    asunto: '',
  };
  const { form, errors, handleChange, validateFormCheck } = useFormValidation(
    initialState,
    'sendMessage',
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormCheck()) return;

    const receiverId = id;

    if (user) {
      const senderId = user.id;

      try {
        const { data } = await sendMessage({
          variables: { ...form, receiverId, senderId },
        });
        setIsLoading(true);

        if (data?.sendMessage) {
          setIsSentForm(true);
          setIsLoading(false);
          showToast('Mensaje enviado con éxito!');
          formRef.current.reset();
          if (formRef.current) formRef.current.value = '';
        }
      } catch (error) {
        setIsLoading(false);
        showToast(`Hubo un error al enviar el mensaje ${error}`);
        console.error('Error sending message:', error);
      }
    } else {
      const receiverEmail = email;

      try {
        const { data } = await sendEmail({
          variables: { ...form, receiverEmail, listingId },
        });
        setIsLoading(true);

        if (data?.sendEmail) {
          setIsSentForm(true);
          setIsLoading(false);
          showToast('Mensaje enviado con éxito!');
          formRef.current.reset();
          if (formRef.current) formRef.current.value = '';
        }
      } catch (error) {
        setIsLoading(false);
        showToast(`Hubo un error al enviar el mensaje ${error}`, 'error');
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="entry__contact shadow">
      <h5>Contactá con el {accountType}:</h5>
      {contactCard && (
        <div className="contact-card shadow">
          <div className="contact-card__profile-pic">
            <Icon name="user" />
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
                    <Icon name="contactPhone" />
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
      <form onSubmit={handleSubmit} ref={formRef}>
        <>
          {!user && (
            <>
              <fieldset>
                <label htmlFor="nombre">Nombre:</label>
                <input
                  type="text"
                  placeholder="Nombre"
                  required
                  id="nombre"
                  name="nombre"
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset>
                <label htmlFor="apellido">Apellido:</label>
                <input
                  type="text"
                  placeholder="Apellido"
                  required
                  id="apellido"
                  name="apellido"
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  id="email"
                  name="email"
                  onChange={handleChange}
                />
              </fieldset>
            </>
          )}
          <fieldset>
            <label htmlFor="asunto">Asunto:</label>
            <textarea
              placeholder="Asunto"
              id="asunto"
              name="asunto"
              required
              onChange={handleChange}
            ></textarea>
          </fieldset>
          {errors.asunto && (
            <small className="text-danger">{errors.asunto}</small>
          )}
          <div className="button-container">
            <button className="button">
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <span>Enviar</span>
              )}
            </button>
          </div>
        </>
      </form>
    </div>
  );
}

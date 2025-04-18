'use client';

import {
  GET_MESSAGES_BY_USER,
  MARK_MESSAGES_AS_READ,
  SEND_MESSAGE,
} from '@/components/queries/queries';
import { useAuth } from '@/components/AuthContext';
import { useMutation, useQuery } from '@apollo/client';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import Loading from './Loading';
import { useState, useRef } from 'react';

export default function Messages() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const { data, loading, error, refetch } = useQuery(GET_MESSAGES_BY_USER, {
    variables: {
      receiverId: user?.id,
    },
    skip: !user?.id,
  });
  const [openMessage, setOpenMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);
  const initialState = {
    asunto: '',
  };
  const { form, errors, handleChange, validateFormCheck, setErrors } =
    useFormValidation(initialState, 'sendMessage');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormCheck()) return;

    const receiverId = openMessage?.sender?.id;
    const senderId = user?.id;

    try {
      setIsLoading(true);

      const { data } = await sendMessage({
        variables: { ...form, receiverId, senderId },
      });

      if (data?.sendMessage) {
        form.asunto = '';
        if (inputRef.current) inputRef.current.value = '';

        await refetch();

        const updatedConversation = data?.getMessages.find(
          (conv) => conv.conversationId === openMessage.conversationId,
        );

        if (updatedConversation) {
          setOpenMessage(updatedConversation);
        }
      }
      setIsLoading(false);
      await refetch();
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
    }
  };

  function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(parseInt(dateString));
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
      });
    } else if (isYesterday) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  }

  const openConversation = (messageSender) => {
    setOpenMessage(messageSender);

    const unreadMessageIds = messageSender.messages
      .filter((msg) => msg.isUnread)
      .map((msg) => msg.messageId);

    if (unreadMessageIds.length > 0) {
      markMessagesAsRead({
        variables: { messageIds: unreadMessageIds },
        optimisticResponse: {
          markMessagesAsRead: unreadMessageIds.map((messageId) => ({
            messageId,
            isUnread: false,
            __typename: 'SingleMessage',
          })),
        },
      });
    }
  };

  if (loading) {
    return (
      <Loading>
        <h4>Cargando mensajes...</h4>
      </Loading>
    );
  }

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="messages shadow">
      <div className="messages__inbox">
        {data?.getMessages.map((messageSender) => {
          const lastMessage = messageSender.messages.at(-1);
          const isUnread = messageSender.messages.some(
            (msg) => msg.isUnread === true,
          );
          const isActive =
            openMessage?.conversationId === messageSender.conversationId;

          return (
            <div
              key={messageSender.conversationId}
              onClick={() => openConversation(messageSender)}
              className={`messages__item ${isUnread ? 'messages__item--unread' : ''} ${isActive ? 'messages__item--active' : ''}`}
            >
              <div className="messages__item-profile-pic">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="67"
                  height="68"
                  fill="none"
                >
                  <rect
                    width="67"
                    height="67"
                    y=".5"
                    fill="#FF9500"
                    rx="33.5"
                  />
                  <path
                    fill="#FAFAFA"
                    d="M33.5 32.5a8.292 8.292 0 1 0 0-16.584 8.292 8.292 0 0 0 0 16.584Zm16.916 15.438v2.073c0 .55-.223 1.077-.62 1.466a2.136 2.136 0 0 1-1.495.607H18.698c-.56 0-1.098-.218-1.495-.607a2.053 2.053 0 0 1-.619-1.466v-2.073c0-3.299 1.337-6.462 3.716-8.795a12.817 12.817 0 0 1 8.97-3.643h8.459a12.81 12.81 0 0 1 8.97 3.643 12.316 12.316 0 0 1 3.717 8.795Z"
                  />
                </svg>
              </div>
              <div className="messages__item-info">
                <h6>
                  {messageSender.sender
                    ? `${messageSender.sender.nombre} ${messageSender.sender.apellido}`
                    : `${messageSender.nombre} ${messageSender.apellido}`}
                </h6>
                <p>{lastMessage?.asunto}</p>
              </div>
              <small>{formatDateTime(lastMessage?.createdAt)}</small>
            </div>
          );
        })}
      </div>
      <div className="messages__area shadow">
        {openMessage ? (
          <>
            <div className="messages__item">
              <div className="messages__item-profile-pic">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="67"
                  height="68"
                  fill="none"
                >
                  <rect
                    width="67"
                    height="67"
                    y=".5"
                    fill="#FF9500"
                    rx="33.5"
                  />
                  <path
                    fill="#FAFAFA"
                    d="M33.5 32.5a8.292 8.292 0 1 0 0-16.584 8.292 8.292 0 0 0 0 16.584Zm16.916 15.438v2.073c0 .55-.223 1.077-.62 1.466a2.136 2.136 0 0 1-1.495.607H18.698c-.56 0-1.098-.218-1.495-.607a2.053 2.053 0 0 1-.619-1.466v-2.073c0-3.299 1.337-6.462 3.716-8.795a12.817 12.817 0 0 1 8.97-3.643h8.459a12.81 12.81 0 0 1 8.97 3.643 12.316 12.316 0 0 1 3.717 8.795Z"
                  />
                </svg>
              </div>
              <div className="messages__item-info">
                {openMessage.sender
                  ? `${openMessage.sender.nombre} ${openMessage.sender.apellido}`
                  : `${openMessage.nombre} ${openMessage.apellido}`}
                <p>Online</p>
              </div>
            </div>
            <div className="messages__conversation">
              {openMessage.messages.map((msg) => (
                <div
                  key={msg.messageId}
                  className="messages__conversation-container"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="34"
                    fill="none"
                  >
                    <rect width="34" height="34" fill="#FF9500" rx="17" />
                    <path
                      fill="#FAFAFA"
                      d="M17 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM26 24v1c0 .265-.119.52-.33.707a1.2 1.2 0 0 1-.795.293H9.125a1.2 1.2 0 0 1-.795-.293A.947.947 0 0 1 8 25v-1c0-1.591.711-3.117 1.977-4.243C11.243 18.632 12.96 18 14.75 18h4.5c1.79 0 3.507.632 4.773 1.757C25.289 20.883 26 22.41 26 24Z"
                    />
                  </svg>
                  <div className="messages__bubble shadow">
                    <p>{msg.asunto}</p>
                    <small>{formatDateTime(msg.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="messages__footer">
              <form
                onSubmit={handleSubmit}
                type="submit"
                className="send-message"
              >
                <div className="search-container">
                  <input
                    ref={inputRef}
                    type="text"
                    className="p"
                    name="asunto"
                    placeholder="Escribí tu mensaje"
                    required
                    onChange={handleChange}
                  />
                </div>
                <button type="submit">
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      fill="none"
                    >
                      <path
                        fill="#fff"
                        fillRule="evenodd"
                        d="M26.89 3.638c.54-1.616-1.058-3.123-2.639-2.49l-.493.196L2.055 8.092c-1.28.398-1.435 2.144-.247 2.762l10.005 5.2c.032.017.065.033.098.047.014.033.03.065.046.097l5.206 9.995c.618 1.188 2.366 1.032 2.764-.246l6.73-21.612.234-.697ZM4.274 9.496a.2.2 0 0 0-.033.369l8.041 4.18a.2.2 0 0 0 .234-.037l9.706-9.697c.147-.148-.002-.394-.201-.332L4.273 9.496Zm14.248 14.235a.2.2 0 0 1-.368.033l-4.184-8.034a.2.2 0 0 1 .037-.234L23.712 5.8c.147-.148.394.001.332.2l-5.523 17.732Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div>Dale</div>
        )}
      </div>
    </div>
  );
}

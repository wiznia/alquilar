'use client';

import {
  GET_MESSAGES_BY_USER,
  MARK_MESSAGES_AS_READ,
  SEND_MESSAGE,
  NEW_MESSAGE_SUBSCRIPTION,
} from '@/components/queries/queries';
import { useAuth } from '@/components/AuthContext';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import Loading from './Loading';
import { useState, useRef, useEffect } from 'react';
import formatDateTime from '@/lib/formatDateTime';
import Link from 'next/link';
import Icon from './Icon';
import Gravatar from 'react-gravatar';

export default function Messages() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { data, loading, error, refetch } = useQuery(GET_MESSAGES_BY_USER, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id,
  });

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    skip: !user?.id,
    onData: ({ data }) => {
      const newMessage = data.data?.newMessage;
      if (!newMessage) return;

      if (openConversation?.conversationId === newMessage.conversationId) {
        setOpenConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, newMessage],
        }));
      }

      refetch();
    },
  });

  const [openConversation, setOpenConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);
  const initialState = {
    asunto: '',
  };
  const { form, errors, handleChange, validateFormCheck, setErrors } =
    useFormValidation(initialState, 'sendMessage');

  const handleOpenMessage = (conversation) => {
    setOpenConversation(conversation);

    const unreadMessageIds = conversation.messages
      .filter(
        (msg) => !msg.readBy.includes(user.id) && msg.senderId !== user.id,
      )
      .map((msg) => msg.messageId);

    if (unreadMessageIds.length > 0) {
      markMessagesAsRead({
        variables: { messageIds: unreadMessageIds },
        onCompleted: () => {
          refetch();
        },
      });
    }
  };

  const handleReply = async (e, conversation) => {
    e.preventDefault();
    if (!validateFormCheck()) return;

    const receiverId =
      conversation?.sender?.id === user?.id
        ? conversation?.receiver?.id
        : conversation?.sender?.id;
    const senderId = user?.id;

    try {
      setIsLoading(true);

      const { data } = await sendMessage({
        variables: {
          ...form,
          receiverId,
          senderId,
          conversationId: conversation.conversationId,
        },
      });

      if (data?.sendMessage) {
        form.asunto = '';
        if (inputRef.current) inputRef.current.value = '';
      }
      setIsLoading(false);
      await refetch();
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
    }
  };

  const handleWriteMessage = (conversation) => {
    handleOpenMessage(conversation);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [openConversation?.messages?.length]);

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
        {data?.getMessages.map((conversation) => {
          const lastMessage = conversation.messages.at(-1);
          const isUnread = conversation.messages.some((msg) => {
            return !msg.readBy.includes(user.id) && msg.senderId !== user.id;
          });
          const isActive =
            openConversation?.conversationId === conversation.conversationId;

          return (
            <div
              key={conversation.conversationId}
              onClick={() => handleOpenMessage(conversation)}
              className={`messages__item ${isUnread ? 'messages__item--unread' : ''} ${isActive ? 'messages__item--active' : ''}`}
            >
              <div className="messages__item-profile-pic">
                <Gravatar
                  className="gravatar"
                  email={conversation?.sender?.email}
                  size={60}
                />
              </div>
              <div className="messages__item-info">
                <h6>
                  {conversation.sender.id === user?.id
                    ? `${conversation.receiver.nombre} ${conversation.receiver.apellido}`
                    : `${conversation.sender.nombre} ${conversation.sender.apellido}`}
                </h6>
                <p>{lastMessage?.asunto}</p>
              </div>
              <small>{formatDateTime(lastMessage?.createdAt)}</small>
            </div>
          );
        })}
      </div>
      <div className="messages__area shadow">
        {openConversation ? (
          <>
            <div className="messages__item">
              <Icon
                onClick={() => setOpenConversation(null)}
                name="arrowGalleryLeft"
              />
              <div className="messages__item-profile-pic">
                <Gravatar
                  className="gravatar"
                  email={openConversation?.sender.email}
                />
              </div>
              <div className="messages__item-info">
                <Link
                  href={`/user/${openConversation.sender.id !== user?.id ? openConversation.sender.id : openConversation.receiver.id}`}
                >
                  <h6>
                    {openConversation.sender.id === user?.id
                      ? `${openConversation.receiver.nombre} ${openConversation.receiver.apellido}`
                      : `${openConversation.sender.nombre} ${openConversation.sender.apellido}`}
                  </h6>
                  <p>Online</p>
                </Link>
              </div>
            </div>
            <div className="messages__conversation" ref={messagesEndRef}>
              {openConversation.messages.map((msg, index) => {
                const otherUserId =
                  msg.senderId === user?.id
                    ? openConversation.sender.id === user?.id
                      ? openConversation.receiver.id
                      : openConversation.sender.id
                    : user?.id;

                return (
                  <div
                    key={`${msg.messageId}-${index}`}
                    className={`messages__conversation-container ${msg.senderId === user?.id ? 'messages__conversation-owner' : ''}`}
                  >
                    <Link
                      href={
                        msg.senderId !== user?.id
                          ? `/user/${openConversation.sender.id}`
                          : `/user/${openConversation.receiver.id}`
                      }
                    >
                      <Gravatar
                        className="gravatar"
                        email={
                          msg?.senderId !== user?.id
                            ? openConversation?.sender?.email
                            : user?.id
                        }
                      />
                    </Link>
                    <div className="messages__bubble shadow">
                      <p>{msg.asunto}</p>
                      <small>{formatDateTime(msg.createdAt)}</small>
                    </div>
                    <small>
                      {msg.senderId === user?.id &&
                        msg.readBy?.includes(otherUserId) && (
                          <Icon name="messageRead" />
                        )}
                    </small>
                  </div>
                );
              })}
            </div>
            <div className="messages__footer">
              <form
                type="submit"
                className="send-message"
                onSubmit={(e) => handleReply(e, openConversation)}
                action=""
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
                    onClick={() => handleWriteMessage(openConversation)}
                  />
                </div>
                <button type="submit">
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <Icon name="sendMessage" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="messages__area--default">
            <p>
              Esta es tu área de mensajes. Clickeá en el que quieras para abrir
              la conversación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

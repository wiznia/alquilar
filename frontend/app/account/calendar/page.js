'use client';

import { useFormValidation } from '@/app/hooks/useFormValidation';
import AccountSidebar from '@/components/AccountSidebar';
import {
  GET_TENANT_USER,
  SET_CALENDAR_EVENT,
  GET_CALENDAR_EVENTS_BY_MONTH,
  GET_CALENDAR_EVENTS_BY_INVITEE,
  DELETE_CALENDAR_EVENT,
  GET_LISTINGS_BY_OWNER,
} from '@/components/queries/queries';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import throttle from '@/lib/throttle';
import Loading from '@/components/Loading';
import Link from 'next/link';
import Select from '@/components/Select';
import { useToast } from '@/components/ToastContext';
import Icon from '@/components/Icon';

export default function Calendar() {
  const { user } = useAuth();
  const showToast = useToast();
  const isOwner = user?.tipo_de_cuenta === 'Dueño';
  const formRef = useRef(null);
  const dialogRef = useRef(null);
  const daysOfWeek = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const monthsOfYear = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const currentDate = new Date();
  const initialState = {
    titulo: '',
    asunto: '',
    time: '',
    invite: [],
    listings: '',
  };

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [invite, setInvite] = useState([]);
  const [inviteName, setInviteName] = useState('');
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyEvents, setMonthlyEvents] = useState([]);
  const [dateEvents, setDateEvents] = useState([]);
  const [eventsCountByDay, setEventsCountByDay] = useState({});

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthTwoDecimals = (currentMonth + 1).toString().padStart(2, '0');
  const { form, setForm, errors, handleChange, validateFormCheck } =
    useFormValidation(initialState, 'setEvent');
  const nextMonthTwoDecimals =
    monthTwoDecimals === '12' ? '01' : monthTwoDecimals + 1;

  const [setCalendarEvent] = useMutation(SET_CALENDAR_EVENT);
  const [deleteCalendarEvent] = useMutation(DELETE_CALENDAR_EVENT);
  const [
    findTenants,
    { data: tenantData, loading: tenantLoading, error: tenantError },
  ] = useLazyQuery(GET_TENANT_USER);
  const ownerEventsQuery = useQuery(GET_CALENDAR_EVENTS_BY_MONTH, {
    variables: {
      senderId: user?.id,
      createdAt_min: `${currentYear}-${monthTwoDecimals}-01`,
      createdAt_max: `${currentYear}-${nextMonthTwoDecimals}-01`,
    },
    skip: !user?.id || !isOwner,
  });
  const receiverEventsQuery = useQuery(GET_CALENDAR_EVENTS_BY_INVITEE, {
    variables: {
      receiverId: user?.id,
      createdAt_min: `${currentYear}-${monthTwoDecimals}-01`,
      createdAt_max: `${currentYear}-${nextMonthTwoDecimals}-01`,
    },
    skip: !user?.id || isOwner,
  });
  const {
    data: ownerListingsData,
    loading: ownerListingsLoading,
    error: ownerListingsError,
  } = useQuery(GET_LISTINGS_BY_OWNER, {
    variables: {
      id: user?.id,
    },
    skip: !dialogRef?.current,
  });

  const data = isOwner
    ? ownerEventsQuery.data?.getCalendarEvents
    : receiverEventsQuery.data?.getCalendarEventsByInvitee;
  const loading = isOwner
    ? ownerEventsQuery.loading
    : receiverEventsQuery.loading;
  const error = isOwner ? ownerEventsQuery.error : receiverEventsQuery.error;
  const refetch = isOwner
    ? ownerEventsQuery.refetch
    : receiverEventsQuery.refetch;

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear((prevYear) =>
      currentMonth === 0 ? prevYear - 1 : prevYear,
    );
    setMonthlyEvents([]);
    setDateEvents([]);
    dialogRef?.current.close();
    refetch();
  };

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) =>
      currentMonth === 11 ? prevYear + 1 : prevYear,
    );
    setMonthlyEvents([]);
    setDateEvents([]);
    dialogRef?.current.close();
    refetch();
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);

    setSelectedDate(clickedDate);

    const eventsForDate = monthlyEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === clickedDate.getFullYear() &&
        eventDate.getMonth() === clickedDate.getMonth() &&
        eventDate.getDate() === clickedDate.getDate()
      );
    });

    setDateEvents(eventsForDate);
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormCheck()) return;

    try {
      setIsLoading(true);

      const { data } = await setCalendarEvent({
        variables: {
          ...form,
          date: selectedDate.toISOString(),
          senderId: user?.id,
          receiverId: invite,
        },
      });

      if (data?.setCalendarEvent) {
        setIsLoading(false);
        dialogRef?.current.close();
        setInvite([]);
        setInviteName('');
        if (formRef.current) {
          formRef.current.reset();
        }
        showToast('Evento agregado con éxito!');
        refetch();
      }
    } catch (error) {
      setIsLoading(false);
      showToast(
        `Hubo un error al agregar un evento al calendario: ${error}`,
        'error',
      );
      console.error('Error creando el evento de calendario:', error);
    }
  };

  const handleInvite = (tenant) => {
    const fullName = `${tenant.nombre} ${tenant.apellido}`;
    setSearchIsActive(false);

    if (!invite.includes(tenant.id)) {
      const updatedInvite = [...invite, tenant.id];

      setInvite(updatedInvite);
      setInviteName((prevName) => [...prevName, fullName]);
      setForm((prevForm) => ({
        ...prevForm,
        invite: updatedInvite,
      }));
    }
  };

  const handleRemoveInvite = (user) => {
    const userIndex = inviteName.indexOf(user);

    if (userIndex !== -1) {
      setInvite((prevUser) =>
        prevUser.filter((_, index) => index !== userIndex),
      );

      setInviteName((prevName) =>
        prevName.filter((_, index) => index !== userIndex),
      );
    }
  };

  const throttledFindTenants = useCallback(
    throttle((variables) => {
      findTenants({ variables });
    }, 2000),
    [findTenants],
  );

  const handleDayClasses = (day) => {
    const classes = [];

    monthlyEvents.forEach((event) => {
      const eventDate = new Date(event.date).getDate() - 1;

      if (eventDate === day) {
        classes.push('calendar__day--event');
      }
    });

    if (
      day + 1 === currentDate.getDate() &&
      currentMonth === currentDate.getMonth() &&
      currentYear === currentDate.getFullYear()
    ) {
      classes.push('calendar__day--current');
    }

    if (
      selectedDate.getDate() === day + 1 &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    ) {
      classes.push('calendar__day--selected');
    }

    return classes.join(' ');
  };

  const handleOpenEventDialog = () => {
    dialogRef.current?.showModal();
  };

  const handleDeleteEvent = async (eventId) => {
    await deleteCalendarEvent({
      variables: {
        eventId,
      },
    });
    refetch();
  };

  useEffect(() => {
    if (data) {
      setMonthlyEvents(data);

      const counts = {};
      data.forEach((event) => {
        const date = new Date(event.date);
        const day = date.getDate();
        counts[day] = (counts[day] || 0) + 1;
      });
      setEventsCountByDay(counts);
    }
  }, [data]);

  useEffect(() => {
    if (selectedDate && monthlyEvents.length > 0) {
      const eventsForDate = monthlyEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        );
      });
      setDateEvents(eventsForDate);
    } else {
      setDateEvents([]);
    }
  }, [monthlyEvents, selectedDate]);

  return (
    <div className="account">
      <AccountSidebar />
      <div className="calendar">
        <div className="calendar-container">
          <div className="calendar__inner">
            <div className="calendar__header">
              <h4>
                {monthsOfYear[currentMonth]} {currentYear}
              </h4>
              <div className="calendar__nav">
                <button onClick={prevMonth}>
                  <Icon name="arrowLeftCalendar" />
                </button>
                <button onClick={nextMonth}>
                  <Icon name="arrowRightCalendar" />
                </button>
              </div>
            </div>
            <div className="calendar__content">
              <div className="calendar__weekdays">
                {daysOfWeek.map((day) => (
                  <label key={day}>{day}</label>
                ))}
              </div>
              <div className="calendar__days">
                {[...Array(firstDayOfMonth).keys()].map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}
                {[...Array(daysInMonth).keys()].map((day) => (
                  <span
                    key={day + 1}
                    className={handleDayClasses(day)}
                    onClick={() => handleDayClick(day + 1)}
                  >
                    {day + 1}
                    {eventsCountByDay[day + 1] && (
                      <div className="calendar__event-count">
                        {eventsCountByDay[day + 1]}
                      </div>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {user?.tipo_de_cuenta === 'Dueño' && (
            <dialog className="calendar-form shadow" ref={dialogRef}>
              <form onSubmit={handleSubmit} ref={formRef}>
                <button
                  className="close"
                  type="button"
                  onClick={() => {
                    dialogRef?.current.close();
                    formRef.current.reset();
                  }}
                >
                  &times;
                </button>
                <div className="calendar-event">
                  <h5>
                    Agregar evento el{' '}
                    {`${selectedDate.getDate()} de ${monthsOfYear[currentMonth]}`}
                    :
                  </h5>
                  <fieldset>
                    <label htmlFor="titulo">Título:</label>
                    <input
                      type="text"
                      placeholder="Título"
                      id="titulo"
                      name="titulo"
                      onChange={handleChange}
                      className="required"
                    />
                    {errors.titulo && (
                      <small className="text-danger">{errors.titulo}</small>
                    )}
                  </fieldset>
                  <fieldset>
                    <label htmlFor="asunto">Asunto:</label>
                    <textarea
                      placeholder="Asunto"
                      id="asunto"
                      name="asunto"
                      onChange={handleChange}
                      className="required"
                    ></textarea>
                    {errors.asunto && (
                      <small className="text-danger">{errors.asunto}</small>
                    )}
                  </fieldset>
                  <fieldset>
                    <label htmlFor="time">Hora:</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      onChange={handleChange}
                      className="required"
                    />
                    {errors.time && (
                      <small className="text-danger">{errors.time}</small>
                    )}
                  </fieldset>
                  <fieldset>
                    <div className="account__item">
                      <div className="account__item-inner account__item-inner--half">
                        <label htmlFor="inquilino">Invitados:</label>
                        <div className="input-suggestion">
                          <input
                            type="text"
                            name="inquilino"
                            onChange={(e) => {
                              setSearchIsActive(true);
                              throttledFindTenants({
                                nombre: e.target.value,
                                apellido: e.target.value,
                                tipo_de_cuenta: 'Inquilino',
                                invite: e.target.value,
                              });
                            }}
                            placeholder="Ingresá el nombre o apellido del usuario que quieras invitar a este evento"
                          />
                          {tenantData?.getTenantUser?.length > 0 &&
                            searchIsActive && (
                              <div className="input-suggestion__container">
                                {tenantData?.getTenantUser.map((tenant, i) => (
                                  <div
                                    key={i}
                                    className="input-suggestion__item"
                                  >
                                    <small>
                                      {tenant.nombre} {tenant.apellido}
                                    </small>
                                    <button
                                      className="button button--small"
                                      onClick={() => handleInvite(tenant)}
                                      type="button"
                                    >
                                      Invitar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          {invite.length > 0 &&
                            inviteName.map((invitee) => (
                              <div key={invitee} className="pill">
                                <span>{invitee}</span>
                                <span
                                  className="pill-close"
                                  onClick={() => handleRemoveInvite(invitee)}
                                >
                                  &times;
                                </span>
                              </div>
                            ))}
                        </div>
                        {errors.invite && (
                          <small className="text-danger">{errors.invite}</small>
                        )}
                      </div>
                      <div className="account__item-inner account__item-inner--half">
                        <label htmlFor="inmueble">Inmueble:</label>
                        <Select
                          name="listings"
                          placeholder="Seleccioná tu inmueble"
                          options={
                            ownerListingsData
                              ? ownerListingsData.getListings.listings
                              : []
                          }
                          onChange={handleChange}
                          value={form?.listings || ''}
                          keyName="direccion"
                        />
                        {errors.inmueble && (
                          <small className="text-danger">
                            {errors.inmueble}
                          </small>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  <div className="button-container">
                    <button
                      className="button"
                      disabled={isLoading}
                      type="submit"
                    >
                      {isLoading ? (
                        <span className="loader"></span>
                      ) : (
                        <span>Agregar evento</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </dialog>
          )}
          <div className="calendar-events">
            {user?.tipo_de_cuenta === 'Dueño' &&
              (selectedDate > currentDate ||
                isSameDay(selectedDate, currentDate)) && (
                <button className="button" onClick={handleOpenEventDialog}>
                  Agregar evento
                </button>
              )}
            {loading && (
              <Loading>
                <h4>Cargando eventos...</h4>
              </Loading>
            )}
            {error && (
              <Loading>
                <p>
                  Hubo un problema al cargar los eventos:
                  {error.message}
                </p>
              </Loading>
            )}
            {dateEvents &&
              dateEvents.map((event) => (
                <div key={event.id} className="calendar__event">
                  {isOwner && (
                    <button
                      className="calendar__event-delete"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Icon name="trash" />
                    </button>
                  )}
                  <div className="calendar__event-info">
                    <p>{event.titulo}</p>
                    <small>{event.asunto}</small>
                    <div className="calendar__event-info-footer">
                      <small>Asistente:</small>
                      <Link
                        href={`/user/${isOwner ? event.receiverId.id : event.senderId.id}`}
                      >
                        {isOwner
                          ? event.receiverId.nombre
                          : event.senderId.nombre}{' '}
                        {isOwner
                          ? event.receiverId.apellido
                          : event.senderId.apellido}
                      </Link>
                    </div>
                  </div>
                  <small>{event.time}hs</small>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

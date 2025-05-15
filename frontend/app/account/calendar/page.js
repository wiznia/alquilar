'use client';

import { useFormValidation } from '@/app/hooks/useFormValidation';
import AccountSidebar from '@/components/AccountSidebar';
import {
  GET_TENANT_USER,
  SET_CALENDAR_EVENT,
  GET_CALENDAR_EVENTS_BY_MONTH,
} from '@/components/queries/queries';
import formatDateTime from '@/lib/formatDateTime';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import throttle from '@/lib/throttle';
import Loading from '@/components/Loading';
import Link from 'next/link';

export default function Calendar() {
  const { user } = useAuth();
  const formRef = useRef(null);
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
  };

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
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

  const [setCalendarEvent] = useMutation(SET_CALENDAR_EVENT);
  const [
    findTenants,
    { data: tenantData, loading: tenantLoading, error: tenantError },
  ] = useLazyQuery(GET_TENANT_USER);
  const { data, loading, error, refetch } = useQuery(
    GET_CALENDAR_EVENTS_BY_MONTH,
    {
      variables: {
        senderId: user?.id,
        createdAt_min: `${currentYear}-${monthTwoDecimals}-01`,
        createdAt_max: `${currentYear}-${monthTwoDecimals}-${daysInMonth}`,
      },
      skip: !user?.id,
    },
  );

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear((prevYear) =>
      currentMonth === 0 ? prevYear - 1 : prevYear,
    );
    setDateEvents([]);
    setShowAddEventForm(false);
    refetch();
  };

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) =>
      currentMonth === 11 ? prevYear + 1 : prevYear,
    );
    setDateEvents([]);
    setShowAddEventForm(false);
    refetch();
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();

    if (clickedDate > today || isSameDay(clickedDate, today)) {
      setSelectedDate(clickedDate);
      setShowAddEventForm(true);

      const eventsForDate = monthlyEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === clickedDate.getFullYear() &&
          eventDate.getMonth() === clickedDate.getMonth() &&
          eventDate.getDate() === clickedDate.getDate()
        );
      });

      setDateEvents(eventsForDate);
    }
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
        setShowAddEventForm(false);
        setInvite([]);
        setInviteName('');
        if (formRef.current) {
          formRef.current.reset();
        }
        refetch();
      }
    } catch (error) {
      setIsLoading(false);
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

    return classes.join(' ');
  };

  useEffect(() => {
    if (data?.getCalendarEvents) {
      setMonthlyEvents(data.getCalendarEvents);

      const counts = {};
      data.getCalendarEvents.forEach((event) => {
        const date = new Date(event.date);
        const day = date.getDate();
        counts[day] = (counts[day] || 0) + 1;
      });
      setEventsCountByDay(counts);
    }
  }, [data?.getCalendarEvents]);

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                  >
                    <rect
                      width="30"
                      height="30"
                      x="1"
                      y="1"
                      fill="#fff"
                      rx="15"
                    />
                    <rect
                      width="30"
                      height="30"
                      x="1"
                      y="1"
                      stroke="#FF9500"
                      strokeWidth="2"
                      rx="15"
                    />
                    <path
                      fill="#FF9500"
                      d="m19.512 10.898-5 5 5 5-1 2-7-7 7-7 1 2Z"
                    />
                  </svg>
                </button>
                <button onClick={nextMonth}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                  >
                    <rect
                      width="30"
                      height="30"
                      x="1"
                      y="1"
                      fill="#fff"
                      rx="15"
                    />
                    <rect
                      width="30"
                      height="30"
                      x="1"
                      y="1"
                      stroke="#FF9500"
                      strokeWidth="2"
                      rx="15"
                    />
                    <path
                      fill="#FF9500"
                      d="m13.348 21.438 5-5-5-5 1-2 7 7-7 7-1-2Z"
                    />
                  </svg>
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
            <div className="calendar-form">
              {showAddEventForm && (
                <form onSubmit={handleSubmit} ref={formRef}>
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
                        required
                        onChange={handleChange}
                      />
                      {errors.titulo && (
                        <small className="error-message">{errors.titulo}</small>
                      )}
                    </fieldset>
                    <fieldset>
                      <label htmlFor="asunto">Asunto:</label>
                      <textarea
                        placeholder="Asunto"
                        id="asunto"
                        name="asunto"
                        required
                        onChange={handleChange}
                      ></textarea>
                      {errors.asunto && (
                        <small className="error-message">{errors.asunto}</small>
                      )}
                    </fieldset>
                    <fieldset>
                      <label htmlFor="time">Hora:</label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        onChange={handleChange}
                        required
                      />
                      {errors.time && (
                        <small className="error-message">{errors.time}</small>
                      )}
                    </fieldset>
                    <fieldset>
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
                                <div key={i} className="input-suggestion__item">
                                  <small>
                                    {tenant.nombre} {tenant.apellido}
                                  </small>
                                  <button
                                    className="button button--small"
                                    onClick={() => handleInvite(tenant)}
                                  >
                                    Invitar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        {errors.invite && (
                          <small className="error-message">
                            {errors.invite}
                          </small>
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
                    </fieldset>
                    <div className="button-container">
                      <button className="button" disabled={isLoading}>
                        {isLoading ? (
                          <span className="loader"></span>
                        ) : (
                          <span>Agregar evento</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="calendar-events">
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
                  <div className="calendar__event-info">
                    <p>{event.titulo}</p>
                    <small>{event.asunto}</small>
                    <div className="calendar__event-info-footer">
                      <small>Invitado:</small>
                      <Link href={`/user/${event.receiverId.id}`}>
                        {event.receiverId.nombre} {event.receiverId.apellido}
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

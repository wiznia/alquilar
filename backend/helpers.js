import Notification from './schemas/notificationSchema.js';
import { pubsub } from './pubsub.js';
import Listing from './schemas/listingSchema.js';
import Event from './schemas/eventSchema.js';
import User from './schemas/userSchema.js';
import { Agent } from 'undici';

export const handleNotification = async (
  senderId,
  receiverId,
  content,
  type,
  listingId = null,
) => {
  const notification = new Notification({
    sender: senderId,
    receiver: receiverId,
    content,
    type,
    listingId,
    createdAt: new Date(),
  });

  await notification.save();

  pubsub.publish(`NOTIFICATION_RECEIVED_${receiverId.toString()}`, {
    notificationReceived: notification,
  });

  return notification;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const notifyPastEvents = async () => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const events = await Event.find({
    date: {
      $lte: oneDayAgo,
    },
    notified: { $ne: true },
  });

  for (const event of events) {
    const senderId = event.senderId;
    const sender = await User.findById(senderId).select('nombre apellido');
    const content = `Cómo estuvo la visita a "${event.titulo}"?. Agregá a <a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> como potencial inquilino si querés alquilarle tu inmueble.`;

    await handleNotification(senderId, senderId, content, 'event', null);

    event.notified = true;
    await event.save();
  }
};

export const listingPriceHasChanged = async () => {
  const rentedListings = await Listing.find({
    estado: ['Alquilado'],
  });

  for (const listing of rentedListings) {
    const start = new Date(listing.contract.contractStartDate);
    const today = new Date();
    const todayDate = new Date().toISOString().slice(0, 10);
    const adjustmentType = listing.contract.contractAdjustmentType;
    const adjustmentMethod = listing.contract.contractAdjustmentMethod;

    if (!start) return;

    const adjustmentMap = {
      anual: 12,
      semestral: 6,
      trimestral: 3,
      cuatrimestral: 4,
    };
    const monthsToAdd = adjustmentMap[adjustmentType];
    const lastAdjustedDate = new Date(
      listing.precioLastAdjustmentDate || start,
    );
    let nextAdjustmentDate = new Date(start);

    while (nextAdjustmentDate <= today) {
      nextAdjustmentDate.setMonth(nextAdjustmentDate.getMonth() + monthsToAdd);
    }

    nextAdjustmentDate.setMonth(nextAdjustmentDate.getMonth() - monthsToAdd);

    if (lastAdjustedDate >= nextAdjustmentDate) return;

    const adjustmentApiUrl =
      adjustmentMethod === 'IPC'
        ? `https://api.bcra.gob.ar/estadisticas/v3.0/monetarias/27?desde=${listing.contract.contractStartDate}&hasta=${todayDate}&limit=1300`
        : `https://api.bcra.gob.ar/estadisticas/v3.0/monetarias/40?desde=${listing.contract.contractStartDate}&hasta=${todayDate}&limit=1300`;

    console.log(today, nextAdjustmentDate, today > nextAdjustmentDate);
    if (today > nextAdjustmentDate) {
      try {
        const agent = new Agent({
          connect: {
            rejectUnauthorized: false,
          },
        });
        const response = await fetch(adjustmentApiUrl, { dispatcher: agent });

        if (!response.ok) {
          throw new Error(`Error fetching data for listing ${listing._id}`);
        }
        const data = await response.json();
        const { results } = data;

        const fechaInicio = new Date(start);
        const fechaAjuste = new Date(nextAdjustmentDate);

        const fromMonth = new Date(fechaInicio);
        fromMonth.setMonth(fromMonth.getMonth() + 1);
        fromMonth.setDate(1);

        const toMonth = new Date(fechaAjuste);
        toMonth.setDate(1);

        const ipcMensualRaw = results
          .map((r) => ({ ...r, fecha: new Date(r.fecha) }))
          .filter((r) => r.fecha >= fromMonth && r.fecha <= toMonth);

        const ipcMensual = ipcMensualRaw
          .filter((r) => !isNaN(r.valor))
          .map((r) => Number(r.valor));

        let adjustedPrice;
        let adjustmentProvisional = false;

        if (adjustmentMethod === 'ICL') {
          const firstValue = Number(
            results.find((r) => r.fecha === start.toISOString().slice(0, 10))
              ?.valor,
          );
          const lastValue = Number(
            results.find(
              (r) => r.fecha === nextAdjustmentDate.toISOString().slice(0, 10),
            )?.valor,
          );
          adjustedPrice = (lastValue / firstValue) * listing.precio;
        } else {
          if (ipcMensual.length < ipcMensualRaw.length) {
            adjustmentProvisional = true;
          }

          const expectedLastMonth = toMonth.getTime();
          const actualLastMonth =
            ipcMensualRaw.length > 0
              ? ipcMensualRaw[ipcMensualRaw.length - 1].fecha.getTime()
              : null;
          if (actualLastMonth !== expectedLastMonth) {
            adjustmentProvisional = true;
          }

          let index = 1.0;
          for (const monthly of ipcMensual) {
            index *= 1 + monthly / 100;
          }
          adjustedPrice = Math.round(listing.precio * index);
        }

        await Listing.findByIdAndUpdate(listing._id, {
          $set: {
            precio: adjustedPrice,
            precioLastAdjustmentDate: nextAdjustmentDate
              .toISOString()
              .slice(0, 10),
            adjustmentProvisional,
          },
        });
      } catch (error) {
        console.error(`Error with listing ${listing._id}:`, error);
      }
    }
  }
};

export const enableRatingForm = async () => {
  const rentedListings = await Listing.find({
    estado: ['Alquilado'],
  });

  for (const listing of rentedListings) {
    const start = new Date(listing.contract.contractStartDate);
    const today = new Date();
    const duration = listing.contract.contractDuration;
    const contractEnd = new Date(start).setMonth(
      start.getMonth() + parseInt(duration),
    );
    const contractEndDate = new Date(contractEnd);
    const contractEndDateBuffer = contractEndDate.setMonth(
      contractEndDate.getMonth() - 3,
    );

    if (today > contractEndDateBuffer) {
      await Listing.findByIdAndUpdate(listing._id, {
        $set: {
          'contract.contractExpiring': true,
        },
      });
    }
  }
};

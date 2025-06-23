import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import http from 'http';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { graphqlUploadExpress } from 'graphql-upload';
import { makeExecutableSchema } from '@graphql-tools/schema';
import Listing from './listingSchema.js';
import Event from './eventSchema.js';
import User from './userSchema.js';
import cron from 'node-cron';
import { formatDate, handleNotification } from './helpers.js';
import { pubsub } from './pubsub.js';
import { Agent } from 'undici';

import typeDefs from './typeDefs.js';
import resolvers from './resolvers.js';

dotenv.config();

mongoose
  .connect(process.env.DATABASE_URL, {})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

const app = express();
const httpServer = http.createServer(app);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
app.use('/output', express.static(path.resolve('./output')));

app.get('/api/mercado-pago/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      throw new Error(
        'Authorization code or state is missing from the callback.',
      );
    }

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MERCADO_PAGO_CLIENT_ID,
        client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.MERCADO_PAGO_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OAuth token exchange failed: ${errorData.message}`);
    }

    const { access_token, refresh_token, user_id, expires_in } =
      await response.json();
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await Listing.findByIdAndUpdate(state, {
      mercadoPago: {
        userId: user_id,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/mp/success?userId=${state}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/mp/failure?error=${encodeURIComponent(error)}`,
    );
  }
});

app.post('/webhook/mercadopago', async (req, res) => {
  const { id, topic, type, data } = req.body;

  if (topic === 'payment' || type === 'payment') {
    const paymentId = data && data.id ? data.id : id;
    const ACCESS_TOKEN = process.env.MERCADO_PAGO_TEST_ACCESS_TOKEN;

    try {
      const paymentUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      const response = await fetch(paymentUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Mercado Pago API error: ${response.status} ${response.statusText}`,
        );
      }

      const paymentInfo = await response.json();
      const listingId = paymentInfo.external_reference;

      await Listing.findByIdAndUpdate(listingId, {
        $set: {
          'payment.status': paymentInfo.status,
          'payment.mpPaymentId': paymentInfo.id,
          estado: ['Reservado'],
        },
      });

      pubsub.publish('NEW_PAYMENT', {
        newPayment: {
          id: paymentInfo.external_reference,
          status: paymentInfo.status,
        },
      });
      res.sendStatus(200);
    } catch (err) {
      console.error('Error fetching payment info from Mercado Pago:', err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(200);
  }
});

const notifyPastEvents = async () => {
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

const listingPriceHasChanged = async () => {
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

const enableRatingForm = async () => {
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

cron.schedule('0 0 * * *', notifyPastEvents);
cron.schedule('0 0 * * *', listingPriceHasChanged);
cron.schedule('0 0 * * *', enableRatingForm);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res, pubsub }),
  }),
);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

useServer(
  {
    schema,
    context: async () => ({ pubsub }),
  },
  wsServer,
);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`Subscriptions ready at ws://localhost:${PORT}`);
});

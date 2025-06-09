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
import cron from 'node-cron';
import { pubsub } from './pubsub.js';

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
        },
      });

      console.log('Received payment info:', paymentInfo);
      res.sendStatus(200);
    } catch (err) {
      console.error('Error fetching payment info from Mercado Pago:', err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(200);
  }
});

/*const notifyPastEvents = async () => {
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
};*/

//cron.schedule('*/2 * * * *', notifyPastEvents);

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

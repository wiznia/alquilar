import express from 'express';
import { pubsub } from '../pubsub.js';
import Listing from '../schemas/listingSchema.js';

const router = express.Router();

router.post('/webhook/mercadopago', async (req, res) => {
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

router.get('/mercado-pago/callback', async (req, res) => {
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

export default router;

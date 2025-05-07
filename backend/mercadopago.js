import mercadopago from 'mercadopago';

mercadopago.configure({
  client_id: process.env.MP_CLIENT_ID,
  client_secret: process.env.MP_CLIENT_SECRET,
});

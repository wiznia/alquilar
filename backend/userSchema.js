import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tipo_de_cuenta: { type: String, required: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  condicion_fiscal: { type: String, required: true },
  dni: { type: Number, required: true },
  telefono: { type: Number },
  celular: { type: Number },
  ratings: [ratingSchema],
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
  mercadoPago: {
    userId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
  },
  mpPaymentLink: { type: String },
  sena: { type: Number },
});

const User = mongoose.model('User', userSchema);

export default User;

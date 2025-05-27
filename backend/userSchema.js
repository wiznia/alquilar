import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  apellido: { type: String, required: true },
  celular: { type: Number },
  condicion_fiscal: { type: String, required: true },
  dni: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  provincia: { type: String, required: true },
  barrio: { type: String, required: true },
  localidad: { type: String },
  password: { type: String, required: true },
  potential_tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ratings: [ratingSchema],
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
  telefono: { type: Number },
  tipo_de_cuenta: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

export default User;

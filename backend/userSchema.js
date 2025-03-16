import mongoose from 'mongoose';

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
});

const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  ambientes: Number,
  ammenities: { type: [String] },
  antiguedad_max: { type: Number, required: true },
  banos: Number,
  barrio: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  descripcion: String,
  direccion: { type: String, required: true },
  dormitorios: Number,
  estado: { type: [String], required: true },
  expensas: { type: Number, required: true },
  fotos: [
    {
      id: String,
      name: String,
      url: String,
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moneda: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  precio: { type: Number, required: true },
  provincia: { type: String, required: true },
  superficie_cubierta: { type: Number, required: true },
  superficie_total: { type: Number, required: true },
  tipo_de_alquiler: { type: String, required: true },
  tipo_de_ambientes: { type: [String] },
  tipo_de_propiedad: { type: String, required: true },
  titulo: { type: String, required: true },
  toilettes: Number,
  viewCount: {
    type: Number,
    default: 0,
  },
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

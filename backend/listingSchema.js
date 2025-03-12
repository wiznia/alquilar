import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo_de_alquiler: { type: String, required: true },
  moneda: { type: String, required: true },
  tipo_de_propiedad: { type: String, required: true },
  direccion: { type: String, required: true },
  localidad: { type: String, required: true },
  barrio: { type: String, required: true },
  descripcion: { type: String, required: true },
  estado: { type: String, required: true },
  precio: { type: Number, required: true },
  expensas: Number,
  ambientes: Number,
  dormitorios: Number,
  banos: Number,
  superficie_cubierta: Number,
  superficie_total: Number,
  ammenities: { type: String },
  tipo_de_ambientes: { type: String },
  antiguedad_max: Number,
  fotos: [
    {
      id: String,
      image: {
        publicUrlTransformed: String,
      },
    },
  ],
  owner: {
    account: String,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

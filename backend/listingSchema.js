import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  ambientes: Number,
  ammenities: { type: [String] },
  antiguedad_max: { type: Number, required: true },
  banos: Number,
  barrio: { type: String, required: true },
  contract: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nombre: String,
    apellido: String,
    documents: [
      {
        id: String,
        name: String,
        url: String,
        extension: String,
      },
    ],
    potentialTenantAgreed: { type: Boolean, default: false },
    url: String,
    hash: String,
    contractStartDate: String,
    contractDuration: String,
    contractAdjustmentType: String,
    contractAdjustmentMethod: String,
    contractNote: String,
    contractVoidReason: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  descripcion: String,
  direccion: { type: String, required: true },
  documentation: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      nombre: String,
      apellido: String,
      documents: [
        {
          id: String,
          name: String,
          url: String,
          extension: String,
        },
      ],
    },
  ],
  dormitorios: Number,
  estado: { type: [String], required: true },
  expensas: { type: Number, required: true },
  fotos: [
    {
      id: String,
      name: String,
      url: String,
      extension: String,
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mercadoPago: {
    userId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
  },
  moneda: { type: String, required: true },
  mpPaymentLink: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payment: {
    cbu: { type: String },
    alias: { type: String },
    status: { type: String },
    mpPaymentId: { type: Number },
    paymentDone: { type: Boolean, default: false },
  },
  potential_tenant: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  precio: { type: Number, required: true },
  precioLastAdjustmentDate: String,
  adjustmentProvisional: { type: Number },
  provincia: { type: String, required: true },
  sena: { type: Number },
  signature: { type: Boolean, default: false },
  superficie_cubierta: { type: Number, required: true },
  superficie_total: { type: Number, required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

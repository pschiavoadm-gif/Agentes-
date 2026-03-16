const mongoose = require('mongoose');

const redesSocialesSchema = new mongoose.Schema({
  facebook: { type: String, default: null },
  instagram: { type: String, default: null },
  twitter: { type: String, default: null },
  linkedin: { type: String, default: null },
  youtube: { type: String, default: null },
  tiktok: { type: String, default: null },
}, { _id: false });

const comercioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  rubro: {
    type: String,
    trim: true,
    default: null,
  },
  email: {
    type: [String],
    default: [],
  },
  whatsapp: {
    type: [String],
    default: [],
  },
  telefono: {
    type: [String],
    default: [],
  },
  redesSociales: {
    type: redesSocialesSchema,
    default: {},
  },
  direccion: {
    type: String,
    default: null,
  },
  codigoPostal: {
    type: String,
    default: '1430',
  },
  barrio: {
    type: String,
    default: null,
  },
  web: {
    type: String,
    default: null,
  },
  fuente: {
    type: String,
    default: null,
  },
  urlFuente: {
    type: String,
    default: null,
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Índice para evitar duplicados por nombre + dirección
comercioSchema.index({ nombre: 1, direccion: 1 }, { unique: true });

module.exports = mongoose.model('Comercio', comercioSchema);

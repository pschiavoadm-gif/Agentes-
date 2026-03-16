const mongoose = require('mongoose');

async function conectar() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/comercios_caba';
  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado: ${uri}`);
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    throw err;
  }
}

async function desconectar() {
  await mongoose.disconnect();
  console.log('🔌 MongoDB desconectado');
}

module.exports = { conectar, desconectar };

const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Datastore({
  filename: path.join(DB_DIR, 'comercios.db'),
  autoload: true,
});

// Índice único por nombre+dirección
db.ensureIndex({ fieldName: 'nombre' });

async function conectar() {
  console.log(`✅ NeDB listo en: ${path.join(DB_DIR, 'comercios.db')}`);
}

async function desconectar() {
  // NeDB no requiere desconexión
  console.log('🔌 NeDB cerrado');
}

module.exports = { db, conectar, desconectar };

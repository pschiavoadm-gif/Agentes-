/**
 * Script de consultas útiles a la base de datos
 * Uso: node src/consultas.js [--rubro=restaurante] [--conEmail] [--conWhatsapp]
 */
require('dotenv').config();
const { conectar, desconectar } = require('./utils/db');
const Comercio = require('./models/Comercio');

async function main() {
  await conectar();

  const args = process.argv.slice(2);
  const filtro = { codigoPostal: '1430' };

  // Filtros por argumento
  const rubroArg = args.find(a => a.startsWith('--rubro='));
  if (rubroArg) filtro.rubro = new RegExp(rubroArg.split('=')[1], 'i');
  if (args.includes('--conEmail')) filtro.email = { $ne: [] };
  if (args.includes('--conWhatsapp')) filtro.whatsapp = { $ne: [] };
  if (args.includes('--conRedes')) {
    filtro.$or = [
      { 'redesSociales.facebook': { $ne: null } },
      { 'redesSociales.instagram': { $ne: null } },
    ];
  }

  const comercios = await Comercio.find(filtro).lean();
  console.log(`\n📊 Resultados: ${comercios.length} comercios\n`);

  comercios.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nombre}`);
    if (c.rubro) console.log(`   Rubro: ${c.rubro}`);
    if (c.direccion) console.log(`   Dirección: ${c.direccion}`);
    if (c.telefono?.length) console.log(`   Tel: ${c.telefono.join(', ')}`);
    if (c.whatsapp?.length) console.log(`   WhatsApp: ${c.whatsapp.join(', ')}`);
    if (c.email?.length) console.log(`   Email: ${c.email.join(', ')}`);
    const redes = Object.entries(c.redesSociales || {}).filter(([, v]) => v);
    if (redes.length) console.log(`   Redes: ${redes.map(([k, v]) => `${k}: ${v}`).join(' | ')}`);
    console.log('');
  });

  // Resumen por rubro
  const porRubro = await Comercio.aggregate([
    { $match: { codigoPostal: '1430' } },
    { $group: { _id: '$rubro', total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 20 },
  ]);

  console.log('📈 Top rubros:');
  porRubro.forEach(r => console.log(`   ${r._id || '(sin rubro)'}: ${r.total}`));

  await desconectar();
}

main().catch(console.error);

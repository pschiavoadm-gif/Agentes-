/**
 * Script de consultas a la base de datos NeDB
 * Uso: node src/consultas.js [--rubro=restaurante] [--conEmail] [--conWhatsapp] [--conRedes]
 */
require('dotenv').config();
const { db, conectar, desconectar } = require('./utils/db');

function dbFind(query) {
  return new Promise((res, rej) => db.find(query).sort({ nombre: 1 }).exec((e, d) => e ? rej(e) : res(d)));
}
function dbAggregate(field) {
  return new Promise((res, rej) => {
    db.find({ codigoPostal: '1430' }, (err, docs) => {
      if (err) return rej(err);
      const conteo = {};
      docs.forEach(d => {
        const val = d[field] || '(sin ' + field + ')';
        conteo[val] = (conteo[val] || 0) + 1;
      });
      const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 20);
      res(sorted);
    });
  });
}

async function main() {
  await conectar();

  const args = process.argv.slice(2);
  const filtro = { codigoPostal: '1430' };

  const rubroArg = args.find(a => a.startsWith('--rubro='));
  if (rubroArg) {
    const val = rubroArg.split('=')[1];
    // NeDB usa regex directamente
    filtro.rubro = new RegExp(val, 'i');
  }

  let docs = await dbFind(filtro);

  if (args.includes('--conEmail')) docs = docs.filter(d => d.email?.length > 0);
  if (args.includes('--conWhatsapp')) docs = docs.filter(d => d.whatsapp?.length > 0);
  if (args.includes('--conRedes')) docs = docs.filter(d =>
    d.redesSociales?.facebook || d.redesSociales?.instagram
  );

  console.log(`\n📊 Resultados: ${docs.length} comercios\n`);

  docs.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nombre}`);
    if (c.rubro)            console.log(`   Rubro:     ${c.rubro}`);
    if (c.direccion)        console.log(`   Dirección: ${c.direccion}`);
    if (c.telefono?.length) console.log(`   Tel:       ${c.telefono.join(', ')}`);
    if (c.whatsapp?.length) console.log(`   WhatsApp:  ${c.whatsapp.join(', ')}`);
    if (c.email?.length)    console.log(`   Email:     ${c.email.join(', ')}`);
    const redes = Object.entries(c.redesSociales || {}).filter(([, v]) => v);
    if (redes.length)       console.log(`   Redes:     ${redes.map(([k, v]) => `${k}: ${v}`).join(' | ')}`);
    console.log('');
  });

  const porRubro = await dbAggregate('rubro');
  console.log('📈 Top rubros:');
  porRubro.forEach(([r, n]) => console.log(`   ${r}: ${n}`));

  await desconectar();
}

main().catch(console.error);

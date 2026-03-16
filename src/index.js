require('dotenv').config();
const { db, conectar, desconectar } = require('./utils/db');
const { sleep } = require('./utils/helpers');
const fs = require('fs');
const path = require('path');

const scraperGuiaLocales = require('./scrapers/guiaLocales');
const scraperPaginasAmarillas = require('./scrapers/paginasAmarillas');

const POSTAL_CODE = process.env.POSTAL_CODE || '1430';

// ─── Promisify NeDB ────────────────────────────────────────────────────────────
function dbFind(query) {
  return new Promise((res, rej) => db.find(query, (e, d) => e ? rej(e) : res(d)));
}
function dbCount(query) {
  return new Promise((res, rej) => db.count(query, (e, d) => e ? rej(e) : res(d)));
}
function dbUpsert(doc) {
  return new Promise((res, rej) => {
    const clave = { nombre: doc.nombre, codigoPostal: doc.codigoPostal };
    db.findOne(clave, (err, existente) => {
      if (err) return rej(err);
      if (existente) {
        // Merge arrays sin duplicar
        const emailSet = new Set([...(existente.email || []), ...(doc.email || [])]);
        const telSet = new Set([...(existente.telefono || []), ...(doc.telefono || [])]);
        const waSet = new Set([...(existente.whatsapp || []), ...(doc.whatsapp || [])]);
        const redes = { ...(existente.redesSociales || {}), ...(doc.redesSociales || {}) };

        db.update(
          { _id: existente._id },
          {
            $set: {
              email: [...emailSet],
              telefono: [...telSet],
              whatsapp: [...waSet],
              redesSociales: redes,
              rubro: doc.rubro || existente.rubro,
              web: doc.web || existente.web,
              direccion: doc.direccion || existente.direccion,
              updatedAt: new Date(),
            },
          },
          {},
          (e) => e ? rej(e) : res('updated')
        );
      } else {
        db.insert({ ...doc, createdAt: new Date(), updatedAt: new Date() },
          (e, d) => e ? rej(e) : res('inserted'));
      }
    });
  });
}

async function guardarLote(comercios) {
  let guardados = 0;
  let actualizados = 0;
  for (const c of comercios) {
    if (!c.nombre) continue;
    try {
      const res = await dbUpsert(c);
      if (res === 'inserted') guardados++;
      else actualizados++;
    } catch (err) {
      console.error(`  ❌ Error "${c.nombre}": ${err.message}`);
    }
  }
  return { guardados, actualizados };
}

async function exportarJSON() {
  const dir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const todos = await dbFind({ codigoPostal: POSTAL_CODE });
  const archivo = path.join(dir, `comercios_1430_${Date.now()}.json`);
  fs.writeFileSync(archivo, JSON.stringify(todos, null, 2), 'utf-8');
  console.log(`\n💾 Exportado a: ${archivo}`);
  return archivo;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SCRAPER DE COMERCIOS - CP 1430 - CABA (Buenos Aires)');
  console.log('═══════════════════════════════════════════════════════\n');

  await conectar();

  const errores = [];

  // ── 1. OpenStreetMap + GuiaLocales + DondeVivimos ──────────────────────────
  console.log('📦 [1/2] Fuentes Axios (OpenStreetMap, GuiaLocales, DondeVivimos)...');
  try {
    const comercios = await scraperGuiaLocales.scrape();
    console.log(`  → ${comercios.length} comercios encontrados`);
    const { guardados, actualizados } = await guardarLote(comercios);
    console.log(`  ✅ Nuevos: ${guardados} | Actualizados: ${actualizados}`);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    errores.push({ fuente: 'GuiaLocales/OSM', error: err.message });
  }

  await sleep(1000);

  // ── 2. Páginas Amarillas ────────────────────────────────────────────────────
  console.log('\n📦 [2/2] Páginas Amarillas (Puppeteer)...');
  try {
    const comercios = await scraperPaginasAmarillas.scrape({ maxPaginas: 3 });
    console.log(`  → ${comercios.length} comercios encontrados`);
    const { guardados, actualizados } = await guardarLote(comercios);
    console.log(`  ✅ Nuevos: ${guardados} | Actualizados: ${actualizados}`);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    errores.push({ fuente: 'PaginasAmarillas', error: err.message });
  }

  // ── Resumen ────────────────────────────────────────────────────────────────
  const totalEnDB = await dbCount({ codigoPostal: POSTAL_CODE });
  const todos = await dbFind({ codigoPostal: POSTAL_CODE });

  const conEmail = todos.filter(c => c.email?.length > 0).length;
  const conWhatsapp = todos.filter(c => c.whatsapp?.length > 0).length;
  const conTelefono = todos.filter(c => c.telefono?.length > 0).length;
  const conRedes = todos.filter(c =>
    c.redesSociales?.facebook || c.redesSociales?.instagram
  ).length;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMEN FINAL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total en DB (CP ${POSTAL_CODE}): ${totalEnDB} comercios`);
  console.log('\n  📊 Estadísticas:');
  console.log(`     Con email:          ${conEmail}`);
  console.log(`     Con WhatsApp:       ${conWhatsapp}`);
  console.log(`     Con teléfono:       ${conTelefono}`);
  console.log(`     Con redes sociales: ${conRedes}`);
  if (errores.length > 0) {
    console.log(`\n  ⚠️  Errores en ${errores.length} fuente(s):`);
    errores.forEach(e => console.log(`     - ${e.fuente}: ${e.error}`));
  }
  console.log('═══════════════════════════════════════════════════════\n');

  await exportarJSON();
  await desconectar();
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});

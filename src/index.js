require('dotenv').config();
const { conectar, desconectar } = require('./utils/db');
const Comercio = require('./models/Comercio');
const { sleep } = require('./utils/helpers');
const fs = require('fs');
const path = require('path');

// Scrapers disponibles
const scraperGuiaLocales = require('./scrapers/guiaLocales');
const scraperPaginasAmarillas = require('./scrapers/paginasAmarillas');
const scraperGoogleMaps = require('./scrapers/googleMaps');

const POSTAL_CODE = process.env.POSTAL_CODE || '1430';

async function guardarComercio(datos) {
  if (!datos.nombre) return null;

  try {
    const resultado = await Comercio.findOneAndUpdate(
      { nombre: datos.nombre, direccion: datos.direccion || null },
      {
        $setOnInsert: { scrapedAt: new Date() },
        $set: {
          rubro: datos.rubro || null,
          web: datos.web || null,
          fuente: datos.fuente,
          urlFuente: datos.urlFuente,
          codigoPostal: datos.codigoPostal || POSTAL_CODE,
          barrio: datos.barrio || null,
        },
        $addToSet: {
          email: { $each: datos.email || [] },
          telefono: { $each: datos.telefono || [] },
          whatsapp: { $each: datos.whatsapp || [] },
        },
        $set: {
          'redesSociales.facebook': datos.redesSociales?.facebook || undefined,
          'redesSociales.instagram': datos.redesSociales?.instagram || undefined,
          'redesSociales.twitter': datos.redesSociales?.twitter || undefined,
          'redesSociales.linkedin': datos.redesSociales?.linkedin || undefined,
          'redesSociales.youtube': datos.redesSociales?.youtube || undefined,
          'redesSociales.tiktok': datos.redesSociales?.tiktok || undefined,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return resultado;
  } catch (err) {
    if (err.code === 11000) {
      // Duplicado — ok, ignorar
      return null;
    }
    console.error(`  ❌ Error guardando "${datos.nombre}": ${err.message}`);
    return null;
  }
}

async function guardarLote(comercios) {
  let guardados = 0;
  let saltados = 0;
  for (const c of comercios) {
    const res = await guardarComercio(c);
    if (res) guardados++;
    else saltados++;
  }
  return { guardados, saltados };
}

async function exportarJSON(todos) {
  const dir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const archivo = path.join(dir, `comercios_1430_${Date.now()}.json`);
  fs.writeFileSync(archivo, JSON.stringify(todos, null, 2), 'utf-8');
  console.log(`\n💾 Exportado a: ${archivo}`);
  return archivo;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SCRAPER DE COMERCIOS - CP 1430 - CABA (Buenos Aires)');
  console.log('═══════════════════════════════════════════════════════\n');

  // Conectar a MongoDB
  await conectar();

  const todosLosComerciosGuardados = [];
  const errores = [];

  // ── 1. OpenStreetMap + GuiaLocales + DondeVivimos (sin navegador) ──
  console.log('📦 [1/3] Fuentes con datos abiertos y Axios...');
  try {
    const comerciosGuia = await scraperGuiaLocales.scrape();
    console.log(`  → ${comerciosGuia.length} comercios encontrados`);
    const { guardados, saltados } = await guardarLote(comerciosGuia);
    todosLosComerciosGuardados.push(...comerciosGuia);
    console.log(`  ✅ Guardados: ${guardados} | Saltados (dup): ${saltados}`);
  } catch (err) {
    console.error(`  ❌ Error en GuiaLocales: ${err.message}`);
    errores.push({ fuente: 'GuiaLocales', error: err.message });
  }

  await sleep(2000);

  // ── 2. Páginas Amarillas (Puppeteer) ──
  console.log('\n📦 [2/3] Páginas Amarillas...');
  try {
    const comerciosPAm = await scraperPaginasAmarillas.scrape({ maxPaginas: 3 });
    console.log(`  → ${comerciosPAm.length} comercios encontrados`);
    const { guardados, saltados } = await guardarLote(comerciosPAm);
    todosLosComerciosGuardados.push(...comerciosPAm);
    console.log(`  ✅ Guardados: ${guardados} | Saltados (dup): ${saltados}`);
  } catch (err) {
    console.error(`  ❌ Error en Páginas Amarillas: ${err.message}`);
    errores.push({ fuente: 'PaginasAmarillas', error: err.message });
  }

  await sleep(2000);

  // ── 3. Google Maps (Puppeteer) ──
  console.log('\n📦 [3/3] Google Maps...');
  try {
    const comerciosMaps = await scraperGoogleMaps.scrape();
    console.log(`  → ${comerciosMaps.length} comercios encontrados`);
    const { guardados, saltados } = await guardarLote(comerciosMaps);
    todosLosComerciosGuardados.push(...comerciosMaps);
    console.log(`  ✅ Guardados: ${guardados} | Saltados (dup): ${saltados}`);
  } catch (err) {
    console.error(`  ❌ Error en Google Maps: ${err.message}`);
    errores.push({ fuente: 'GoogleMaps', error: err.message });
  }

  // ── Resumen final ──
  const totalEnDB = await Comercio.countDocuments({ codigoPostal: POSTAL_CODE });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMEN FINAL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total en MongoDB (CP ${POSTAL_CODE}): ${totalEnDB} comercios`);
  if (errores.length > 0) {
    console.log(`  ⚠️  Errores en ${errores.length} fuentes:`);
    errores.forEach(e => console.log(`     - ${e.fuente}: ${e.error}`));
  }

  // Exportar resultados a JSON
  const todos = await Comercio.find({ codigoPostal: POSTAL_CODE }).lean();
  await exportarJSON(todos);

  // Stats detalladas
  const conEmail = await Comercio.countDocuments({ codigoPostal: POSTAL_CODE, email: { $ne: [] } });
  const conWhatsapp = await Comercio.countDocuments({ codigoPostal: POSTAL_CODE, whatsapp: { $ne: [] } });
  const conTelefono = await Comercio.countDocuments({ codigoPostal: POSTAL_CODE, telefono: { $ne: [] } });
  const conRedesSociales = await Comercio.countDocuments({
    codigoPostal: POSTAL_CODE,
    $or: [
      { 'redesSociales.facebook': { $ne: null } },
      { 'redesSociales.instagram': { $ne: null } },
    ],
  });

  console.log('\n  📊 Estadísticas de datos:');
  console.log(`     Con email:         ${conEmail}`);
  console.log(`     Con WhatsApp:      ${conWhatsapp}`);
  console.log(`     Con teléfono:      ${conTelefono}`);
  console.log(`     Con redes sociales: ${conRedesSociales}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await desconectar();
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});

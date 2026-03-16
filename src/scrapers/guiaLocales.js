/**
 * Scraper de fuentes alternativas:
 * - guialocales.com.ar
 * - dondevivimos.com.ar
 * - infonegocios.info
 * Busca comercios en CP 1430 CABA
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { sleep, extraerEmails, extraerTelefonos, extraerRedesSociales, limpiar, esWhatsApp } = require('../utils/helpers');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9',
};

// ─── Guia Locales ──────────────────────────────────────────────────────────────
async function scrapeGuiaLocales() {
  const comercios = [];
  const rubros = ['gastronomia', 'comercios', 'servicios', 'salud', 'educacion'];

  for (const rubro of rubros) {
    for (let pagina = 1; pagina <= 5; pagina++) {
      try {
        const url = `https://www.guialocales.com.ar/buscar?cp=1430&categoria=${rubro}&page=${pagina}`;
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(data);

        let encontrados = 0;
        $('.listing-item, .business-card, .result-item, article').each((_, el) => {
          const nombre = $(el).find('h2, h3, .name, .title').first().text().trim();
          if (!nombre) return;

          const direccion = $(el).find('.address, .direccion, address').first().text().trim();
          const telefono = $(el).find('.phone, .tel, [class*=phone]').first().text().trim();
          const email = $(el).find('a[href^="mailto:"]').first().attr('href')?.replace('mailto:', '');
          const web = $(el).find('a[href^="http"]').not('[href*="guialocales"]').first().attr('href');

          const links = [];
          $(el).find('a[href]').each((_, a) => links.push($(a).attr('href') || ''));

          const tels = extraerTelefonos(telefono);
          comercios.push({
            nombre: limpiar(nombre),
            rubro: limpiar(rubro),
            direccion: limpiar(direccion),
            telefono: tels.filter(t => !esWhatsApp(t)),
            whatsapp: tels.filter(esWhatsApp),
            email: email ? [email.toLowerCase()] : [],
            redesSociales: extraerRedesSociales(links),
            web: web || null,
            fuente: 'Guia Locales',
            urlFuente: url,
            codigoPostal: '1430',
          });
          encontrados++;
        });

        if (encontrados === 0) break;
        console.log(`    📄 GuiaLocales ${rubro} p.${pagina}: ${encontrados} resultados`);
        await sleep(2000);
      } catch (err) {
        if (err.response?.status === 404) break;
        console.error(`  ⚠️  GuiaLocales error: ${err.message}`);
        break;
      }
    }
  }
  return comercios;
}

// ─── DondeVivimos ──────────────────────────────────────────────────────────────
async function scrapeDondeVivimos() {
  const comercios = [];
  const barrios = ['villa-del-parque', 'villa-santa-rita', 'monte-castro'];

  for (const barrio of barrios) {
    try {
      const url = `https://www.dondevivimos.com.ar/barrio/${barrio}/comercios`;
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      const $ = cheerio.load(data);

      $('.commerce-item, .business-item, .local').each((_, el) => {
        const nombre = $(el).find('h2, h3, .nombre').first().text().trim();
        if (!nombre) return;

        const rubro = $(el).find('.categoria, .rubro, .type').first().text().trim();
        const direccion = $(el).find('.address, .dir').first().text().trim();
        const telefono = $(el).find('.tel, .phone').first().text().trim();
        const email = $(el).find('a[href^="mailto:"]').first().attr('href')?.replace('mailto:', '');

        const tels = extraerTelefonos(telefono);
        comercios.push({
          nombre: limpiar(nombre),
          rubro: limpiar(rubro),
          direccion: limpiar(direccion),
          telefono: tels.filter(t => !esWhatsApp(t)),
          whatsapp: tels.filter(esWhatsApp),
          email: email ? [email.toLowerCase()] : [],
          redesSociales: {},
          web: null,
          fuente: 'DondeVivimos',
          urlFuente: url,
          codigoPostal: '1430',
          barrio: barrio.replace(/-/g, ' '),
        });
      });

      console.log(`    🏘️  DondeVivimos ${barrio}: ${comercios.length} acumulados`);
      await sleep(2000);
    } catch (err) {
      console.error(`  ⚠️  DondeVivimos error en ${barrio}: ${err.message}`);
    }
  }
  return comercios;
}

// ─── Waze / Foursquare fallback (scraping público) ────────────────────────────
async function scrapeOpenStreetMap() {
  const comercios = [];
  // Overpass API - datos abiertos de OpenStreetMap para el área del CP 1430
  // Coordenadas aproximadas del CP 1430 (Villa del Parque, CABA)
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const query = `
    [out:json][timeout:30];
    (
      node["shop"](bbox:-34.635,-58.505,-34.590,-58.475);
      node["amenity"="restaurant"](bbox:-34.635,-58.505,-34.590,-58.475);
      node["amenity"="cafe"](bbox:-34.635,-58.505,-34.590,-58.475);
      node["amenity"="bar"](bbox:-34.635,-58.505,-34.590,-58.475);
      node["amenity"="pharmacy"](bbox:-34.635,-58.505,-34.590,-58.475);
      node["office"](bbox:-34.635,-58.505,-34.590,-58.475);
    );
    out body;
  `;

  try {
    const { data } = await axios.post(overpassUrl, query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 30000,
    });

    const elementos = data.elements || [];
    console.log(`    🌍 OpenStreetMap: ${elementos.length} elementos encontrados`);

    for (const el of elementos) {
      const tags = el.tags || {};
      const nombre = tags.name || tags['name:es'];
      if (!nombre) continue;

      const telefono = tags.phone || tags['contact:phone'] || '';
      const email = tags.email || tags['contact:email'] || '';
      const web = tags.website || tags['contact:website'] || '';
      const rubro = tags.shop || tags.amenity || tags.office || '';

      const links = web ? [web] : [];
      const tels = extraerTelefonos(telefono);

      comercios.push({
        nombre: limpiar(nombre),
        rubro: limpiar(rubro),
        direccion: limpiar([tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null),
        telefono: tels.filter(t => !esWhatsApp(t)),
        whatsapp: tels.filter(esWhatsApp),
        email: email ? [email.toLowerCase()] : [],
        redesSociales: extraerRedesSociales(links),
        web: web || null,
        fuente: 'OpenStreetMap',
        urlFuente: 'https://www.openstreetmap.org',
        codigoPostal: '1430',
      });
    }
  } catch (err) {
    console.error(`  ⚠️  OpenStreetMap error: ${err.message}`);
  }

  return comercios;
}

async function scrape() {
  const resultados = [];

  console.log('\n  🌍 Scrapeando OpenStreetMap (datos abiertos)...');
  const osm = await scrapeOpenStreetMap();
  resultados.push(...osm);

  console.log('\n  📖 Scrapeando GuiaLocales...');
  const gl = await scrapeGuiaLocales();
  resultados.push(...gl);

  console.log('\n  🏘️  Scrapeando DondeVivimos...');
  const dv = await scrapeDondeVivimos();
  resultados.push(...dv);

  return resultados;
}

module.exports = { scrape };

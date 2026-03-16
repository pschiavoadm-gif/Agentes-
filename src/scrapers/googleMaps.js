/**
 * Scraper de Google Maps via SerpAPI o scraping directo con Puppeteer
 * Busca negocios en el barrio del CP 1430 (Villa del Parque, Devoto, Villa Santa Rita - CABA)
 */

const puppeteer = require('puppeteer');
const { sleep, extraerEmails, extraerTelefonos, extraerRedesSociales, limpiar, esWhatsApp } = require('../utils/helpers');

// Barrios del CP 1430 en CABA
const BARRIOS_1430 = ['Villa del Parque', 'Villa Santa Rita', 'Monte Castro'];

const CATEGORIAS = [
  'restaurante', 'supermercado', 'farmacia', 'ferretería',
  'peluquería', 'veterinaria', 'panadería', 'bar', 'café',
  'kiosco', 'almacén', 'librería', 'ropa', 'calzado',
  'electrónica', 'plomería', 'electricista', 'carpintería',
];

async function scrapeNegocio(page, lugar) {
  const comercio = {
    nombre: limpiar(lugar.nombre),
    rubro: limpiar(lugar.categoria),
    direccion: limpiar(lugar.direccion),
    telefono: [],
    whatsapp: [],
    email: [],
    redesSociales: {},
    web: null,
    fuente: 'Google Maps',
    urlFuente: lugar.url || null,
    codigoPostal: '1430',
    barrio: lugar.barrio || null,
  };

  if (!lugar.url) return comercio;

  try {
    await page.goto(lugar.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const datos = await page.evaluate(() => {
      const texto = document.body.innerText;
      const links = Array.from(document.querySelectorAll('a')).map(a => a.href);

      // Intentar obtener web del panel de Google Maps
      const webEl = document.querySelector('a[data-item-id="authority"]');
      const telEl = document.querySelector('[data-tooltip="Copiar número de teléfono"]');

      return {
        texto,
        links,
        web: webEl?.href || null,
        telefono: telEl?.innerText?.trim() || null,
      };
    });

    comercio.web = datos.web;
    comercio.email = extraerEmails(datos.texto);
    comercio.redesSociales = extraerRedesSociales(datos.links, datos.texto);
    const tels = extraerTelefonos(datos.telefono || datos.texto);
    comercio.whatsapp = tels.filter(esWhatsApp);
    comercio.telefono = tels.filter(t => !esWhatsApp(t));
  } catch (err) {
    console.error(`  ⚠️  Error detalle Google Maps ${comercio.nombre}: ${err.message}`);
  }

  return comercio;
}

async function buscarEnMaps(page, query) {
  const resultados = [];
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    // Scroll para cargar más resultados
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const panel = document.querySelector('[role="feed"]');
        if (panel) panel.scrollTop += 500;
      });
      await sleep(1000);
    }

    const lugares = await page.evaluate(() => {
      const items = document.querySelectorAll('a[href*="/maps/place/"]');
      const vistos = new Set();
      const res = [];

      items.forEach(el => {
        const href = el.href;
        const nombre = el.querySelector('.fontHeadlineSmall, [jstcache]')?.innerText?.trim()
          || el.getAttribute('aria-label')?.trim();

        if (nombre && !vistos.has(nombre)) {
          vistos.add(nombre);
          res.push({ nombre, url: href });
        }
      });

      return res;
    });

    resultados.push(...lugares);
  } catch (err) {
    console.error(`  ⚠️  Error buscando "${query}": ${err.message}`);
  }

  return resultados;
}

async function scrape(opciones = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

  const todosMap = new Map();

  for (const barrio of BARRIOS_1430) {
    for (const categoria of CATEGORIAS) {
      const query = `${categoria} en ${barrio} CABA Buenos Aires`;
      console.log(`\n  🗺️  Google Maps: "${query}"`);

      const lugares = await buscarEnMaps(page, query);
      console.log(`    → ${lugares.length} lugares encontrados`);

      for (const lugar of lugares.slice(0, 10)) {
        lugar.categoria = categoria;
        lugar.barrio = barrio;
        const clave = lugar.nombre;

        if (!todosMap.has(clave)) {
          const comercio = await scrapeNegocio(page, lugar);
          todosMap.set(clave, comercio);
          await sleep(1500);
        }
      }

      await sleep(2500);
    }
  }

  await browser.close();
  return [...todosMap.values()];
}

module.exports = { scrape };

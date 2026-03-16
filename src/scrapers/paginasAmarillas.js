/**
 * Scraper de Páginas Amarillas Argentina
 * URL: https://www.paginasamarillas.com.ar/
 * Busca comercios por código postal 1430
 */

const puppeteer = require('puppeteer');
const { sleep, extraerEmails, extraerTelefonos, extraerRedesSociales, limpiar, esWhatsApp } = require('../utils/helpers');

const BASE_URL = 'https://www.paginasamarillas.com.ar';

async function scrapearPaginaResultados(page, url) {
  const comercios = [];
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    const items = await page.evaluate(() => {
      const resultados = [];
      const cards = document.querySelectorAll('.item-list, .list-item, article.item, .search-result');

      cards.forEach(card => {
        const nombre = card.querySelector('h2, h3, .name, .title')?.innerText?.trim();
        const rubro = card.querySelector('.category, .rubro, .actividad')?.innerText?.trim();
        const direccion = card.querySelector('.address, .direccion, address')?.innerText?.trim();
        const telefono = card.querySelector('.phone, .telefono, [class*="tel"]')?.innerText?.trim();
        const web = card.querySelector('a[href*="http"]:not([href*="paginasamarillas"])')?.href;
        const urlDetalle = card.querySelector('a.name, h2 a, h3 a')?.href;

        if (nombre) {
          resultados.push({ nombre, rubro, direccion, telefono, web, urlDetalle });
        }
      });

      return resultados;
    });

    for (const item of items) {
      const telefonos = extraerTelefonos(item.telefono || '');
      const whatsapps = telefonos.filter(esWhatsApp);
      const tels = telefonos.filter(t => !esWhatsApp(t));

      comercios.push({
        nombre: limpiar(item.nombre),
        rubro: limpiar(item.rubro),
        direccion: limpiar(item.direccion),
        telefono: tels,
        whatsapp: whatsapps,
        email: [],
        redesSociales: item.web ? extraerRedesSociales([item.web]) : {},
        web: item.web || null,
        fuente: 'Páginas Amarillas',
        urlFuente: url,
        codigoPostal: '1430',
      });
    }
  } catch (err) {
    console.error(`  ⚠️  Error en página ${url}: ${err.message}`);
  }
  return comercios;
}

async function scrapeDetalleComercio(page, comercio) {
  if (!comercio.urlDetalle) return comercio;
  try {
    await page.goto(comercio.urlDetalle, { waitUntil: 'networkidle2', timeout: 25000 });
    await sleep(1000);

    const detalle = await page.evaluate(() => {
      const texto = document.body.innerText;
      const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
      return { texto, links };
    });

    comercio.email = extraerEmails(detalle.texto);
    comercio.redesSociales = extraerRedesSociales(detalle.links, detalle.texto);
    const tels = extraerTelefonos(detalle.texto);
    comercio.whatsapp = [...new Set([...comercio.whatsapp, ...tels.filter(esWhatsApp)])];
    comercio.telefono = [...new Set([...comercio.telefono, ...tels.filter(t => !esWhatsApp(t))])];
  } catch (err) {
    console.error(`  ⚠️  Error en detalle ${comercio.nombre}: ${err.message}`);
  }
  return comercio;
}

async function scrape(opciones = {}) {
  const { maxPaginas = 5 } = opciones;
  const rubros = [
    'restaurantes', 'supermercados', 'farmacias', 'ferreterias',
    'peluquerias', 'veterinarias', 'ropa', 'electronica',
    'panaderias', 'bares', 'almacenes', 'kioscos',
  ];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-AR,es;q=0.9' });

  const todosLosComerciosMap = new Map();

  for (const rubro of rubros) {
    console.log(`\n  🔍 Buscando "${rubro}" en CP 1430...`);
    for (let pagina = 1; pagina <= maxPaginas; pagina++) {
      const url = `${BASE_URL}/buscar/${rubro}/todo-el-pais/buenos-aires/caba/1430?page=${pagina}`;
      const resultados = await scrapearPaginaResultados(page, url);

      if (resultados.length === 0) break;

      for (const c of resultados) {
        const clave = `${c.nombre}|${c.direccion}`;
        if (!todosLosComerciosMap.has(clave)) {
          todosLosComerciosMap.set(clave, c);
        }
      }

      console.log(`    📄 Página ${pagina}: ${resultados.length} resultados`);
      await sleep(2000);
    }
  }

  await browser.close();

  return [...todosLosComerciosMap.values()];
}

module.exports = { scrape };

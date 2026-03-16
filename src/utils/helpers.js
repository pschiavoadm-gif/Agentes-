/**
 * Espera N milisegundos (con jitter aleatorio para evitar detección)
 */
function sleep(ms) {
  const jitter = Math.floor(Math.random() * 500);
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
}

/**
 * Extrae emails de un texto
 */
function extraerEmails(texto) {
  if (!texto) return [];
  const regex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = texto.match(regex) || [];
  return [...new Set(matches.map(e => e.toLowerCase()))];
}

/**
 * Extrae teléfonos argentinos de un texto
 */
function extraerTelefonos(texto) {
  if (!texto) return [];
  // Patrones ARG: +54, 011, 15-, etc.
  const regex = /(?:\+?54[-.\s]?)?(?:011[-.\s]?)?(?:15[-.\s]?)?\d{4}[-.\s]?\d{4}|\+?54\s?\d{2,4}\s?\d{6,8}|\(?\d{3,4}\)?[-.\s]?\d{4}[-.\s]?\d{4}/g;
  const matches = texto.match(regex) || [];
  return [...new Set(matches.map(t => t.replace(/\s/g, '').trim()))];
}

/**
 * Detecta si un número de teléfono es WhatsApp (heurística: celulares con 15 o formato móvil)
 */
function esWhatsApp(telefono) {
  return /15|9\s?\d{4}|\+549/.test(telefono);
}

/**
 * Extrae redes sociales de un conjunto de URLs o texto
 */
function extraerRedesSociales(urls = [], texto = '') {
  const redes = {};
  const todo = [...urls, texto].join(' ');

  const patrones = {
    facebook: /facebook\.com\/([A-Za-z0-9._\-]+)/,
    instagram: /instagram\.com\/([A-Za-z0-9._\-]+)/,
    twitter: /(?:twitter|x)\.com\/([A-Za-z0-9._\-]+)/,
    linkedin: /linkedin\.com\/(?:company|in)\/([A-Za-z0-9._\-]+)/,
    youtube: /youtube\.com\/(?:channel\/|@)([A-Za-z0-9._\-]+)/,
    tiktok: /tiktok\.com\/@([A-Za-z0-9._\-]+)/,
  };

  for (const [red, patron] of Object.entries(patrones)) {
    const match = todo.match(patron);
    if (match) {
      redes[red] = match[0];
    }
  }

  return redes;
}

/**
 * Limpia y normaliza un string
 */
function limpiar(str) {
  if (!str) return null;
  return str.replace(/\s+/g, ' ').trim() || null;
}

module.exports = {
  sleep,
  extraerEmails,
  extraerTelefonos,
  esWhatsApp,
  extraerRedesSociales,
  limpiar,
};

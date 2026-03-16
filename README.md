# Scraper de Comercios - CP 1430 CABA

Scraper de comercios/negocios del código postal **1430** de la Ciudad Autónoma de Buenos Aires (barrios: Villa del Parque, Villa Santa Rita, Monte Castro).

## Datos que recopila

| Campo | Descripción |
|-------|-------------|
| `nombre` | Nombre del comercio |
| `rubro` | Categoría/actividad |
| `email` | Emails de contacto |
| `whatsapp` | Números de WhatsApp |
| `telefono` | Teléfonos fijos/móviles |
| `redesSociales` | Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok |
| `direccion` | Dirección postal |
| `barrio` | Barrio dentro del CP 1430 |
| `web` | Sitio web |
| `fuente` | Fuente de datos (OpenStreetMap, PáginasAmarillas, etc.) |

## Fuentes de datos

1. **OpenStreetMap** (Overpass API) - datos abiertos, sin restricciones
2. **Páginas Amarillas Argentina** - scraping con Puppeteer
3. **Google Maps** - scraping con Puppeteer
4. **GuiaLocales / DondeVivimos** - scraping con Axios + Cheerio

## Instalación

```bash
npm install
```

## Configuración

```bash
cp .env.example .env
# Editar .env con tu URI de MongoDB
```

### Variables de entorno

```env
MONGODB_URI=mongodb://localhost:27017/comercios_caba
POSTAL_CODE=1430
DELAY_MS=2000
MAX_CONCURRENT=3
```

## Uso

```bash
# Ejecutar scraper completo
npm start

# Consultar resultados en MongoDB
node src/consultas.js
node src/consultas.js --rubro=restaurante
node src/consultas.js --conEmail
node src/consultas.js --conWhatsapp
node src/consultas.js --conRedes
```

## Estructura del proyecto

```
├── src/
│   ├── index.js              # Runner principal
│   ├── consultas.js          # Consultas a la DB
│   ├── models/
│   │   └── Comercio.js       # Schema MongoDB
│   ├── scrapers/
│   │   ├── guiaLocales.js    # Axios + Cheerio + OSM
│   │   ├── paginasAmarillas.js # Puppeteer
│   │   └── googleMaps.js     # Puppeteer
│   └── utils/
│       ├── db.js             # Conexión MongoDB
│       └── helpers.js        # Utilidades (regex emails, tels, etc.)
├── results/                  # JSONs exportados
├── .env.example
└── package.json
```

## Notas legales

- Este scraper es para uso educativo y de investigación.
- Respetar los `robots.txt` de cada sitio.
- Incluye delays aleatorios para no sobrecargar los servidores.
- Los datos de OpenStreetMap son open data bajo licencia ODbL.

/**
 * Modo DEMO — carga datos de muestra del CP 1430 para probar la DB y consultas
 * Los datos son representativos de los barrios: Villa del Parque, Villa Santa Rita, Monte Castro
 */
require('dotenv').config();
const { db, conectar, desconectar } = require('./utils/db');

const DATOS_DEMO = [
  {
    nombre: 'Panadería San Cayetano',
    rubro: 'Panadería',
    email: ['sancayetano1430@gmail.com'],
    whatsapp: ['+5491156789012'],
    telefono: ['011-4501-2345'],
    redesSociales: { instagram: 'https://instagram.com/pancayetano', facebook: null },
    direccion: 'Av. Beiró 4521, Villa del Parque',
    barrio: 'Villa del Parque',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Farmacia Del Valle',
    rubro: 'Farmacia',
    email: ['farmadelvalle@yahoo.com.ar'],
    whatsapp: ['+5491166001234'],
    telefono: ['011-4523-8877'],
    redesSociales: { instagram: 'https://instagram.com/farmadelvalle', facebook: 'https://facebook.com/farmadelvalle' },
    direccion: 'Argerich 1852, Villa del Parque',
    barrio: 'Villa del Parque',
    web: 'https://www.farmadelvalle.com.ar',
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Veterinaria Patitas Felices',
    rubro: 'Veterinaria',
    email: ['patitasfelices.vet@gmail.com'],
    whatsapp: ['+5491144556677'],
    telefono: ['011-4508-9900'],
    redesSociales: { instagram: 'https://instagram.com/patitasfelices_vet', facebook: 'https://facebook.com/patitasfelices' },
    direccion: 'Francisco Beiró 5102, Monte Castro',
    barrio: 'Monte Castro',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Supermercado El Ahorro',
    rubro: 'Supermercado',
    email: [],
    whatsapp: ['+5491160001234'],
    telefono: ['011-4503-4455'],
    redesSociales: { facebook: 'https://facebook.com/superelahorro1430' },
    direccion: 'Nazca 2301, Villa del Parque',
    barrio: 'Villa del Parque',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Ferretería Don Norberto',
    rubro: 'Ferretería',
    email: ['donnorberto.ferr@gmail.com'],
    whatsapp: [],
    telefono: ['011-4501-7788', '011-4501-7789'],
    redesSociales: {},
    direccion: 'Av. San Martín 6890, Villa Santa Rita',
    barrio: 'Villa Santa Rita',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Pizzería La Gioconda',
    rubro: 'Gastronomía / Pizzería',
    email: ['lagioconda.pizza@hotmail.com'],
    whatsapp: ['+5491152341234'],
    telefono: ['011-4504-3322'],
    redesSociales: {
      instagram: 'https://instagram.com/lagiocondapizza',
      facebook: 'https://facebook.com/lagiocondapizzeria',
    },
    direccion: 'Bahía Blanca 1560, Villa del Parque',
    barrio: 'Villa del Parque',
    web: 'https://www.lagiocondapizza.com.ar',
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Peluquería Estilo & Corte',
    rubro: 'Peluquería',
    email: ['estiloycorte.vdp@gmail.com'],
    whatsapp: ['+5491168990011'],
    telefono: [],
    redesSociales: { instagram: 'https://instagram.com/estiloycortevdp', tiktok: 'https://tiktok.com/@estiloycorte' },
    direccion: 'Boyacá 4302, Villa del Parque',
    barrio: 'Villa del Parque',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Librería El Saber',
    rubro: 'Librería / Papelería',
    email: ['libreriasaber1430@gmail.com'],
    whatsapp: ['+5491134567890'],
    telefono: ['011-4506-1122'],
    redesSociales: { facebook: 'https://facebook.com/libreriaelsaber', instagram: 'https://instagram.com/elsaber_libros' },
    direccion: 'Av. Beiró 5230, Monte Castro',
    barrio: 'Monte Castro',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Centro Médico VDP',
    rubro: 'Salud / Medicina',
    email: ['centromedicovdp@gmail.com', 'turnos@centromedicovdp.com.ar'],
    whatsapp: ['+5491122334455'],
    telefono: ['011-4500-8877'],
    redesSociales: {
      facebook: 'https://facebook.com/centromedicovdp',
      instagram: 'https://instagram.com/centromedicovdp',
    },
    direccion: 'Argerich 2101, Villa del Parque',
    barrio: 'Villa del Parque',
    web: 'https://www.centromedicovdp.com.ar',
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Almacén Don Facundo',
    rubro: 'Almacén',
    email: [],
    whatsapp: ['+5491145678901'],
    telefono: ['011-4509-5544'],
    redesSociales: {},
    direccion: 'Tinogasta 4801, Villa Santa Rita',
    barrio: 'Villa Santa Rita',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Taller Mecánico Ruta Libre',
    rubro: 'Mecánica / Automotriz',
    email: ['rutalibretaller@gmail.com'],
    whatsapp: ['+5491178901234'],
    telefono: ['011-4502-6677'],
    redesSociales: { facebook: 'https://facebook.com/rutalibretaller' },
    direccion: 'Tinogasta 5500, Monte Castro',
    barrio: 'Monte Castro',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Bar El Rincón Porteño',
    rubro: 'Bar / Café',
    email: ['elrinconporteno@gmail.com'],
    whatsapp: ['+5491189012345'],
    telefono: ['011-4511-2233'],
    redesSociales: {
      instagram: 'https://instagram.com/rinconporteno1430',
      facebook: 'https://facebook.com/rinconporteno',
    },
    direccion: 'Av. Nazca 2800, Villa del Parque',
    barrio: 'Villa del Parque',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Gimnasio PowerFit VDP',
    rubro: 'Gimnasio / Fitness',
    email: ['powerfit.vdp@gmail.com'],
    whatsapp: ['+5491190123456'],
    telefono: [],
    redesSociales: {
      instagram: 'https://instagram.com/powerfit_vdp',
      youtube: 'https://youtube.com/@powerfitVDP',
    },
    direccion: 'Gavilán 1800, Villa del Parque',
    barrio: 'Villa del Parque',
    web: 'https://powerfitargentina.com',
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Kiosco y Cigarrería Los Andes',
    rubro: 'Kiosco',
    email: [],
    whatsapp: ['+5491123456789'],
    telefono: ['011-4501-9988'],
    redesSociales: {},
    direccion: 'Argerich 1450, Villa del Parque',
    barrio: 'Villa del Parque',
    web: null,
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
  {
    nombre: 'Instituto Educativo Nuevas Mentes',
    rubro: 'Educación',
    email: ['info@nuevasmentes.edu.ar', 'inscripciones@nuevasmentes.edu.ar'],
    whatsapp: ['+5491112345678'],
    telefono: ['011-4507-3344'],
    redesSociales: {
      facebook: 'https://facebook.com/nuevasmentesVDP',
      instagram: 'https://instagram.com/nuevasmentes_edu',
    },
    direccion: 'Boyacá 5100, Villa Santa Rita',
    barrio: 'Villa Santa Rita',
    web: 'https://www.nuevasmentes.edu.ar',
    codigoPostal: '1430',
    fuente: 'DEMO',
  },
];

function dbInsert(doc) {
  return new Promise((res, rej) => {
    db.findOne({ nombre: doc.nombre, codigoPostal: doc.codigoPostal }, (err, existente) => {
      if (err) return rej(err);
      if (existente) return res('skip');
      db.insert({ ...doc, createdAt: new Date() }, (e) => e ? rej(e) : res('ok'));
    });
  });
}

async function main() {
  await conectar();

  console.log('\n🎭 Cargando datos DEMO del CP 1430 (Villa del Parque, Villa Santa Rita, Monte Castro)...\n');

  let nuevos = 0, existentes = 0;
  for (const item of DATOS_DEMO) {
    const r = await dbInsert(item);
    if (r === 'ok') { nuevos++; console.log(`  ✅ ${item.nombre}`); }
    else { existentes++; console.log(`  ⏩ Ya existe: ${item.nombre}`); }
  }

  console.log(`\n✨ Carga completa: ${nuevos} nuevos, ${existentes} ya existían`);
  console.log('\n💡 Ahora podés consultar:');
  console.log('   node src/consultas.js');
  console.log('   node src/consultas.js --conEmail');
  console.log('   node src/consultas.js --conWhatsapp');
  console.log('   node src/consultas.js --rubro=farmacia\n');

  await desconectar();
}

main().catch(console.error);

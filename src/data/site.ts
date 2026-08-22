export const FUNDACION = 1997;

export const site = {
  nombre: "Tornomatica",
  tagline: "Partes y piezas de precisión",
  telefono: "+56 9 9163 0500",
  telefonoHref: "tel:+56991630500",
  telefono2: "+56 9 9325 3868",
  telefono2Href: "tel:+56993253868",
  whatsapp: "https://wa.me/56991630500",
  email: "info@tornomatica.cl",
  direccion: "San Luis #410, Alto Jahuel, Buin — Santiago, Chile",
  mapa:
    "https://www.google.com/maps/search/?api=1&query=San+Luis+410%2C+Alto+Jahuel%2C+Buin%2C+Chile",
  mapaEmbed:
    "https://www.google.com/maps?q=San+Luis+410%2C+Alto+Jahuel%2C+Buin%2C+Chile&hl=es&z=16&output=embed",
  fundacion: FUNDACION,
  superficie: "240 m²",
};

export const contactos = [
  { rol: "Informaciones", email: "info@tornomatica.cl" },
  { rol: "Gerencia comercial", email: "bego.gredilla@tornomatica.cl" },
  { rol: "Gerencia general", email: "jgredilla@tornomatica.cl" },
];

export const nav = [
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Proceso", href: "/proceso-productivo" },
  { label: "Productos", href: "/productos" },
  { label: "Galería", href: "/galeria" },
  { label: "Contacto", href: "/contacto" },
];

const WP = "https://tornomatica.cl/admin/wp-content/uploads";

export interface Slide {
  src: string;
  alt: string;
  kicker: string;
  titulo: string;
  destacado: string;
  bajada: string;
  cta: { label: string; href: string };
}

export const slides: Slide[] = [
  {
    src: "/hero/hero-1.webp",
    alt: "Bujes de acero y niples de latón mecanizados por Tornomatica",
    kicker: `Desde ${FUNDACION} · Alto Jahuel, Buin`,
    titulo: "Fabricación de partes y piezas",
    destacado: "de precisión",
    bajada:
      "Producción en serie en tornos automáticos de levas y torno CNC, según los requerimientos de cada cliente.",
    cta: { label: "Solicitar cotización", href: "/contacto" },
  },
  {
    src: "/hero/hero-2.jpg",
    alt: "Proceso de torneado",
    kicker: "Proceso productivo",
    titulo: "De tu plano a la pieza",
    destacado: "terminada",
    bajada:
      "Dibujamos la pieza, definimos herramientas y levas, y apruebas la primera muestra antes de la corrida en serie.",
    cta: { label: "Conocer el proceso", href: "/proceso-productivo" },
  },
  {
    src: "/hero/hero-3.jpg",
    alt: "Control dimensional de piezas",
    kicker: "Control de calidad",
    titulo: "Verificación dimensional",
    destacado: "pieza por pieza",
    bajada:
      "Medimos antes, durante y después de la producción. Lo que apruebas en la muestra es lo que recibes en la serie.",
    cta: { label: "Enviar plano", href: "/contacto" },
  },
];

export const pilares = [
  {
    icono: "target",
    titulo: "Fabricación en serie",
    texto:
      "Partes y piezas en tornos automáticos de levas, en aceros y latón mecanizables, según los requerimientos de cada cliente.",
  },
  {
    icono: "bolt",
    titulo: "Proceso automatizado",
    texto:
      "Todo el ciclo está automatizado, incluida la alimentación desde barra larga sujeta por pinzas de apriete: menor costo por pieza en altos volúmenes.",
  },
  {
    icono: "chart",
    titulo: "Ingeniería de proceso",
    texto:
      "Definimos el torneado pieza por pieza: dibujo, herramientas y levas necesarias para su fabricación antes de entrar a producción.",
  },
];

export const proceso = [
  {
    n: "01",
    titulo: "Requerimiento",
    texto: "Recibimos plano, muestra o especificación: material, cantidad y tolerancias.",
  },
  {
    n: "02",
    titulo: "Definición del torneado",
    texto: "Dibujamos la pieza e indicamos herramientas y levas necesarias para fabricarla.",
  },
  {
    n: "03",
    titulo: "Muestra y aprobación",
    texto: "Fabricamos primera pieza, verificamos medidas y la apruebas antes de la serie.",
  },
  {
    n: "04",
    titulo: "Producción y entrega",
    texto: "Corrida en serie con control dimensional y entrega según plazo acordado.",
  },
];

export const equipos = [
  {
    titulo: "Torno CNC",
    img: "/equipos/torno-cnc.jpg",
    texto:
      "Gran precisión (centésimas de milímetro). Procesa aceros, latones, aluminio y plástico hasta Ø300 mm y 350 mm de largo.",
    tags: ["Ø300 mm", "Largo 350 mm", "±0,01 mm"],
  },
  {
    titulo: "Tornos automáticos de levas",
    img: "/galeria/236-1305040211.jpg",
    texto:
      "Producción en serie de alto volumen: una vez ajustadas las levas, el torneado es prácticamente automático y repetible pieza a pieza.",
    tags: ["Producción en serie", "Alto volumen", "Acero / latón"],
  },
];

export type CategoriaGaleria = "piezas" | "maquinas" | "taller";

export interface FotoGaleria {
  src: string;
  alt: string;
  categoria: CategoriaGaleria;
}

export const categoriasGaleria: { valor: CategoriaGaleria | "todas"; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "maquinas", label: "Máquinas" },
  { valor: "piezas", label: "Piezas" },
  { valor: "taller", label: "Taller" },
];

export const galeria: FotoGaleria[] = [
  { src: "/galeria/235-1402279071.jpg", alt: "Piezas mecanizadas", categoria: "piezas" },
  { src: "/galeria/236-1305040211.jpg", alt: "Tornos automáticos de levas Traub", categoria: "maquinas" },
  { src: "/galeria/237-1305040114.jpg", alt: "Torneado", categoria: "maquinas" },
  { src: "/galeria/238-1295963548.jpg", alt: "Control dimensional", categoria: "taller" },
  { src: "/galeria/337-1402279103.jpg", alt: "Pernos y niples mecanizados en serie", categoria: "piezas" },
  { src: "/galeria/333-1402279480-thumb.jpg", alt: "Torno CNC", categoria: "maquinas" },
  { src: "/galeria/240-1305041936-thumb.jpg", alt: "Buje bisagra", categoria: "piezas" },
  { src: "/galeria/piezas-cliente-1.jpg", alt: "Bujes y casquillos de acero mecanizados", categoria: "piezas" },
  { src: "/galeria/piezas-cliente-2.jpg", alt: "Pernos y espárragos de latón mecanizados", categoria: "piezas" },
  { src: "/galeria/piezas-cliente-3.jpg", alt: "Tuercas moleteadas de acero inoxidable", categoria: "piezas" },
  { src: "/galeria/piezas-cliente-4.jpg", alt: "Pernos escalonados mecanizados en serie", categoria: "piezas" },
  { src: "/galeria/piezas-cliente-5.jpg", alt: "Pasadores y ejes cilíndricos mecanizados", categoria: "piezas" },
  { src: "/galeria/taller-1.jpg", alt: "Interior del taller de Tornomatica en Alto Jahuel", categoria: "taller" },
  { src: "/galeria/taller-2.jpg", alt: "Tornos automáticos en línea de producción", categoria: "maquinas" },
  { src: "/galeria/taller-3.jpg", alt: "Torno automático Unamuno en operación", categoria: "maquinas" },
  { src: "/galeria/taller-4.jpg", alt: "Fila de tornos automáticos de levas", categoria: "maquinas" },
  { src: "/galeria/taller-5.jpg", alt: "Vista general del galpón de producción", categoria: "taller" },
  { src: "/galeria/taller-6.jpg", alt: "Tornos automáticos vistos desde el fondo del taller", categoria: "maquinas" },
  { src: "/galeria/taller-7.jpg", alt: "Zona de esmerilado y ajuste de piezas", categoria: "taller" },
  { src: "/galeria/taller-8.jpg", alt: "Torno alimentado con barra de acero", categoria: "maquinas" },
];

/* ---------- Quiénes somos ---------- */

export const sectores = [
  "Minería",
  "Agricultura",
  "Pesca",
  "Industria manufacturera",
  "Agroindustria",
  "Industria petrolera",
  "Línea blanca",
  "Automotriz",
  "Industria alimenticia",
  "Eléctrica",
];

export const fortalezas = [
  {
    icono: "building",
    titulo: `Galpón de ${site.superficie}`,
    texto:
      "Infraestructura propia en Alto Jahuel, dimensionada para producción en serie y almacenamiento de material.",
  },
  {
    icono: "gauge",
    titulo: "Instrumental metrológico",
    texto:
      "Equipamiento de medición que asegura la precisión y la calidad dimensional de cada lote.",
  },
  {
    icono: "users",
    titulo: "Personal técnico calificado",
    texto:
      "Operadores con experiencia en tornos automáticos de levas y programación CNC.",
  },
];

/* ---------- Proceso productivo (detalle) ---------- */

export const procesoDetalle = [
  {
    n: "01",
    titulo: "Requerimiento del cliente",
    texto:
      "Recibimos plano, muestra física o especificación técnica. Definimos material, cantidad, tolerancias y plazo.",
  },
  {
    n: "02",
    titulo: "Definición del torneado",
    texto:
      "Dibujamos la pieza e indicamos las herramientas y las levas necesarias para su fabricación.",
  },
  {
    n: "03",
    titulo: "Programación del torno",
    texto:
      "Instalamos las levas apropiadas y las herramientas adecuadas para la fabricación en tornos automáticos.",
  },
  {
    n: "04",
    titulo: "Fabricación en serie",
    texto:
      "El torneado es prácticamente automático: el operador extrae las piezas y alimenta el torno con una nueva barra cuando la anterior se consume.",
  },
  {
    n: "05",
    titulo: "Procesos complementarios",
    texto:
      "Si la pieza requiere perforaciones o roscas que no se obtienen en el torneado, se ejecutan después en taladros o roscadoras.",
  },
  {
    n: "06",
    titulo: "Control dimensional y entrega",
    texto:
      "Verificamos medidas con instrumental metrológico y despachamos según el plazo acordado.",
  },
];

export const ventajas = [
  "Todo el proceso de trabajo está automatizado, incluida la alimentación de la pieza.",
  "El material se obtiene de una barra larga que se inserta por el cabezal y se sujeta con pinzas de apriete.",
  "La alimentación de la barra necesaria para cada pieza se hace de forma automática.",
  "Menor costo por unidad y repetibilidad constante en volúmenes altos.",
];

/* ---------- Planos descargables ---------- */

/* ---------- Piezas fabricadas ----------
   Los datos de código y material salen de los propios planos.
   Los marcados con `porConfirmar` necesitan que el cliente
   entregue nombre y especificación: el PDF no trae texto legible. */

export interface Pieza {
  nombre: string;
  slug?: string;
  codigo?: string;
  material?: string;
  medida?: string;
  imagen?: string;
  /** Fotos adicionales, aparte de la imagen destacada. */
  imagenes?: string[];
  pdf?: string;
  porConfirmar?: boolean;
}

export const piezas: Pieza[] = [
  {
    nombre: "Tuerca especial 5/16 W",
    codigo: "TE01",
    material: "Acero 12L14",
    medida: "Redondo 19 mm",
    pdf: `${WP}/16.dwg-Model-1.pdf`,
  },
  {
    nombre: "Tubo protector 50 mm",
    material: "Acero resulfurado",
    medida: '3/4"',
    pdf: `${WP}/C__Temp_BGPlot_1184_TUBO-50-MM.dwg-Model-1.pdf`,
  },
  {
    nombre: "Buje bisagra",
    material: "Acero / latón",
    imagen: `${WP}/_portfolio_image/240-1305041936.jpg`,
  },
  {
    nombre: "Distanciador de bujías",
    material: "Acero",
    imagen: `${WP}/_portfolio_image/239-1305042000.jpg`,
  },
  {
    nombre: "Tuerca Renault M12×1,25 H19",
    codigo: "30-RENAUL-M12",
    material: "Acero 12L14",
    medida: "Hex. 19,05 · Red. 27,0",
    pdf: `${WP}/C__Temp_BGPlot_3228_30_RENAULM12.dwg-Model-1.pdf`,
  },
  {
    nombre: "Separador rodamiento",
    codigo: "10050500002",
    material: "Acero resulfurado",
    medida: "Redondo 40 mm",
    pdf: `${WP}/C__Temp_BGPlot_1184_10050500002.dwg-Model-1.pdf`,
  },
  {
    nombre: "Perno Gol imp. M12×1,25",
    codigo: "1067040005",
    material: "Acero 12L14 cromado",
    medida: "Hex. 19 mm",
    pdf: `${WP}/CR.dwg-Model-1.pdf`,
  },
  {
    nombre: "Perno de rueda M12×1,25",
    codigo: "PRU07-PA",
    material: "Acero 12L14 pavonado",
    medida: "Hex. 19 mm",
    pdf: `${WP}/PA.dwg-Model-1.pdf`,
  },
];

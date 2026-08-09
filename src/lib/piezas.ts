/**
 * Origen de datos de las piezas.
 *
 * Estrategia: intenta leer el CPT "pieza" desde WordPress.
 * Si WP no responde (apagado, sin red, o todavía sin piezas cargadas),
 * cae al catálogo estático de `site.ts` y el build igual funciona.
 *
 * Esto corre solo en build time: el sitio publicado es HTML estático.
 */

import { piezas as piezasEstaticas, type Pieza } from "../data/site";

const WP_URL = (import.meta.env.WP_URL ?? "http://tornomatica.local").replace(/\/$/, "");
const TIMEOUT_MS = 4000;

interface WPPieza {
  id: number;
  slug: string;
  title: { rendered: string };
  acf?: {
    codigo?: string;
    material?: string;
    medida?: string;
    acabado?: string;
    // ACF puede devolver la URL, el ID, o el objeto completo del adjunto
    plano_pdf?: string | number | { url?: string };
    destacada?: boolean;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
  };
}

/** Decodifica entidades HTML que WordPress devuelve en los títulos. */
function limpiarTitulo(html: string): string {
  return html
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&#8217;/g, "'")
    .trim();
}

const ACABADOS: Record<string, string> = {
  cromado: "cromado",
  pavonado: "pavonado",
  zincado: "zincado",
};

/** Convierte un texto en slug de URL: minúsculas, sin tildes, con guiones. */
function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Asegura que cada pieza tenga un slug único, usando el título y desambiguando repetidos. */
function asignarSlugs(piezas: Pieza[]): Pieza[] {
  const usados = new Map<string, number>();
  return piezas.map((p) => {
    if (p.slug) return p;
    const base = slugify(p.codigo ? `${p.nombre}-${p.codigo}` : p.nombre) || "pieza";
    const n = usados.get(base) ?? 0;
    usados.set(base, n + 1);
    return { ...p, slug: n === 0 ? base : `${base}-${n + 1}` };
  });
}

function mapear(p: WPPieza): Pieza {
  const acf = p.acf ?? {};
  const media = p._embedded?.["wp:featuredmedia"]?.[0];

  // "Acero 12L14" + acabado "cromado" -> "Acero 12L14 cromado"
  const sufijo = acf.acabado ? ACABADOS[acf.acabado] : undefined;
  const material = [acf.material, sufijo].filter(Boolean).join(" ") || undefined;

  return {
    nombre: limpiarTitulo(p.title.rendered),
    slug: p.slug || undefined,
    codigo: acf.codigo || undefined,
    material,
    medida: acf.medida || undefined,
    imagen: media?.source_url,
    pdf: urlDePlano(acf.plano_pdf),
  };
}

/** Normaliza el campo archivo de ACF, que puede venir en tres formas. */
function urlDePlano(v: WPPieza["acf"] extends infer A ? any : never): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v || undefined;
  if (typeof v === "object" && typeof v.url === "string") return v.url;
  return undefined; // llegó solo el ID: haría falta otra consulta, lo omitimos
}

const QUERY = "per_page=100&_embed&orderby=menu_order&order=asc";

/* Dos formas de llamar a la REST API: la bonita necesita permalinks
   activados; `?rest_route=` funciona siempre. Probamos ambas. */
const ENDPOINTS = [
  `${WP_URL}/wp-json/wp/v2/piezas?${QUERY}`,
  `${WP_URL}/?rest_route=/wp/v2/piezas&${QUERY}`,
];

async function pedir(url: string): Promise<WPPieza[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as WPPieza[];
  } finally {
    clearTimeout(t);
  }
}

export async function getPiezas(): Promise<{ piezas: Pieza[]; origen: "wordpress" | "estatico" }> {
  try {
    let datos: WPPieza[] = [];
    let ultimoError: unknown;

    for (const url of ENDPOINTS) {
      try {
        datos = await pedir(url);
        if (Array.isArray(datos) && datos.length > 0) break;
      } catch (err) {
        ultimoError = err;
      }
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      throw ultimoError ?? new Error("sin piezas publicadas");
    }

    console.log(`[piezas] ${datos.length} desde WordPress`);
    return { piezas: ordenarPorImagen(asignarSlugs(datos.map(mapear))), origen: "wordpress" };
  } catch (err) {
    const motivo = err instanceof Error ? err.message : String(err);
    console.warn(`[piezas] WordPress no disponible (${motivo}) — uso el catálogo estático`);
    return { piezas: ordenarPorImagen(asignarSlugs(piezasEstaticas)), origen: "estatico" };
  }
}

/** Muestra primero las piezas que ya tienen foto; el resto (solo plano) queda al final. */
function ordenarPorImagen(piezas: Pieza[]): Pieza[] {
  return [...piezas].sort((a, b) => Number(!!b.imagen) - Number(!!a.imagen));
}

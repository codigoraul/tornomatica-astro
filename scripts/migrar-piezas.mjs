/**
 * Carga las 9 piezas en WordPress vía REST API.
 *
 * Sube la imagen y el PDF de cada pieza a la biblioteca de medios y crea
 * el post del CPT "pieza" con sus campos ACF.
 *
 * REQUISITOS
 *   1. El mu-plugin wp/tornomatica-piezas.php instalado y ACF activo.
 *   2. Una contraseña de aplicación:
 *      WP admin → Usuarios → tu perfil → Contraseñas de aplicación
 *      → nombre "astro" → Añadir. Copia la clave con espacios y todo.
 *
 * USO
 *   WP_URL=http://tornomatica.local \
 *   WP_USER=raul \
 *   WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx" \
 *   node scripts/migrar-piezas.mjs
 *
 *   Añade --dry-run al final para simular sin escribir nada.
 */

const WP_URL = (process.env.WP_URL ?? "http://tornomatica.local").replace(/\/$/, "");
const WP_USER = process.env.WP_USER;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const DRY = process.argv.includes("--dry-run");

if (!DRY && (!WP_USER || !WP_APP_PASSWORD)) {
  console.error("Faltan WP_USER y WP_APP_PASSWORD. Mira las instrucciones al inicio del archivo.");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
const API = `${WP_URL}/wp-json/wp/v2`;
const WP_VIEJO = "http://www.tornomatica.cl/wp-content/uploads";

/* ------------------------------------------------------------------
 * Datos — copiados de src/data/site.ts
 * Después de la migración, WordPress pasa a ser la fuente de verdad.
 * ------------------------------------------------------------------ */

const PIEZAS = [
  {
    nombre: "Tuerca especial 5/16 W",
    codigo: "TE01",
    material: "Acero 12L14",
    medida: "Redondo 19 mm",
    pdf: `${WP_VIEJO}/16.dwg-Model-1.pdf`,
  },
  {
    nombre: "Tubo protector 50 mm",
    material: "Acero resulfurado",
    medida: '3/4"',
    pdf: `${WP_VIEJO}/C__Temp_BGPlot_1184_TUBO-50-MM.dwg-Model-1.pdf`,
  },
  {
    nombre: "Separador rodamiento",
    codigo: "10050500002",
    material: "Acero resulfurado",
    medida: "Redondo 40 mm",
    pdf: `${WP_VIEJO}/C__Temp_BGPlot_1184_10050500002.dwg-Model-1.pdf`,
  },
  {
    nombre: "Tuerca Renault M12×1,25 H19",
    codigo: "30-RENAUL-M12",
    material: "Acero 12L14",
    medida: "Hex. 19,05 · Red. 27,0",
    pdf: `${WP_VIEJO}/C__Temp_BGPlot_3228_30_RENAULM12.dwg-Model-1.pdf`,
  },
  {
    nombre: "Perno Gol imp. M12×1,25",
    codigo: "1067040005",
    material: "Acero 12L14",
    medida: "Hex. 19 mm",
    acabado: "cromado",
    pdf: `${WP_VIEJO}/CR.dwg-Model-1.pdf`,
  },
  {
    nombre: "Perno de rueda M12×1,25",
    codigo: "PRU07-PA",
    material: "Acero 12L14",
    medida: "Hex. 19 mm",
    acabado: "pavonado",
    pdf: `${WP_VIEJO}/PA.dwg-Model-1.pdf`,
  },
  {
    nombre: "Buje bisagra",
    material: "Acero / latón",
    imagen: `${WP_VIEJO}/_portfolio_image/240-1305041936.jpg`,
    destacada: true,
  },
  {
    nombre: "Distanciador de bujías",
    material: "Acero",
    imagen: `${WP_VIEJO}/_portfolio_image/239-1305042000.jpg`,
  },
];

/* ------------------------------------------------------------------ */

function slug(txt) {
  return txt
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function wp(ruta, opciones = {}) {
  const res = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: { Authorization: AUTH, ...(opciones.headers ?? {}) },
  });
  if (!res.ok) {
    const cuerpo = await res.text();
    throw new Error(`${res.status} ${ruta} — ${cuerpo.slice(0, 300)}`);
  }
  return res.json();
}

/** Descarga un archivo del sitio viejo y lo sube a la biblioteca de medios. */
async function subirMedia(url, nombreBase) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`no pude descargar ${url} (${res.status})`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = url.split(".").pop().split("?")[0].toLowerCase();
  const filename = `${slug(nombreBase)}.${ext}`;
  const tipo = ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`;

  const media = await wp("/media", {
    method: "POST",
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": tipo,
    },
    body: buffer,
  });

  return media.id;
}

async function existe(nombre) {
  const r = await wp(`/piezas?slug=${slug(nombre)}`);
  return r[0]?.id ?? null;
}

/** Comprueba que la autenticación funciona antes de empezar. */
async function comprobarAuth() {
  try {
    const yo = await wp("/users/me");
    console.log(`▶ Autenticado como: ${yo.name} (${yo.slug})\n`);
    return true;
  } catch (err) {
    console.error("\n✗ No pude autenticarme en WordPress.\n");
    console.error(`  ${err.message}\n`);
    console.error("  Revisa esto:");
    console.error("   1. Que WP_USER sea tu nombre de usuario de login (no el nombre visible).");
    console.error("   2. Que la contraseña de aplicación esté entre comillas y completa.");
    console.error("   3. Que el mu-plugin actualizado esté copiado — trae el arreglo de la");
    console.error("      cabecera Authorization, que es lo que suele provocar el 401.\n");
    return false;
  }
}

/* ------------------------------------------------------------------ */

console.log(`\n▶ WordPress: ${WP_URL}`);
console.log(`▶ Piezas a cargar: ${PIEZAS.length}${DRY ? "  (simulación)" : ""}\n`);

if (!DRY && !(await comprobarAuth())) {
  process.exit(1);
}

let creadas = 0;
let saltadas = 0;
let fallidas = 0;

for (const p of PIEZAS) {
  const etiqueta = p.nombre.padEnd(32);

  if (DRY) {
    console.log(`  · ${etiqueta} ${p.codigo ?? "—"}`);
    continue;
  }

  try {
    const yaEsta = await existe(p.nombre);
    if (yaEsta) {
      console.log(`  = ${etiqueta} ya existe (id ${yaEsta})`);
      saltadas++;
      continue;
    }

    let featured;
    if (p.imagen) featured = await subirMedia(p.imagen, p.nombre);

    // ACF espera el ID del adjunto para los campos de tipo archivo, no la URL
    let planoId = null;
    if (p.pdf) planoId = await subirMedia(p.pdf, `plano-${p.nombre}`);

    const post = await wp("/piezas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: p.nombre,
        slug: slug(p.nombre),
        status: "publish",
        ...(featured ? { featured_media: featured } : {}),
        acf: {
          codigo: p.codigo ?? "",
          material: p.material ?? "",
          medida: p.medida ?? "",
          acabado: p.acabado ?? "",
          plano_pdf: planoId,
          destacada: Boolean(p.destacada),
        },
      }),
    });

    console.log(`  ✓ ${etiqueta} id ${post.id}`);
    creadas++;
  } catch (err) {
    console.error(`  ✗ ${etiqueta} ${err.message}`);
    fallidas++;
  }
}

if (!DRY) {
  console.log(`\n─────────────────────────────`);
  console.log(`  creadas: ${creadas}   ya existían: ${saltadas}   con error: ${fallidas}`);
  console.log(`─────────────────────────────\n`);
  console.log(`Revisa en ${WP_URL}/wp-admin/edit.php?post_type=pieza`);
  console.log(`Y comprueba el JSON en ${WP_URL}/wp-json/wp/v2/piezas?_embed\n`);
}

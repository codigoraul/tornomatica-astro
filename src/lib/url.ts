/**
 * Construye rutas respetando el `base` de Astro.
 *
 * En la raíz (`base: "/"`) devuelve la ruta tal cual.
 * En una subcarpeta (`base: "/prueba"`) antepone el prefijo,
 * de modo que "/contacto" se convierte en "/prueba/contacto".
 */

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function ruta(path: string): string {
  // Enlaces externos, anclas, mailto o tel se devuelven sin tocar.
  if (!path.startsWith("/")) return path;
  return `${BASE}${path}` || "/";
}

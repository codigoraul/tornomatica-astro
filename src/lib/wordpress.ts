const WP_URL = import.meta.env.WP_URL ?? "http://tornomatica.local";
const API = `${WP_URL}/wp-json/wp/v2`;

export interface WPRendered {
  rendered: string;
}

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  title: WPRendered;
  excerpt: WPRendered;
  content: WPRendered;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
  };
}

export interface WPPage {
  id: number;
  slug: string;
  title: WPRendered;
  content: WPRendered;
}

async function wpFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Error WordPress API (${res.status}): ${API}${endpoint}`);
  }
  return res.json();
}

export async function getPosts(limit = 10): Promise<WPPost[]> {
  return wpFetch<WPPost[]>(`/posts?per_page=${limit}&_embed`);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>(`/posts?slug=${slug}&_embed`);
  return posts[0] ?? null;
}

export async function getPages(): Promise<WPPage[]> {
  return wpFetch<WPPage[]>(`/pages?per_page=100`);
}

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await wpFetch<WPPage[]>(`/pages?slug=${slug}`);
  return pages[0] ?? null;
}

export function getFeaturedImage(post: WPPost): { url: string; alt: string } | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return { url: media.source_url, alt: media.alt_text || post.title.rendered };
}

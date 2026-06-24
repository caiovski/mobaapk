import { supabase } from '../data/datasources/supabase/client';
import type { DBCustomCategory } from '../db/schema';

export async function fetchActiveCategories(): Promise<DBCustomCategory[]> {
  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export function getProductCategory(product: any, categories: DBCustomCategory[]): string | null {
  if (!product) return null;
  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  for (const cat of categories) {
    if (cat.keywords.some(kw => name.includes(kw.toLowerCase()) || description.includes(kw.toLowerCase()))) {
      return cat.name;
    }
  }
  return null;
}

function normalizeKeywords(cat: DBCustomCategory): string[] {
  const raw = cat.keywords;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const str = raw as string;
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (str.startsWith('{') && str.endsWith('}')) {
      return str.slice(1, -1).split(',').map(k => k.trim()).filter(Boolean);
    }
    return [str];
  }
  return [];
}

export function isProductInCategories(
  product: any,
  categoryNames: string[],
  categories: DBCustomCategory[]
): boolean {
  if (!categoryNames || categoryNames.length === 0) return true;
  if (!product) return false;
  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const selected = categories.filter(c => categoryNames.includes(c.name));
  return selected.some(cat => {
    const keywords = normalizeKeywords(cat);
    return keywords.some(kw => name.includes(kw.toLowerCase()) || description.includes(kw.toLowerCase()));
  });
}

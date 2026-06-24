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

export async function fetchAllCategories(): Promise<DBCustomCategory[]> {
  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  /* istanbul ignore next */ return data || [];
}

export async function createCategory(name: string, keywords: string[]): Promise<DBCustomCategory> {
  const { data, error } = await supabase
    .from('custom_categories')
    .insert({ name, keywords })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, name: string, keywords: string[]): Promise<void> {
  const { error } = await supabase
    .from('custom_categories')
    .update({ name, keywords })
    .eq('id', id);
  if (error) throw error;
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from('custom_categories')
    .update({ active })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
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

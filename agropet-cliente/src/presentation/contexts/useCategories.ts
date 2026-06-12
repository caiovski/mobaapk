import { useState, useEffect, useCallback } from 'react';
import type { DBCustomCategory } from '../../db/schema';
import { fetchActiveCategories } from '../../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<DBCustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const active = await fetchActiveCategories();
      setCategories(active);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { categories, loading, reload: load };
}

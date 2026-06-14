import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DBCustomCategory } from '../../db/schema';
import { fetchActiveCategories } from '../../services/categoryService';

interface CategoriesContextValue {
  categories: DBCustomCategory[];
  loading: boolean;
  reload: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <CategoriesContext.Provider value={{ categories, loading, reload: load }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategoriesContext() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategoriesContext must be used within CategoriesProvider');
  return ctx;
}

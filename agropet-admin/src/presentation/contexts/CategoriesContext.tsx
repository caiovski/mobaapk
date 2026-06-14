import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DBCustomCategory } from '../../db/schema';
import {
  fetchActiveCategories,
  fetchAllCategories,
  createCategory,
  toggleCategoryActive,
  deleteCategory,
} from '../../services/categoryService';

interface CategoriesContextValue {
  categories: DBCustomCategory[];
  allCategories: DBCustomCategory[];
  loading: boolean;
  reload: () => Promise<void>;
  createCategory: (name: string, keywords: string[]) => Promise<void>;
  toggleActive: (id: string, active: boolean) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<DBCustomCategory[]>([]);
  const [allCategories, setAllCategories] = useState<DBCustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [active, all] = await Promise.all([
        fetchActiveCategories(),
        fetchAllCategories(),
      ]);
      setCategories(active);
      setAllCategories(all);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (name: string, keywords: string[]) => {
    await createCategory(name, keywords);
    await load();
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await toggleCategoryActive(id, active);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    await load();
  };

  return (
    <CategoriesContext.Provider value={{
      categories,
      allCategories,
      loading,
      reload: load,
      createCategory: handleCreate,
      toggleActive: handleToggleActive,
      deleteCategory: handleDelete,
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategoriesContext() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategoriesContext must be used within CategoriesProvider');
  return ctx;
}

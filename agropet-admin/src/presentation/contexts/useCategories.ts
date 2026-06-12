import { useState, useEffect, useCallback } from 'react';
import type { DBCustomCategory } from '../../db/schema';
import {
  fetchActiveCategories,
  fetchAllCategories,
  createCategory,
  toggleCategoryActive,
  deleteCategory,
} from '../../services/categoryService';

export function useCategories() {
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

  return {
    categories,
    allCategories,
    loading,
    reload: load,
    createCategory: handleCreate,
    toggleActive: handleToggleActive,
    deleteCategory: handleDelete,
  };
}

import {
  fetchActiveCategories,
  fetchAllCategories,
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
  isProductInCategories,
} from '../../services/categoryService';
import { supabase } from '../../data/datasources/supabase/client';

jest.mock('../../data/datasources/supabase/client', () => {
  const mockChain: any = {};
  const builder = () => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: [], error: null });
      }),
    };
    Object.assign(mockChain, chain);
    return chain;
  };
  return {
    supabase: {
      from: jest.fn(() => builder()),
      rpc: jest.fn(),
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

const mockCategory = { id: 'cat-1', name: 'Rações', keywords: ['ração', 'petisco'], active: true };

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const chain = (supabase.from as jest.Mock)();
    (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
      if (typeof resolve === 'function') resolve({ data: [], error: null });
    });
  });

  describe('fetchActiveCategories', () => {
    it('should return active categories ordered by name', async () => {
      const mockData = [mockCategory];
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: mockData, error: null });
      });
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue(chain) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchActiveCategories();
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('custom_categories');
    });

    it('should throw on error', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((_resolve?: any, reject?: (value: any) => any) => {
        if (typeof reject === 'function') reject({ message: 'DB error' });
        return { data: null, error: { message: 'DB error' } };
      });
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue(chain) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchActiveCategories()).rejects.toEqual({ message: 'DB error' });
    });

    it('should return empty array when data is null', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: null });
      });
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue(chain) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchActiveCategories();
      expect(result).toEqual([]);
    });

    it('should throw on resolved error (line 10)', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: { message: 'Resolved error' } });
      });
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue(chain) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchActiveCategories()).rejects.toEqual({ message: 'Resolved error' });
    });
  });

  describe('fetchAllCategories', () => {
    it('should return all categories ordered by name', async () => {
      const mockData = [mockCategory];
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: mockData, error: null });
      });
      (chain.order as jest.Mock).mockReturnValue(chain);
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchAllCategories();
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((_resolve?: any, reject?: (value: any) => any) => {
        if (typeof reject === 'function') reject({ message: 'DB error' });
        return { data: null, error: { message: 'DB error' } };
      });
      (chain.order as jest.Mock).mockReturnValue(chain);
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchAllCategories()).rejects.toEqual({ message: 'DB error' });
    });

    it('should throw on resolved error (line 19)', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: { message: 'Resolved error' } });
      });
      (chain.order as jest.Mock).mockReturnValue(chain);
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchAllCategories()).rejects.toEqual({ message: 'Resolved error' });
    });
  });

  describe('createCategory', () => {
    it('should create a category and return it', async () => {
      const inserted = { ...mockCategory };
      const chain = (supabase.from as jest.Mock)();
      const singleMock = jest.fn().mockResolvedValue({ data: inserted, error: null });
      (chain.select as jest.Mock).mockReturnValue({ single: singleMock });
      (chain.insert as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ single: singleMock }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await createCategory('Rações', ['ração', 'petisco']);
      expect(result).toEqual(inserted);
      expect(supabase.from).toHaveBeenCalledWith('custom_categories');
    });

    it('should throw on insert error', async () => {
      const chain = (supabase.from as jest.Mock)();
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert error' } });
      (chain.select as jest.Mock).mockReturnValue({ single: singleMock });
      (chain.insert as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ single: singleMock }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(createCategory('Rações', ['ração'])).rejects.toEqual({ message: 'Insert error' });
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const chain = (supabase.from as jest.Mock)();
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      (chain.update as jest.Mock).mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await updateCategory('cat-1', 'New Name', ['new', 'keywords']);
      expect(chain.update).toHaveBeenCalledWith({ name: 'New Name', keywords: ['new', 'keywords'] });
      expect(eqMock).toHaveBeenCalledWith('id', 'cat-1');
    });

    it('should throw on update error', async () => {
      const chain = (supabase.from as jest.Mock)();
      const eqMock = jest.fn().mockResolvedValue({ error: { message: 'Update error' } });
      (chain.update as jest.Mock).mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(updateCategory('cat-1', 'Name', ['kw'])).rejects.toEqual({ message: 'Update error' });
    });
  });

  describe('toggleCategoryActive', () => {
    it('should toggle category active state', async () => {
      const chain = (supabase.from as jest.Mock)();
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      (chain.update as jest.Mock).mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await toggleCategoryActive('cat-1', false);
      expect(chain.update).toHaveBeenCalledWith({ active: false });
      expect(eqMock).toHaveBeenCalledWith('id', 'cat-1');
    });

    it('should throw on update error', async () => {
      const chain = (supabase.from as jest.Mock)();
      const eqMock = jest.fn().mockResolvedValue({ error: { message: 'Update error' } });
      (chain.update as jest.Mock).mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(toggleCategoryActive('cat-1', true)).rejects.toEqual({ message: 'Update error' });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category by id', async () => {
      const chain = (supabase.from as jest.Mock)();
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      (chain.delete as jest.Mock).mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await deleteCategory('cat-1');
      expect(chain.delete).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', 'cat-1');
    });

    it('should throw on delete error', async () => {
      const chain = (supabase.from as jest.Mock)();
      const eqMock = jest.fn().mockResolvedValue({ error: { message: 'Delete error' } });
      (chain.delete as jest.Mock).mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(deleteCategory('cat-1')).rejects.toEqual({ message: 'Delete error' });
    });
  });

  describe('isProductInCategories', () => {
    const categories = [
      { id: '1', name: 'Rações', keywords: ['ração', 'petisco'], active: true },
      { id: '2', name: 'Brinquedos', keywords: ['brinquedo', 'bola'], active: true },
    ];

    it('should return true when categoryNames is empty', () => {
      expect(isProductInCategories({ name: 'Ração' }, [], categories)).toBe(true);
    });

    it('should return true when categoryNames is undefined', () => {
      expect(isProductInCategories({ name: 'Ração' }, undefined as any, categories)).toBe(true);
    });

    it('should return false when product is null', () => {
      expect(isProductInCategories(null, ['Rações'], categories)).toBe(false);
    });

    it('should return false when product is undefined', () => {
      expect(isProductInCategories(undefined, ['Rações'], categories)).toBe(false);
    });

    it('should match product name to category keywords', () => {
      expect(isProductInCategories({ name: 'Ração Premium', description: '' }, ['Rações'], categories)).toBe(true);
    });

    it('should match product description to category keywords', () => {
      expect(isProductInCategories({ name: 'Produto X', description: 'Bola colorida' }, ['Brinquedos'], categories)).toBe(true);
    });

    it('should return false when no keywords match', () => {
      expect(isProductInCategories({ name: 'Gaiola', description: 'Gaiola para pássaros' }, ['Rações'], categories)).toBe(false);
    });
  });
});

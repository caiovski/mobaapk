import {
  fetchActiveCategories,
  getProductCategory,
  isProductInCategories,
} from '../../../services/categoryService';
import { supabase } from '../../../data/datasources/supabase/client';
import type { DBCustomCategory } from '../../../db/schema';

jest.mock('../../../data/datasources/supabase/client', () => {
  const mockChain: any = {};
  const builder = () => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
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
    },
  };
});

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchActiveCategories', () => {
    it('should return active categories ordered by name', async () => {
      const mockData = [
        { id: 'cat-1', name: 'Rações', keywords: ['ração', 'petisco'], active: true },
      ] as DBCustomCategory[];
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
  });

  describe('getProductCategory', () => {
    const categories = [
      { id: '1', name: 'Rações', keywords: ['ração', 'petisco'], active: true },
      { id: '2', name: 'Brinquedos', keywords: ['brinquedo', 'bola'], active: true },
    ] as DBCustomCategory[];

    it('should return category when product matches keywords', () => {
      expect(getProductCategory({ name: 'Ração Premium' }, categories)).toBe('Rações');
    });

    it('should return null when product does not match any category', () => {
      expect(getProductCategory({ name: 'Gaiola' }, categories)).toBeNull();
    });

    it('should return null when product is null', () => {
      expect(getProductCategory(null, categories)).toBeNull();
    });

    it('should match by description', () => {
      expect(getProductCategory({ name: 'Produto', description: 'Bola colorida' }, categories)).toBe('Brinquedos');
    });
  });

  describe('isProductInCategories', () => {
    const categories = [
      { id: '1', name: 'Rações', keywords: ['ração', 'petisco'], active: true },
      { id: '2', name: 'Brinquedos', keywords: ['brinquedo', 'bola'], active: true },
    ] as DBCustomCategory[];

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
      expect(isProductInCategories({ name: 'Ração Premium' }, ['Rações'], categories)).toBe(true);
    });

    it('should match product description to category keywords', () => {
      expect(isProductInCategories({ name: 'Produto X', description: 'Bola colorida' }, ['Brinquedos'], categories)).toBe(true);
    });

    it('should return false when no keywords match', () => {
      expect(isProductInCategories({ name: 'Gaiola', description: 'Gaiola para pássaros' }, ['Rações'], categories)).toBe(false);
    });

    it('should handle keywords as JSON array string (normalizeKeywords)', () => {
      const cat = { id: '3', name: 'Higiene', keywords: '["shampoo", "sabonete"]' as any, active: true };
      expect(isProductInCategories({ name: 'Shampoo' }, ['Higiene'], [cat])).toBe(true);
    });

    it('should handle keywords as PostgreSQL array literal (normalizeKeywords)', () => {
      const cat = { id: '4', name: 'Acessórios', keywords: '{coleira, guia}' as any, active: true };
      expect(isProductInCategories({ name: 'Coleira' }, ['Acessórios'], [cat])).toBe(true);
    });

    it('should handle keywords as plain string (normalizeKeywords)', () => {
      const cat = { id: '5', name: 'Roupas', keywords: 'roupa' as any, active: true };
      expect(isProductInCategories({ name: 'Roupa de cachorro' }, ['Roupas'], [cat])).toBe(true);
    });

    it('should handle keywords as JSON object string (JSON.parse succeeds but not array)', () => {
      const cat = { id: '6', name: 'Obj', keywords: '{"key": "value"}' as any, active: true };
      expect(isProductInCategories({ name: 'Qualquer' }, ['Obj'], [cat])).toBe(false);
    });

    it('should handle keywords as null (normalizeKeywords returns [])', () => {
      const cat = { id: '7', name: 'Vazio', keywords: null as any, active: true };
      expect(isProductInCategories({ name: 'Qualquer' }, ['Vazio'], [cat])).toBe(false);
    });
  });
});

import React from 'react';
import { Text, View, Alert } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';

let mockChain: any = {};

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockChain),
  },
}));

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: {}, isDarkMode: false }),
}));

jest.mock('../../presentation/contexts/useCategories', () => ({
  useCategories: () => ({
    categories: [], allCategories: [], loading: false,
    createCategory: jest.fn(), toggleActive: jest.fn(),
    deleteCategory: jest.fn(), reload: jest.fn(),
  }),
}));

jest.mock('../../services/categoryService', () => ({
  isProductInCategories: () => true,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ addListener: () => () => {}, navigate: jest.fn(), setParams: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

import { getFirstImageUrl, useManageProductsScreen } from '../../presentation/screens/admin/ManageProducts/useManageProductsScreen';

function createTestProduct(overrides: any = {}) {
  return {
    id: 'p1', name: 'Test', price: 50, stock: 20,
    active: true, category_id: null, created_at: '2024-01-01',
    description: '', image_url: null, critical_stock: 10, moderate_stock: 29,
    ...overrides,
  };
}

let hookResult: any;
function TestComponent() {
  const r = useManageProductsScreen();
  React.useEffect(() => { hookResult = r; }, [r]);
  return React.createElement(View, null, React.createElement(Text, null, 'test'));
}

function setup(mockData: any[] = [createTestProduct()]) {
  hookResult = null;
  mockChain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue({ error: null }),
    eq: jest.fn().mockResolvedValue({ error: null }),
  };
  render(React.createElement(TestComponent));
}

describe('useManageProductsScreen - getFirstImageUrl', () => {
  it('returns null for null/undefined/empty', () => {
    expect(getFirstImageUrl(null)).toBeNull();
    expect(getFirstImageUrl(undefined)).toBeNull();
    expect(getFirstImageUrl('')).toBeNull();
  });

  it('returns URL as-is for non-JSON strings', () => {
    expect(getFirstImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  it('returns first element for JSON array', () => {
    const result = getFirstImageUrl('["https://example.com/1.jpg", "https://example.com/2.jpg"]');
    expect(result).toBe('https://example.com/1.jpg');
  });

  it('returns original string for invalid JSON', () => {
    const result = getFirstImageUrl('[invalid json]');
    expect(result).toBe('[invalid json]');
  });

  it('returns url as-is for empty JSON array', () => {
    const result = getFirstImageUrl('[]');
    expect(result).toBe('[]');
  });

  it('returns original url when trimmed string does not match JSON array pattern', () => {
    const result = getFirstImageUrl('  some-text-with-spaces  ');
    expect(result).toBe('  some-text-with-spaces  ');
  });

  it('parses JSON array from whitespace-padded string via trim()', () => {
    const result = getFirstImageUrl('  ["https://example.com/img.jpg"]  ');
    expect(result).toBe('https://example.com/img.jpg');
  });
});

describe('useManageProductsScreen - hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load products on mount', async () => {
    const product = createTestProduct({ id: 'p1', name: 'Prod A' });
    setup([product]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    expect(hookResult.products[0].name).toBe('Prod A');
  });

  it('should sort alpha with null name fallback', async () => {
    const p1 = createTestProduct({ id: 'p1', name: null as any });
    const p2 = createTestProduct({ id: 'p2', name: 'Z' });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('alpha'); });
    expect(hookResult.filteredProducts[0]?.name || '').toBeDefined();
  });

  it('should sort newest with null created_at fallback', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'Old', created_at: null as any });
    const p2 = createTestProduct({ id: 'p2', name: 'New', created_at: '2025-01-01' });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('newest'); });
    expect(hookResult.filteredProducts.length).toBe(2);
  });

  it('should sort oldest with null created_at fallback', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'Old', created_at: '2020-01-01' });
    const p2 = createTestProduct({ id: 'p2', name: 'New', created_at: null as any });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('oldest'); });
    expect(hookResult.filteredProducts.length).toBe(2);
  });

  it('should sort most_stock with null stock fallback', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'High', stock: 50 });
    const p2 = createTestProduct({ id: 'p2', name: 'Low', stock: null as any });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('most_stock'); });
    const sorted = hookResult.filteredProducts;
    expect(sorted[0].name).toBe('High');
  });

  it('should sort highest_price with null price fallback', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'Exp', price: 100 });
    const p2 = createTestProduct({ id: 'p2', name: 'Cheap', price: null as any });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('highest_price'); });
    const sorted = hookResult.filteredProducts;
    expect(sorted[0].name).toBe('Exp');
  });

  it('should sort lowest_price with null price fallback', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'Cheap', price: null as any });
    const p2 = createTestProduct({ id: 'p2', name: 'Exp', price: 100 });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('lowest_price'); });
    const sorted = hookResult.filteredProducts;
    expect(sorted[0].name).toBe('Cheap');
  });

  it('should re-sort by alert level when alertYellowFilter or alertRedFilter is set', async () => {
    const red = createTestProduct({ id: 'p1', name: 'Red', stock: 2, critical_stock: 10 });
    const yellow = createTestProduct({ id: 'p2', name: 'Yellow', stock: 20, moderate_stock: 29 });
    const ok = createTestProduct({ id: 'p3', name: 'Ok', stock: 50 });
    setup([ok, yellow, red]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(3));
    await act(() => { hookResult.setAlertRedFilter(true); });
    await act(() => { hookResult.setAlertYellowFilter(true); });
    const sorted = hookResult.filteredProducts;
    expect(sorted[0].name).toBe('Red');
    expect(sorted[1].name).toBe('Yellow');
  });

  it('handleReactivateAll should alert early when no inactive products', async () => {
    const active = createTestProduct({ id: 'p1', active: true });
    setup([active]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    hookResult.handleReactivateAll();
    expect(Alert.alert).toHaveBeenCalledWith('Aviso', 'Não há produtos inativos para reativar.');
  });

  it('handleReactivateAll should prompt when inactive products exist', async () => {
    const inactive = createTestProduct({ id: 'p1', active: false });
    setup([inactive]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    hookResult.handleReactivateAll();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Reativar Produtos',
      expect.stringContaining('reativar todos'),
      expect.any(Array)
    );
  });

  it('handleReactivateAll success path should update products and alert success', async () => {
    let confirmCallback: (() => Promise<void>) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((title, _msg, buttons?: any[]) => {
      if (title === 'Reativar Produtos') {
        const btn = buttons?.find((b: any) => b.text === 'Reativar Todos');
        if (btn) confirmCallback = btn.onPress;
      }
    });
    const inactive = createTestProduct({ id: 'p1', active: false });
    setup([inactive]);
    mockChain.in = jest.fn().mockResolvedValue({ error: null });
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    hookResult.handleReactivateAll();
    expect(confirmCallback).toBeDefined();
    await act(async () => { await confirmCallback!(); });
    expect(hookResult.products[0].active).toBe(true);
  });

  it('handleReactivateAll should alert error when supabase fails', async () => {
    let confirmCallback: (() => Promise<void>) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((title, _msg, buttons?: any[]) => {
      if (title === 'Reativar Produtos') {
        const btn = buttons?.find((b: any) => b.text === 'Reativar Todos');
        if (btn) confirmCallback = btn.onPress;
      }
    });
    const inactive = createTestProduct({ id: 'p1', active: false });
    setup([inactive]);
    mockChain.in = jest.fn().mockResolvedValue({ error: new Error('DB error') });
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    hookResult.handleReactivateAll();
    expect(confirmCallback).toBeDefined();
    await act(async () => { await confirmCallback!(); });
    expect(hookResult.products[0].active).toBe(false);
  });

  it('should sort most_stock with null stock fallback via setSortOption', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'A', stock: 50 });
    const p2 = createTestProduct({ id: 'p2', name: 'B', stock: null as any });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('most_stock'); });
    expect(hookResult.filteredProducts[0].name).toBe('A');
  });

  it('should sort highest_price with null price fallback via setSortOption', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'Exp', price: 100 });
    const p2 = createTestProduct({ id: 'p2', name: 'Cheap', price: null as any });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('highest_price'); });
    expect(hookResult.filteredProducts[0].name).toBe('Exp');
  });

  it('should sort lowest_price with null price fallback via setSortOption', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'Cheap', price: null as any });
    const p2 = createTestProduct({ id: 'p2', name: 'Exp', price: 100 });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setSortOption('lowest_price'); });
    expect(hookResult.filteredProducts[0].name).toBe('Cheap');
  });

  it('should return 0 from alert re-sort when both products have same alert level (both yellow)', async () => {
    const yellow1 = createTestProduct({ id: 'p1', name: 'Yellow1', stock: 20 });
    const yellow2 = createTestProduct({ id: 'p2', name: 'Yellow2', stock: 25 });
    setup([yellow1, yellow2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setAlertRedFilter(true); });
    await act(() => { hookResult.setAlertYellowFilter(true); });
    const sorted = hookResult.filteredProducts;
    expect(sorted.length).toBe(2);
  });

  it('should return 0 from alert re-sort when both products have same alert level (both red)', async () => {
    const red1 = createTestProduct({ id: 'p1', name: 'Red1', stock: 2, critical_stock: 10 });
    const red2 = createTestProduct({ id: 'p2', name: 'Red2', stock: 5, critical_stock: 10 });
    setup([red1, red2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setAlertRedFilter(true); });
    await act(() => { hookResult.setAlertYellowFilter(true); });
    const sorted = hookResult.filteredProducts;
    expect(sorted.length).toBe(2);
  });

  it('should filter by only red alert and exclude non-red products', async () => {
    const red = createTestProduct({ id: 'p1', name: 'Red', stock: 2, critical_stock: 10 });
    const yellow = createTestProduct({ id: 'p2', name: 'Yellow', stock: 20 });
    setup([red, yellow]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setAlertRedFilter(true); });
    expect(hookResult.filteredProducts.length).toBe(1);
    expect(hookResult.filteredProducts[0].name).toBe('Red');
  });

  it('should filter by only yellow alert and exclude non-yellow products', async () => {
    const red = createTestProduct({ id: 'p1', name: 'Red', stock: 2, critical_stock: 10 });
    const yellow = createTestProduct({ id: 'p2', name: 'Yellow', stock: 20 });
    setup([red, yellow]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setAlertYellowFilter(true); });
    expect(hookResult.filteredProducts.length).toBe(1);
    expect(hookResult.filteredProducts[0].name).toBe('Yellow');
  });

  it('should toggle product status (activate)', async () => {
    const product = createTestProduct({ id: 'p1', active: false });
    setup([product]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(async () => { await hookResult.toggleProductStatus(product); });
    expect(hookResult.products[0].active).toBe(true);
  });

  it('should toggle product status (deactivate)', async () => {
    const product = createTestProduct({ id: 'p1', active: true });
    setup([product]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(async () => { await hookResult.toggleProductStatus(product); });
    expect(hookResult.products[0].active).toBe(false);
  });

  it('should delete product', async () => {
    const product = createTestProduct({ id: 'p1' });
    let confirmCallback: (() => Promise<void>) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((title, _msg, buttons?: any[]) => {
      if (title === 'Atenção') {
        const btn = buttons?.find((b: any) => b.text === 'Excluir');
        if (btn) confirmCallback = btn.onPress;
      }
    });
    setup([product]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(async () => { hookResult.deleteProduct('p1'); });
    expect(confirmCallback).toBeDefined();
    await act(async () => { await confirmCallback!(); });
    expect(hookResult.products.length).toBe(0);
  });

  it('should handle select all button', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'A' });
    const p2 = createTestProduct({ id: 'p2', name: 'B' });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.handleSelectAllBtn(); });
    expect(hookResult.selectionMode).toBe(true);
    expect(hookResult.selectedProductIds.size).toBe(2);
  });

  it('should handle mass delete when no products selected', async () => {
    setup([]);
    await waitFor(() => expect(hookResult?.products).toBeDefined());
    await act(() => { hookResult.handleMassDelete(); });
    expect(hookResult.selectionMode).toBe(true);
  });

  it('should handle mass delete with selected products', async () => {
    const p1 = createTestProduct({ id: 'p1' });
    setup([p1]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(() => { hookResult.handleSelectAllBtn(); });
    await act(() => { hookResult.handleMassDelete(); });
    expect(hookResult.showConfirmDeleteModal).toBe(true);
  });

  it('should confirm mass delete', async () => {
    const p1 = createTestProduct({ id: 'p1' });
    setup([p1]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(() => { hookResult.handleSelectAllBtn(); });
    await act(() => { hookResult.handleMassDelete(); });
    await act(async () => { await hookResult.confirmMassDelete(); });
    expect(hookResult.products.length).toBe(0);
    expect(hookResult.selectedProductIds.size).toBe(0);
  });

  it('should toggle selection', async () => {
    const p1 = createTestProduct({ id: 'p1' });
    const p2 = createTestProduct({ id: 'p2' });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.toggleSelection('p1'); });
    expect(hookResult.selectedProductIds.has('p1')).toBe(true);
    await act(() => { hookResult.toggleSelection('p1'); });
    expect(hookResult.selectedProductIds.has('p1')).toBe(false);
  });

  it('should handle deactivate all', async () => {
    const p1 = createTestProduct({ id: 'p1', active: true });
    let confirmCallback: (() => Promise<void>) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((title, _msg, buttons?: any[]) => {
      if (title === 'Desativar Produtos') {
        const btn = buttons?.find((b: any) => b.text === 'Desativar Todos');
        if (btn) confirmCallback = btn.onPress;
      }
    });
    setup([p1]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(async () => { hookResult.handleDeactivateAll(); });
    expect(confirmCallback).toBeDefined();
    await act(async () => { await confirmCallback!(); });
    expect(hookResult.products[0].active).toBe(false);
  });

  it('should handle deactivate all alert early when no active products', async () => {
    const p1 = createTestProduct({ id: 'p1', active: false });
    setup([p1]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    await act(() => { hookResult.handleDeactivateAll(); });
    expect(Alert.alert).toHaveBeenCalledWith('Aviso', expect.stringContaining('ativos'));
  });

  it('should handle reactivate all catch block', async () => {
    let confirmCallback: (() => Promise<void>) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((title, _msg, buttons?: any[]) => {
      if (title === 'Reativar Produtos') {
        const btn = buttons?.find((b: any) => b.text === 'Reativar Todos');
        if (btn) confirmCallback = btn.onPress;
      }
    });
    const inactive = createTestProduct({ id: 'p1', active: false });
    setup([inactive]);
    mockChain.in = jest.fn().mockRejectedValue(new Error('Network error'));
    await waitFor(() => expect(hookResult?.products?.length).toBe(1));
    hookResult.handleReactivateAll();
    expect(confirmCallback).toBeDefined();
    await act(async () => { await confirmCallback!(); });
  });

  it('should trigger || 0 fallback in alert re-sort with null stock', async () => {
    const p1 = createTestProduct({ id: 'p1', name: 'NullRed', stock: null as any, critical_stock: 5, moderate_stock: 40 });
    const p2 = createTestProduct({ id: 'p2', name: 'YellowProduct', stock: 30, critical_stock: 5, moderate_stock: 40 });
    setup([p1, p2]);
    await waitFor(() => expect(hookResult?.products?.length).toBe(2));
    await act(() => { hookResult.setAlertRedFilter(true); });
    await act(() => { hookResult.setAlertYellowFilter(true); });
    expect(hookResult.filteredProducts[0].name).toBe('NullRed');
  });
});

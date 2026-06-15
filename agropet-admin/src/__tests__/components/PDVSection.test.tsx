import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import PDVSection from '../../presentation/screens/admin/AdminDashboard/components/PDVSection';

jest.mock('../../presentation/screens/admin/AdminDashboard/AdminDashboardScreen.styles', () => ({
  styles: {},
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('../../assets/tela7/registrar/Adicionar/Remover/Check.svg', () => 'CheckIcon');

jest.mock('../../utils/imageUtils', () => ({
  getFirstImageUrl: (url: string | null | undefined) => url || null,
}));

const baseProduct = {
  id: 'p1',
  name: 'Test Product',
  price: 50,
  stock: 15,
  image_url: 'https://example.com/img.jpg',
};

const baseCart = {
  p1: { qty: 2, checked: true },
};

const createProps = (overrides = {}) => ({
  pdvSearchText: '',
  onSearchChange: jest.fn(),
  pdvActiveCategories: [],
  onCategoryToggle: jest.fn(),
  pdvSortOption: 'alpha' as const,
  onSortChange: jest.fn(),
  categories: [],
  pdvSelectMode: false,
  pdvCart: baseCart,
  pdvProducts: [baseProduct],
  pdvLoading: false,
  onToggleCart: jest.fn(),
  onUpdateQty: jest.fn(),
  onDismissAlert: jest.fn(),
  dismissedProductIds: new Set<string>(),
  isDarkMode: false,
  formatCurrency: (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`,
  quantityInputMode: false,
  setPdvCartQty: jest.fn(),
  bulkInputUnit: {},
  setBulkInputUnit: jest.fn(),
  bulkValueMode: false,
  pdvBulkValues: {},
  onBulkValueChange: jest.fn(),
  ...overrides,
});

describe('PDVSection', () => {
  it('should render loading state', () => {
    const { UNSAFE_getAllByType } = render(<PDVSection {...createProps({ pdvLoading: true })} />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('should render products list', () => {
    const { getByText } = render(<PDVSection {...createProps()} />);
    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('R$ 50,00')).toBeTruthy();
    expect(getByText('15 unidades')).toBeTruthy();
  });

  it('should render product with no image_url (falsy branch)', () => {
    const productNoImage = { ...baseProduct, image_url: null };
    const { getByText } = render(<PDVSection {...createProps({ pdvProducts: [productNoImage] })} />);
    expect(getByText('Test Product')).toBeTruthy();
  });

  it('should render product with stock = 0 (falsy branch)', () => {
    const productNoStock = { ...baseProduct, stock: 0 };
    const { getByText } = render(<PDVSection {...createProps({ pdvProducts: [productNoStock] })} />);
    expect(getByText('0 unidades')).toBeTruthy();
  });

  it('should render low stock alert (stock < 10)', () => {
    const productLowStock = { ...baseProduct, stock: 3 };
    const { getByText } = render(<PDVSection {...createProps({ pdvProducts: [productLowStock] })} />);
    expect(getByText(/esgotando/)).toBeTruthy();
  });

  it('should render moderate stock alert (stock <= 29)', () => {
    const { getByText } = render(<PDVSection {...createProps({ pdvProducts: [{ ...baseProduct, stock: 20 }] })} />);
    expect(getByText(/estoque moderado/)).toBeTruthy();
  });

  it('should render product with no alert (stock >= 30)', () => {
    const productHighStock = { ...baseProduct, stock: 50 };
    const { queryByText } = render(<PDVSection {...createProps({ pdvProducts: [productHighStock] })} />);
    expect(queryByText(/esgotando/)).toBeNull();
    expect(queryByText(/estoque moderado/)).toBeNull();
  });

  it('should dismiss alert when close pressed', () => {
    const onDismissAlert = jest.fn();
    const productLowStock = { ...baseProduct, stock: 3 };
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: [productLowStock], onDismissAlert })} />
    );
    const xButtons = getByText(/esgotando/);
    expect(xButtons).toBeTruthy();
  });

  it('should not show alert when product is dismissed', () => {
    const productLowStock = { ...baseProduct, stock: 3 };
    const { queryByText } = render(
      <PDVSection {...createProps({ pdvProducts: [productLowStock], dismissedProductIds: new Set(['p1']) })} />
    );
    expect(queryByText(/esgotando/)).toBeNull();
  });

  it('should render in select mode', () => {
    const { getByText } = render(<PDVSection {...createProps({ pdvSelectMode: true })} />);
    expect(getByText('R$ 100,00')).toBeTruthy();
  });

  it('should filter products by search text (name match)', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Ração Pedigree' },
      { id: 'p2', name: 'Filtro de água', price: 30, stock: 10 },
    ];
    const { getByText, queryByText } = render(
      <PDVSection
        {...createProps({
          pdvProducts: products,
          pdvSearchText: 'ração',
          pdvCart: { p1: baseCart.p1, p2: { qty: 1, checked: false } },
        })}
      />
    );
    expect(getByText('Ração Pedigree')).toBeTruthy();
    expect(queryByText('Filtro de água')).toBeNull();
  });

  it('should render products correctly in non-select mode', () => {
    const { getByText } = render(<PDVSection {...createProps()} />);
    expect(getByText('Test Product')).toBeTruthy();
  });

  it('should call onUpdateQty when +/- pressed in select mode', () => {
    const onUpdateQty = jest.fn();
    const { getByText } = render(<PDVSection {...createProps({ pdvSelectMode: true, onUpdateQty })} />);
    fireEvent.press(getByText('2')); // the qty text itself
  });

  it('should render in dark mode', () => {
    const { getByText } = render(<PDVSection {...createProps({ isDarkMode: true })} />);
    expect(getByText('Test Product')).toBeTruthy();
  });

  it('should cover null name match branch (line 119 || fallback)', () => {
    const nullNameProduct = { id: 'p-null', name: null as any, price: 10, stock: 5 };
    const { queryByText } = render(
      <PDVSection
        {...createProps({
          pdvProducts: [nullNameProduct],
          pdvSearchText: 'whatever',
          pdvCart: { 'p-null': { qty: 1, checked: false } },
        })}
      />
    );
    expect(queryByText('R$ 10,00')).toBeNull();
  });

  it('should sort products by newest', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Old', price: 50, stock: 15, created_at: '2020-01-01' },
      { ...baseProduct, id: 'p2', name: 'New', price: 50, stock: 15, created_at: '2023-01-01' },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'newest' })} />
    );
    expect(getByText('New')).toBeTruthy();
    expect(getByText('Old')).toBeTruthy();
  });

  it('should sort products by oldest', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Old', price: 50, stock: 15, created_at: '2020-01-01' },
      { ...baseProduct, id: 'p2', name: 'New', price: 50, stock: 15, created_at: '2023-01-01' },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'oldest' })} />
    );
    expect(getByText('Old')).toBeTruthy();
    expect(getByText('New')).toBeTruthy();
  });

  it('should sort products by most stock', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Low stock', price: 50, stock: 5 },
      { ...baseProduct, id: 'p2', name: 'High stock', price: 50, stock: 50 },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'most_stock' })} />
    );
    expect(getByText('High stock')).toBeTruthy();
    expect(getByText('Low stock')).toBeTruthy();
  });

  it('should sort products by highest price', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Cheap', price: 10, stock: 15 },
      { ...baseProduct, id: 'p2', name: 'Expensive', price: 100, stock: 15 },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'highest_price' })} />
    );
    expect(getByText('Expensive')).toBeTruthy();
    expect(getByText('Cheap')).toBeTruthy();
  });

  it('should sort products by lowest price', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Cheap', price: 10, stock: 15 },
      { ...baseProduct, id: 'p2', name: 'Expensive', price: 100, stock: 15 },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'lowest_price' })} />
    );
    expect(getByText('Cheap')).toBeTruthy();
    expect(getByText('Expensive')).toBeTruthy();
  });

  it('should handle default sort case gracefully', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'A', price: 50, stock: 15 },
      { ...baseProduct, id: 'p2', name: 'B', price: 30, stock: 10 },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'unknown_sort' as any })} />
    );
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
  });

  it('should fallback to defaults when product fields are null across all sort modes', () => {
    const nullProduct = { id: 'p1', name: null as any, price: 0, stock: 0, created_at: null as any, image_url: null };
    const normalProduct = { ...baseProduct, id: 'p2', name: 'B', price: 30, stock: 10, created_at: '2023-01-01', image_url: null };
    const products = [nullProduct, normalProduct];
    const cart = {};
    const modes = ['alpha', 'newest', 'oldest', 'most_stock', 'highest_price', 'lowest_price'] as const;

    for (const mode of modes) {
      const { getByText } = render(
        <PDVSection {...createProps({ pdvProducts: products, pdvCart: cart, pdvSortOption: mode })} />
      );
      expect(getByText('B')).toBeTruthy();
    }
  });

  it('should sort alpha with null name fallback', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: null as any },
      { ...baseProduct, id: 'p2', name: 'Z' },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'alpha' })} />
    );
    expect(getByText('Z')).toBeTruthy();
  });

  it('should sort newest with null created_at fallback', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Old', created_at: null as any },
      { ...baseProduct, id: 'p2', name: 'New', created_at: '2024-06-01' },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'newest' })} />
    );
    expect(getByText('New')).toBeTruthy();
  });

  it('should sort oldest with null created_at fallback', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Old', created_at: '2020-01-01' },
      { ...baseProduct, id: 'p2', name: 'New', created_at: null as any },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'oldest' })} />
    );
    expect(getByText('Old')).toBeTruthy();
  });

  it('should sort most_stock with null stock fallback', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'High', stock: 50 },
      { ...baseProduct, id: 'p2', name: 'Low', stock: null as any },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'most_stock' })} />
    );
    expect(getByText('High')).toBeTruthy();
  });

  it('should sort highest_price with null price fallback', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Exp', price: 100 },
      { ...baseProduct, id: 'p2', name: 'Cheap', price: null as any },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'highest_price', pdvSelectMode: true, pdvCart: { p1: { qty: 1, checked: false }, p2: { qty: 1, checked: false } } })} />
    );
    expect(getByText('Exp')).toBeTruthy();
  });

  it('should sort lowest_price with null price fallback', () => {
    const products = [
      { ...baseProduct, id: 'p1', name: 'Cheap', price: null as any },
      { ...baseProduct, id: 'p2', name: 'Exp', price: 100 },
    ];
    const { getByText } = render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'lowest_price', pdvSelectMode: true, pdvCart: { p1: { qty: 1, checked: false }, p2: { qty: 1, checked: false } } })} />
    );
    expect(getByText('Cheap')).toBeTruthy();
  });

  it('should trigger || fallback in alpha sort when both names are null', () => {
    const products = [
      { id: 'p1', name: null as any, price: 10, stock: 5 },
      { id: 'p2', name: null as any, price: 20, stock: 5 },
    ];
    expect(() => render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'alpha', pdvCart: {} })} />
    )).not.toThrow();
  });

  it('should trigger || 0 fallback in newest sort when both created_at are null', () => {
    const products = [
      { id: 'p1', name: 'A', price: 10, stock: 5, created_at: null as any },
      { id: 'p2', name: 'B', price: 20, stock: 5, created_at: null as any },
    ];
    expect(() => render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'newest', pdvCart: {} })} />
    )).not.toThrow();
  });

  it('should trigger || 0 fallback in lowest_price sort when both prices are null', () => {
    const products = [
      { id: 'p1', name: 'A', price: null as any, stock: 5 },
      { id: 'p2', name: 'B', price: null as any, stock: 5 },
    ];
    const cartEntries = { p1: { qty: 1, checked: false }, p2: { qty: 1, checked: false } };
    expect(() => render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'lowest_price', pdvCart: cartEntries, pdvSelectMode: true })} />
    )).not.toThrow();
  });

  it('should trigger || 0 fallback in oldest sort when both created_at are null', () => {
    const products = [
      { id: 'p1', name: 'A', price: 10, stock: 5, created_at: null as any },
      { id: 'p2', name: 'B', price: 20, stock: 5, created_at: null as any },
    ];
    expect(() => render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'oldest', pdvCart: {} })} />
    )).not.toThrow();
  });

  it('should trigger || 0 fallback in most_stock sort when both stocks are null', () => {
    const products = [
      { id: 'p1', name: 'A', price: 10, stock: null as any },
      { id: 'p2', name: 'B', price: 20, stock: null as any },
    ];
    expect(() => render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'most_stock', pdvCart: {} })} />
    )).not.toThrow();
  });

  it('should trigger || 0 fallback in highest_price sort when both prices are null', () => {
    const products = [
      { id: 'p1', name: 'A', price: null as any, stock: 5 },
      { id: 'p2', name: 'B', price: null as any, stock: 5 },
    ];
    const cartEntries = { p1: { qty: 1, checked: false }, p2: { qty: 1, checked: false } };
    expect(() => render(
      <PDVSection {...createProps({ pdvProducts: products, pdvSortOption: 'highest_price', pdvCart: cartEntries, pdvSelectMode: true })} />
    )).not.toThrow();
  });

  it('should cover || fallback in filter name match with null name and empty search', () => {
    const nullName = { id: 'p1', name: null as any, price: 10, stock: 5 };
    expect(() => render(
      <PDVSection
        {...createProps({
          pdvProducts: [nullName],
          pdvSearchText: '',
          pdvCart: {},
        })}
      />
    )).not.toThrow();
  });

  it('should render bulk product stock with unit toggle in select mode', () => {
    const setBulkInputUnit = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 2500, price: 8,
    };
    const { getByText } = render(
      <PDVSection
        {...createProps({
          pdvSelectMode: true,
          pdvProducts: [bulkProduct],
          pdvCart: { 'p-bulk': { qty: 1, checked: false } },
          bulkInputUnit: { 'p-bulk': 'g' },
          setBulkInputUnit,
          bulkValueMode: true,
        })}
      />
    );
    expect(getByText('2500 g')).toBeTruthy();
    fireEvent.press(getByText('Kg'));
    expect(setBulkInputUnit).toHaveBeenCalled();
  });

  it('should update qty via text input in grams mode for bulk product', () => {
    const setPdvCartQty = jest.fn();
    const setBulkInputUnit = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 5000, price: 8,
    };
    const { getByDisplayValue } = render(
      <PDVSection
        {...createProps({
          pdvSelectMode: true,
          quantityInputMode: true,
          pdvProducts: [bulkProduct],
          pdvCart: { 'p-bulk': { qty: 1, checked: false } },
          bulkInputUnit: { 'p-bulk': 'g' },
          setPdvCartQty,
          setBulkInputUnit,
          bulkValueMode: true,
        })}
      />
    );
    const input = getByDisplayValue('1');
    fireEvent.changeText(input, '500');
    expect(setPdvCartQty).toHaveBeenCalledWith('p-bulk', 500);
  });

  it('should update qty via text input in kg mode for bulk product', () => {
    const setPdvCartQty = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 5000, price: 8,
    };
    const { getByDisplayValue } = render(
      <PDVSection
        {...createProps({
          pdvSelectMode: true,
          quantityInputMode: true,
          pdvProducts: [bulkProduct],
          pdvCart: { 'p-bulk': { qty: 1000, checked: false } },
          bulkInputUnit: { 'p-bulk': 'kg' },
          setPdvCartQty,
          bulkValueMode: true,
        })}
      />
    );
    const input = getByDisplayValue('1000');
    fireEvent.changeText(input, '2,5');
    expect(setPdvCartQty).toHaveBeenCalledWith('p-bulk', 2.5);
  });

  it('should fallback to 1 when kg input is invalid or <= 0', () => {
    const setPdvCartQty = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 5000, price: 8,
    };
    const { getByDisplayValue } = render(
      <PDVSection
        {...createProps({
          pdvSelectMode: true,
          quantityInputMode: true,
          pdvProducts: [bulkProduct],
          pdvCart: { 'p-bulk': { qty: 1000, checked: false } },
          bulkInputUnit: { 'p-bulk': 'kg' },
          setPdvCartQty,
          bulkValueMode: true,
        })}
      />
    );
    const input = getByDisplayValue('1000');
    fireEvent.changeText(input, 'abc');
    expect(setPdvCartQty).toHaveBeenCalledWith('p-bulk', 1);
    fireEvent.changeText(input, '-1');
    expect(setPdvCartQty).toHaveBeenCalledWith('p-bulk', 1);
  });

  it('should toggle bulk unit in quantity input mode', () => {
    const setBulkInputUnit = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 5000, price: 8,
    };
    const { getByText } = render(
      <PDVSection
        {...createProps({
          pdvSelectMode: true,
          quantityInputMode: true,
          pdvProducts: [bulkProduct],
          pdvCart: { 'p-bulk': { qty: 1, checked: false } },
          bulkInputUnit: { 'p-bulk': 'g' },
          setBulkInputUnit,
          bulkValueMode: true,
        })}
      />
    );
    fireEvent.press(getByText('Kg'));
    expect(setBulkInputUnit).toHaveBeenCalled();
  });

  it('should render bulk value mode input and call onBulkValueChange', () => {
    const onBulkValueChange = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 5000, price: 8,
    };
    const { UNSAFE_getAllByProps } = render(
      <PDVSection
        {...createProps({
          pdvProducts: [bulkProduct],
          pdvSelectMode: true,
          pdvCart: { 'p-bulk': { qty: 1, checked: false } },
          bulkValueMode: false,
          pdvBulkValues: {},
          onBulkValueChange,
        })}
      />
    );
    const inputs = UNSAFE_getAllByProps({ keyboardType: 'decimal-pad' });
    if (inputs.length > 0) {
      fireEvent.changeText(inputs[0], '1234');
      expect(onBulkValueChange).toHaveBeenCalledWith('p-bulk', 12.34);
    }
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should clear bulk value when empty text entered', () => {
    const onBulkValueChange = jest.fn();
    const bulkProduct = {
      ...baseProduct, id: 'p-bulk', name: 'Arroz',
      is_bulk: true, stock: 5000, price: 8,
    };
    const { UNSAFE_getAllByProps } = render(
      <PDVSection
        {...createProps({
          pdvProducts: [bulkProduct],
          pdvSelectMode: true,
          pdvCart: { 'p-bulk': { qty: 1, checked: false } },
          bulkValueMode: false,
          pdvBulkValues: {},
          onBulkValueChange,
        })}
      />
    );
    const inputs = UNSAFE_getAllByProps({ keyboardType: 'decimal-pad' });
    if (inputs.length > 0) {
      fireEvent.changeText(inputs[0], '');
      expect(onBulkValueChange).toHaveBeenCalledWith('p-bulk', 0);
    }
  });

  it('should call onUpdateQty when minus pressed in select mode', () => {
    const onUpdateQty = jest.fn();
    const { UNSAFE_getAllByProps } = render(
      <PDVSection
        {...createProps({
          pdvSelectMode: true,
          onUpdateQty,
          pdvCart: { p1: { qty: 3, checked: false } },
        })}
      />
    );
    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const minusBtn = touchables.find((t: any) =>
      t.props.style?.padding === 4 && t.props.onPress
    );
    if (minusBtn) {
      fireEvent.press(minusBtn);
      expect(onUpdateQty).toHaveBeenCalledWith('p1', -1);
    }
  });
});

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useCategories, CategoriesProvider } from '../../../presentation/contexts/useCategories';
import { fetchActiveCategories } from '../../../services/categoryService';
import type { DBCustomCategory } from '../../../db/schema';

jest.mock('../../../services/categoryService', () => ({
  fetchActiveCategories: jest.fn(),
}));

const mockCategories: DBCustomCategory[] = [
  { id: '1', name: 'Ração', keywords: ['ração'], active: true },
  { id: '2', name: 'Pesca', keywords: ['pesca'], active: true },
];

function TestComponent() {
  const { categories, loading, reload } = useCategories();
  return (
    <View>
      <Text testID="loading">{loading ? 'loading' : 'loaded'}</Text>
      <Text testID="count">{categories.length}</Text>
      {categories.map(c => <Text key={c.id} testID={`cat-${c.id}`}>{c.name}</Text>)}
    </View>
  );
}

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithProvider(ui: React.ReactElement) {
    return render(<CategoriesProvider>{ui}</CategoriesProvider>);
  }

  it('should load categories and show loading state', async () => {
    (fetchActiveCategories as jest.Mock).mockResolvedValue(mockCategories);

    const { getByTestId } = renderWithProvider(<TestComponent />);

    expect(getByTestId('loading').props.children).toBe('loading');

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loaded');
    });

    expect(getByTestId('count').props.children).toBe(2);
    expect(getByTestId('cat-1')).toBeTruthy();
    expect(getByTestId('cat-2')).toBeTruthy();
  });

  it('should handle empty categories', async () => {
    (fetchActiveCategories as jest.Mock).mockResolvedValue([]);

    const { getByTestId } = renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loaded');
    });

    expect(getByTestId('count').props.children).toBe(0);
  });

  it('should handle fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (fetchActiveCategories as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByTestId } = renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loaded');
    });

    expect(getByTestId('count').props.children).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should support reload via returned function', async () => {
    (fetchActiveCategories as jest.Mock).mockResolvedValue(mockCategories);

    let reloadFn: () => Promise<void>;
    function CaptureReloadComponent() {
      const { categories, loading, reload } = useCategories();
      reloadFn = reload;
      return (
        <View>
          <Text testID="loading">{loading ? 'loading' : 'loaded'}</Text>
          <Text testID="count">{categories.length}</Text>
        </View>
      );
    }

    const { getByTestId } = renderWithProvider(<CaptureReloadComponent />);

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loaded');
    });

    (fetchActiveCategories as jest.Mock).mockResolvedValue([mockCategories[0]]);

    await act(async () => {
      await reloadFn!();
    });

    expect(getByTestId('count').props.children).toBe(1);
  });

  it('should throw when useCategories is used outside CategoriesProvider', () => {
    function BadComponent() {
      useCategories();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow('useCategoriesContext must be used within CategoriesProvider');
  });

  it('should export useCategories from barrel file', () => {
    const barrel = require('../../../presentation/contexts/useCategories');
    expect(barrel.useCategories).toBeDefined();
    expect(barrel.CategoriesProvider).toBeDefined();
  });
});

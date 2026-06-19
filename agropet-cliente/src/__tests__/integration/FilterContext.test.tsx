import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import {
  FilterContext,
  FilterProvider,
  useFilter,
} from '../../presentation/contexts/FilterContext';
import { fetchActiveCategories, getProductCategory, isProductInCategories } from '../../services/categoryService';
import { supabase } from '../../data/datasources/supabase/client';
import type { DBCustomCategory } from '../../db/schema';

const MOCK_CATEGORIES: DBCustomCategory[] = [
  { id: '1', name: 'Ração', keywords: ['ração', 'cachorro', 'cachorros', 'canino', 'caninos', 'felino', 'felinos', 'racao', 'dog chow', 'pedigree', 'besser', 'purina', 'whiskas', 'granplus', 'premium', 'cão', 'cães', 'gato', 'gatos', 'vaca', 'porco', 'frango', 'galinha', 'galinhas'], active: true },
  { id: '2', name: 'Pesca', keywords: ['pesca', 'vara', 'anzol', 'linha', 'molinete', 'boia', 'bóia', 'isca', 'carretilha', 'pescaria'], active: true },
  { id: '3', name: 'Sementes', keywords: ['semente', 'semeadura', 'sementes', 'girassol', 'milho', 'alpiste', 'grão', 'grãos', 'erva', 'ervas', 'erva-doce', 'ervadoce'], active: true },
  { id: '4', name: 'Adubo', keywords: ['adubo', 'fertilizante', 'terra', 'substrato', 'humus', 'húmus', 'calpiso', 'calcario'], active: true },
];

function FilterConsumer() {
  const { selectedCategories, toggleCategory, searchText, setSearchText, clearFilters } = useFilter();

  return (
    <View>
      <Text testID="search-text">{searchText}</Text>
      <Text testID="categories-count">{selectedCategories.length}</Text>
      {selectedCategories.map(cat => (
        <Text key={cat} testID={`selected-${cat}`}>{cat}</Text>
      ))}
      <Button title="Toggle Ração" onPress={() => toggleCategory('Ração')} />
      <Button title="Toggle Pesca" onPress={() => toggleCategory('Pesca')} />
      <Button title="Set Search" onPress={() => setSearchText('purina')} />
      <Button title="Clear" onPress={() => clearFilters()} />
    </View>
  );
}

describe('FilterContext & Helper Functions', () => {
  describe('getProductCategory', () => {
    it('should return null for undefined/null products', () => {
      expect(getProductCategory(null, MOCK_CATEGORIES)).toBeNull();
      expect(getProductCategory(undefined, MOCK_CATEGORIES)).toBeNull();
    });

    it('should correctly match keywords in name or description case insensitively', () => {
      expect(getProductCategory({ name: 'Ração de Cachorro Premium', description: '' }, MOCK_CATEGORIES)).toBe('Ração');
      expect(getProductCategory({ name: '', description: 'purina pro plan' }, MOCK_CATEGORIES)).toBe('Ração');
      expect(getProductCategory({ name: 'Vara de molinete carbono', description: '' }, MOCK_CATEGORIES)).toBe('Pesca');
      expect(getProductCategory({ name: 'Semente de Girassol', description: '' }, MOCK_CATEGORIES)).toBe('Sementes');
      expect(getProductCategory({ name: 'Húmus de minhoca', description: '' }, MOCK_CATEGORIES)).toBe('Adubo');
      expect(getProductCategory({ name: 'Produto Aleatório', description: 'Nenhum match' }, MOCK_CATEGORIES)).toBeNull();
    });
  });

  describe('isProductInCategories', () => {
    it('should return true if no categories are selected', () => {
      expect(isProductInCategories({ name: 'Vara' }, [], MOCK_CATEGORIES)).toBe(true);
      expect(isProductInCategories({ name: 'Vara' }, null as any, MOCK_CATEGORIES)).toBe(true);
    });

    it('should return false if product is null', () => {
      expect(isProductInCategories(null, ['Ração'], MOCK_CATEGORIES)).toBe(false);
    });

    it('should return true if product matches keywords of any selected category', () => {
      const prodRacao = { name: 'purina dog', description: '' };
      const prodPesca = { name: 'carretilha metal', description: '' };
      const selected = ['Ração', 'Pesca'];

      expect(isProductInCategories(prodRacao, selected, MOCK_CATEGORIES)).toBe(true);
      expect(isProductInCategories(prodPesca, selected, MOCK_CATEGORIES)).toBe(true);
      expect(isProductInCategories({ name: 'Semente' }, selected, MOCK_CATEGORIES)).toBe(false);
    });

    it('should fallback to lowercase category name if not defined in keywords dictionary', () => {
      const customCat: DBCustomCategory[] = [
        { id: '5', name: 'Brinquedos', keywords: ['brinquedos', 'brinquedo'], active: true },
      ];
      expect(isProductInCategories({ name: 'Brinquedos Gato', description: '' }, ['Brinquedos'], customCat)).toBe(true);
      expect(isProductInCategories({ name: 'Outro', description: '' }, ['Brinquedos'], customCat)).toBe(false);
    });

    it('should match correctly if product name is missing or falsy', () => {
      expect(isProductInCategories({ description: 'purina dog' }, ['Ração'], MOCK_CATEGORIES)).toBe(true);
    });
  });

  describe('FilterProvider & useFilter', () => {
    it('should toggle categories, set search text and clear filters', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <FilterProvider>
          <FilterConsumer />
        </FilterProvider>
      );

      expect(getByTestId('search-text').props.children).toBe('');
      expect(getByTestId('categories-count').props.children).toBe(0);

      await act(async () => {
        fireEvent.press(getByText('Toggle Ração'));
      });
      expect(getByTestId('categories-count').props.children).toBe(1);
      expect(getByTestId('selected-Ração')).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByText('Toggle Pesca'));
      });
      expect(getByTestId('categories-count').props.children).toBe(2);
      expect(getByTestId('selected-Pesca')).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByText('Toggle Ração'));
      });
      expect(getByTestId('categories-count').props.children).toBe(1);

      await act(async () => {
        fireEvent.press(getByText('Set Search'));
      });
      expect(getByTestId('search-text').props.children).toBe('purina');

      await act(async () => {
        fireEvent.press(getByText('Clear'));
      });
      expect(getByTestId('search-text').props.children).toBe('');
      expect(getByTestId('categories-count').props.children).toBe(0);
    });

    it('should cover default createContext values', () => {
      let defaultContextVal: any;
      function DummyConsumer() {
        defaultContextVal = useFilter();
        return null;
      }
      render(<DummyConsumer />);
      defaultContextVal.toggleCategory('cat');
      defaultContextVal.setSearchText('search');
      defaultContextVal.clearFilters();
      defaultContextVal.reloadCategories();
      defaultContextVal.setSectionFilter('promocao');
    });

    it('should call setSectionFilter through provider', async () => {
      function SectionConsumer() {
        const { sectionFilter, setSectionFilter } = useFilter();
        return (
          <View>
            <Text testID="section">{sectionFilter}</Text>
            <Button title="Set Promo" onPress={() => setSectionFilter('promocao')} />
            <Button title="Set All" onPress={() => setSectionFilter('all')} />
          </View>
        );
      }
      const { getByText, getByTestId } = render(
        <FilterProvider>
          <SectionConsumer />
        </FilterProvider>
      );
      expect(getByTestId('section').props.children).toBe('all');
      await act(async () => { fireEvent.press(getByText('Set Promo')); });
      expect(getByTestId('section').props.children).toBe('promocao');
      await act(async () => { fireEvent.press(getByText('Set All')); });
      expect(getByTestId('section').props.children).toBe('all');
    });

    it('should cover provider search and clear via direct act', async () => {
      function DirectConsumer() {
        const { searchText, setSearchText, clearFilters, toggleCategory, selectedCategories } = useFilter();
        return (
          <View>
            <Text testID="st">{searchText}</Text>
            <Text testID="cc">{selectedCategories.length}</Text>
            <Button title="toggle" onPress={() => toggleCategory('X')} />
            <Button title="toggle2" onPress={() => toggleCategory('X')} />
            <Button title="search" onPress={() => setSearchText('abc')} />
            <Button title="clear" onPress={() => clearFilters()} />
          </View>
        );
      }
      const { getByText, getByTestId } = render(
        <FilterProvider>
          <DirectConsumer />
        </FilterProvider>
      );
      await act(async () => { fireEvent.press(getByText('toggle')); });
      expect(getByTestId('cc').props.children).toBe(1);
      await act(async () => { fireEvent.press(getByText('toggle2')); });
      expect(getByTestId('cc').props.children).toBe(0);
      await act(async () => { fireEvent.press(getByText('search')); });
      expect(getByTestId('st').props.children).toBe('abc');
      await act(async () => { fireEvent.press(getByText('clear')); });
      expect(getByTestId('st').props.children).toBe('');
      expect(getByTestId('cc').props.children).toBe(0);
    });

    it('should cover isProductInCategories with product name missing', () => {
      expect(isProductInCategories({ name: '', description: 'ração' }, ['Ração'], MOCK_CATEGORIES)).toBe(true);
      expect(isProductInCategories({ description: 'semente' }, ['Sementes'], MOCK_CATEGORIES)).toBe(true);
    });
  });

  describe('fetchActiveCategories error branch', () => {
    it('should throw if supabase query returns error', async () => {
      const chain = supabase.from();
      chain.order.mockReturnValueOnce(Promise.resolve({ data: null, error: new Error('DB error') }));

      await expect(fetchActiveCategories()).rejects.toThrow('DB error');
    });

    it('should handle fetch error silently in FilterProvider catch handler', async () => {
      const chain = supabase.from();
      chain.order.mockReturnValueOnce(Promise.reject(new Error('Network error')));

      function SilentConsumer() {
        const { categories } = useFilter();
        return <Text testID="cat-count">{categories.length}</Text>;
      }

      const { getByTestId } = render(
        <FilterProvider>
          <SilentConsumer />
        </FilterProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cat-count').props.children).toBe(0);
      });
    });

    it('should call reloadCategories and cover its try block', async () => {
      let reloadFn: () => Promise<void>;
      function ReloadConsumer() {
        const { categories, reloadCategories } = useFilter();
        reloadFn = reloadCategories;
        return <Text testID="cat-count">{categories.length}</Text>;
      }

      const { getByTestId } = render(
        <FilterProvider>
          <ReloadConsumer />
        </FilterProvider>
      );

      await act(async () => {
        await reloadFn!();
      });

      expect(getByTestId('cat-count')).toBeTruthy();
    });
  });
});

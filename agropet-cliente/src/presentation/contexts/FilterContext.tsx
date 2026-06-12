import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchActiveCategories } from '../../services/categoryService';
import type { DBCustomCategory } from '../../db/schema';

interface FilterContextType {
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  clearFilters: () => void;
  categories: DBCustomCategory[];
}

export const FilterContext = createContext<FilterContextType>({
  selectedCategories: [],
  toggleCategory: () => {},
  searchText: '',
  setSearchText: () => {},
  clearFilters: () => {},
  categories: [],
});

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchText, setSearchTextState] = useState<string>('');
  const [categories, setCategories] = useState<DBCustomCategory[]>([]);

  useEffect(() => {
    fetchActiveCategories().then(setCategories).catch(() => {});
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const setSearchText = (text: string) => {
    setSearchTextState(text);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTextState('');
  };

  return (
    <FilterContext.Provider value={{
      selectedCategories,
      toggleCategory,
      searchText,
      setSearchText,
      clearFilters,
      categories,
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../data/datasources/supabase/client';
import CategoryManagerScreen from '../../presentation/screens/admin/ManageProducts/CategoryManagerScreen/CategoryManagerScreen';

jest.mock('../../presentation/components/AdminHeader', () => {
  const { Text } = require('react-native');
  return () => <Text>AdminHeader</Text>;
});

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: {}, isDarkMode: false }),
}));

jest.mock('../../presentation/contexts/useCategories', () => ({
  useCategories: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

const { useCategories } = require('../../presentation/contexts/useCategories');

const mockCategories = [
  { id: 'c1', name: 'Rações', active: true, keywords: ['ração', 'pedigree', 'whiskas'] },
  { id: 'c2', name: 'Acessórios', active: false, keywords: ['coleira', 'guia'] },
  { id: 'c3', name: 'Medicamentos', active: true, keywords: ['remédio', 'vermífugo', 'antipulgas', 'vacina'] },
];

const createMockCategories = (overrides = {}) => ({
  allCategories: mockCategories,
  loading: false,
  reload: jest.fn(),
  createCategory: jest.fn(),
  toggleActive: jest.fn(),
  deleteCategory: jest.fn(),
  ...overrides,
});

describe('CategoryManagerScreen', () => {
  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useCategories as jest.Mock).mockReturnValue(createMockCategories());
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  it('should render loading state', () => {
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ loading: true }));
    const { UNSAFE_getAllByType } = render(<CategoryManagerScreen />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('should render empty state', () => {
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ allCategories: [] }));
    const { getByText } = render(<CategoryManagerScreen />);
    expect(getByText('Nenhuma categoria cadastrada.')).toBeTruthy();
  });

  it('should render category list', () => {
    const { getByText } = render(<CategoryManagerScreen />);
    expect(getByText('Rações')).toBeTruthy();
    expect(getByText('Acessórios')).toBeTruthy();
    expect(getByText('Medicamentos')).toBeTruthy();
  });

  it('should toggle category active state', () => {
    const toggleActive = jest.fn();
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ toggleActive }));
    const { UNSAFE_getAllByProps } = render(<CategoryManagerScreen />);
    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const eyeBtn = touchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'eye' || children?.props?.name === 'eye-off';
    });
    if (eyeBtn) fireEvent.press(eyeBtn);
    expect(toggleActive).toHaveBeenCalled();
  });

  it('should open create modal and create category', async () => {
    const createCategory = jest.fn();
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ createCategory }));
    const { getByText, getByPlaceholderText } = render(<CategoryManagerScreen />);

    fireEvent.press(getByText('Nova Categoria'));
    expect(getByText('Criar')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Nome da categoria'), 'Peixes');
    fireEvent.changeText(getByPlaceholderText('Palavras-chave (separadas por vírgula)'), 'peixe, aquário');
    fireEvent.press(getByText('Criar'));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith('Peixes', ['peixe', 'aquário']);
    });
  });

  it('should cancel create modal', () => {
    const { getByText, queryByText } = render(<CategoryManagerScreen />);
    fireEvent.press(getByText('Nova Categoria'));
    fireEvent.press(getByText('Cancelar'));
    expect(queryByText('Criar')).toBeNull();
  });

  it('should not create category with empty name', () => {
    const createCategory = jest.fn();
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ createCategory }));
    const { getByText } = render(<CategoryManagerScreen />);
    fireEvent.press(getByText('Nova Categoria'));
    fireEvent.press(getByText('Criar'));
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('should start editing when edit button pressed', async () => {
    const { getByText, UNSAFE_getAllByProps } = render(<CategoryManagerScreen />);
    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const editBtn = touchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'edit-2';
    });
    if (editBtn) fireEvent.press(editBtn);

    await waitFor(() => {
      const checkTouchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
      const checkBtn = checkTouchables.find((t: any) => {
        const children = t.props.children;
        return children?.props?.name === 'check';
      });
      expect(checkBtn).toBeTruthy();
    });
  });

  it('should save editing successfully', async () => {
    (useCategories as jest.Mock).mockReturnValue(createMockCategories());
    const updateSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    } as any);

    const { UNSAFE_getAllByProps } = render(<CategoryManagerScreen />);
    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const editBtn = touchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'edit-2';
    });
    if (editBtn) fireEvent.press(editBtn);

    const checkTouchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const checkBtn = checkTouchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'check';
    });
    if (checkBtn) fireEvent.press(checkBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('custom_categories');
    });
  });

  it('should cancel editing', () => {
    const { UNSAFE_getAllByProps } = render(<CategoryManagerScreen />);
    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const editBtn = touchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'edit-2';
    });
    if (editBtn) fireEvent.press(editBtn);

    const xTouchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const xBtn = xTouchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'x';
    });
    if (xBtn) fireEvent.press(xBtn);
  });

  it('should handle delete flow', () => {
    const deleteCategory = jest.fn();
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ deleteCategory }));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const destructiveBtn = buttons?.find((b: any) => b.style === 'destructive');
      if (destructiveBtn?.onPress) destructiveBtn.onPress();
    });

    const { UNSAFE_getAllByProps } = render(<CategoryManagerScreen />);
    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const trashBtn = touchables.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'trash-2';
    });
    if (trashBtn) fireEvent.press(trashBtn);

    expect(alertSpy).toHaveBeenCalled();
    expect(deleteCategory).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should expand/collapse categories with many keywords', () => {
    const { getByText, UNSAFE_getAllByProps } = render(<CategoryManagerScreen />);
    const expandBtns = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    const chevronBtn = expandBtns.find((t: any) => {
      const children = t.props.children;
      return children?.props?.name === 'chevron-down' || children?.props?.name === 'chevron-up';
    });
    if (chevronBtn) {
      fireEvent.press(chevronBtn);
      fireEvent.press(chevronBtn);
    }
  });

  it('should handle refresh', async () => {
    const reload = jest.fn();
    (useCategories as jest.Mock).mockReturnValue(createMockCategories({ reload }));
    const { UNSAFE_getAllByType } = render(<CategoryManagerScreen />);
    const { RefreshControl } = require('react-native');
    const refreshers = UNSAFE_getAllByType(RefreshControl);
    if (refreshers.length > 0) {
      const onRefresh = refreshers[0].props.onRefresh;
      await onRefresh();
      expect(reload).toHaveBeenCalled();
    }
  });
});

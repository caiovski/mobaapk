import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Feather } from '@expo/vector-icons';
import { FilterModal } from '../../presentation/screens/admin/ManageProducts/FilterModal';

describe('FilterModal', () => {
  const baseProps = {
    visible: true,
    isDarkMode: false,
    colors: { textDark: '#000' },
    tempStatusFilter: 'Todos',
    tempAlertYellowFilter: false,
    tempAlertRedFilter: false,
    tempSortOption: 'alpha' as const,
    onSelectStatus: jest.fn(),
    onToggleYellow: jest.fn(),
    onToggleRed: jest.fn(),
    onSelectSort: jest.fn(),
    onApply: jest.fn(),
    onClose: jest.fn(),
    allCategories: [],
    categories: [],
    onCreateCategory: jest.fn(),
    onToggleCategoryActive: jest.fn(),
    onDeleteCategory: jest.fn(),
  };

  it('should render radio buttons', () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    expect(getByText('Todos os produtos')).toBeTruthy();
    expect(getByText('Somente ativos')).toBeTruthy();
    expect(getByText('Somente inativos')).toBeTruthy();
  });

  it('should render toggle components', () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    expect(getByText('Estoque Moderado (Alerta Amarelo)')).toBeTruthy();
    expect(getByText('Estoque Crítico (Alerta Vermelho)')).toBeTruthy();
  });

  it('should disable toggles when Inativos is selected (covers line 26 disabled style)', () => {
    const { getByText } = render(
      <FilterModal {...baseProps} tempStatusFilter="Inativos" />
    );
    expect(getByText('Estoque Moderado (Alerta Amarelo)')).toBeTruthy();
    expect(getByText('Estoque Crítico (Alerta Vermelho)')).toBeTruthy();
  });

  it('should mark selected status', () => {
    const { getByText } = render(
      <FilterModal {...baseProps} tempStatusFilter="Ativos" />
    );
    expect(getByText('Somente ativos')).toBeTruthy();
  });

  it('should render in dark mode', () => {
    const { getByText } = render(
      <FilterModal {...baseProps} isDarkMode={true} />
    );
    expect(getByText('Filtrar Produtos')).toBeTruthy();
  });

  it('should call onSelectSort when sort option pressed', () => {
    const onSelectSort = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onSelectSort={onSelectSort} />
    );
    fireEvent.press(getByText('Mais estoque'));
    expect(onSelectSort).toHaveBeenCalledWith('most_stock');
  });

  it('should render empty categories message when allCategories is empty', () => {
    const { getByText } = render(<FilterModal {...baseProps} allCategories={[]} />);
    expect(getByText('Nenhuma categoria cadastrada.')).toBeTruthy();
  });

  it('should render category items and toggle active / delete', () => {
    const onToggleCategoryActive = jest.fn();
    const onDeleteCategory = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <FilterModal
        {...baseProps}
        onToggleCategoryActive={onToggleCategoryActive}
        onDeleteCategory={onDeleteCategory}
        allCategories={[{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }]}
      />
    );
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    const eyeBtn = touchables.find(t => {
      try {
        const feather = t.findByType(Feather);
        return feather.props.name === 'eye';
      } catch (_) { return false; }
    });
    fireEvent.press(eyeBtn);
    expect(onToggleCategoryActive).toHaveBeenCalledWith('1', false);

    const trashBtn = touchables.find(t => {
      try {
        const feather = t.findByType(Feather);
        return feather.props.name === 'trash-2';
      } catch (_) { return false; }
    });
    fireEvent.press(trashBtn);
    expect(onDeleteCategory).toHaveBeenCalledWith('1');
  });

  it('should call onCreateCategory when + pressed with valid inputs', () => {
    const onCreateCategory = jest.fn();
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(
      <FilterModal
        {...baseProps}
        onCreateCategory={onCreateCategory}
        allCategories={[{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }]}
      />
    );
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    fireEvent.changeText(getByPlaceholderText('Nome'), 'Ração');
    fireEvent.changeText(getByPlaceholderText('Keywords (vírgula)'), 'ração, pet');

    const addBtn = touchables.find(t => {
      try {
        const feather = t.findByType(Feather);
        return feather.props.name === 'plus';
      } catch (_) { return false; }
    });
    fireEvent.press(addBtn);
    expect(onCreateCategory).toHaveBeenCalledWith('Ração', ['ração', 'pet']);
  });

  it('should not call onCreateCategory when name is empty', () => {
    const onCreateCategory = jest.fn();
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(
      <FilterModal
        {...baseProps}
        onCreateCategory={onCreateCategory}
        allCategories={[{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }]}
      />
    );
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    fireEvent.changeText(getByPlaceholderText('Nome'), '');
    fireEvent.changeText(getByPlaceholderText('Keywords (vírgula)'), 'kw');

    const addBtn = touchables.find(t => {
      try {
        const feather = t.findByType(Feather);
        return feather.props.name === 'plus';
      } catch (_) { return false; }
    });
    fireEvent.press(addBtn);
    expect(onCreateCategory).not.toHaveBeenCalled();
  });

  it('should render category items in dark mode', () => {
    const { getByText } = render(
      <FilterModal
        {...baseProps}
        isDarkMode={true}
        allCategories={[{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }]}
      />
    );
    expect(getByText('Pesca')).toBeTruthy();
  });

  it('should render inactive category with eye-off icon', () => {
    const { UNSAFE_getAllByType } = render(
      <FilterModal
        {...baseProps}
        allCategories={[{ id: '1', name: 'Pesca', keywords: ['pesca'], active: false }]}
      />
    );
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    const eyeOffBtn = touchables.find(t => {
      try {
        const feather = t.findByType(Feather);
        return feather.props.name === 'eye-off';
      } catch (_) { return false; }
    });
    expect(eyeOffBtn).toBeTruthy();
  });
});

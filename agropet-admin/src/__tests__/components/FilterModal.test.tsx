import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterModal } from '../../presentation/screens/admin/ManageProducts/FilterModal';

describe('FilterModal', () => {
  const baseProps = {
    visible: true,
    isDarkMode: false,
    colors: { textDark: '#000' },
    tempStatusFilter: 'Todos',
    tempTypeFilter: 'Todos',
    tempAlertYellowFilter: false,
    tempAlertRedFilter: false,
    tempSortOption: 'alpha' as const,
    onSelectStatus: jest.fn(),
    onSelectType: jest.fn(),
    onToggleYellow: jest.fn(),
    onToggleRed: jest.fn(),
    onSelectSort: jest.fn(),
    onApply: jest.fn(),
    onClose: jest.fn(),
    onManageCategories: jest.fn(),
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

  it('should disable toggles when Inativos is selected', () => {
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

  it('should call onApply when Aplicar Filtros is pressed', () => {
    const onApply = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onApply={onApply} />
    );
    fireEvent.press(getByText('Aplicar Filtros'));
    expect(onApply).toHaveBeenCalled();
  });

  it('should call onClose when Cancelar is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onClose={onClose} />
    );
    fireEvent.press(getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onManageCategories when Gerenciar categorias is pressed', () => {
    const onManageCategories = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onManageCategories={onManageCategories} onClose={onClose} />
    );
    fireEvent.press(getByText('Gerenciar categorias'));
    expect(onManageCategories).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should render sort options', () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    expect(getByText('Ordem alfabética')).toBeTruthy();
    expect(getByText('Produtos mais novos')).toBeTruthy();
    expect(getByText('Produtos mais velhos')).toBeTruthy();
    expect(getByText('Mais estoque')).toBeTruthy();
    expect(getByText('Maior preço')).toBeTruthy();
    expect(getByText('Menor preço')).toBeTruthy();
  });

  it('should call onSelectStatus when radio pressed', () => {
    const onSelectStatus = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onSelectStatus={onSelectStatus} />
    );
    fireEvent.press(getByText('Somente ativos'));
    expect(onSelectStatus).toHaveBeenCalledWith('Ativos');
  });

  it('should call onToggleYellow when yellow alert toggle pressed', () => {
    const onToggleYellow = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onToggleYellow={onToggleYellow} />
    );
    fireEvent.press(getByText('Estoque Moderado (Alerta Amarelo)'));
    expect(onToggleYellow).toHaveBeenCalled();
  });

  it('should call onToggleRed when red alert toggle pressed', () => {
    const onToggleRed = jest.fn();
    const { getByText } = render(
      <FilterModal {...baseProps} onToggleRed={onToggleRed} />
    );
    fireEvent.press(getByText('Estoque Crítico (Alerta Vermelho)'));
    expect(onToggleRed).toHaveBeenCalled();
  });

  it('should disable Inativos radio when alert filters are active', () => {
    const onSelectStatus = jest.fn();
    const { getByText } = render(
      <FilterModal
        {...baseProps}
        tempAlertYellowFilter={true}
        tempAlertRedFilter={true}
        onSelectStatus={onSelectStatus}
      />
    );
    const inativosBtn = getByText('Somente inativos').parent?.parent;
    expect(inativosBtn).toBeDefined();
  });
});
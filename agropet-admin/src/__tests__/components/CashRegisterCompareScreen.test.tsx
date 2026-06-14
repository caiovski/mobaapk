import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../presentation/contexts/ThemeContext';
import { fetchByDate } from '../../services/cashRegisterService';
import CashRegisterCompareScreen from '../../presentation/screens/admin/CashRegister/CashRegisterCompareScreen/CashRegisterCompareScreen';

jest.mock('../../presentation/components/AdminHeader', () => {
  const { Text } = require('react-native');
  return () => <Text>AdminHeader</Text>;
});

jest.mock('../../presentation/components/AdminUserMenu', () => ({
  AdminUserMenu: () => null,
}));

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({ colors: {}, isDarkMode: false })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('../../services/cashRegisterService', () => ({
  fetchByDate: jest.fn(),
}));

const mockOpening: any = {
  id: 'open-1',
  date: '2025-06-10',
  type: 'opening',
  code: 'COD-001',
  total_value: 500,
  bill_200: 1,
  bill_100: 2,
  bill_50: 1,
  bill_20: 3,
  bill_10: 5,
  bill_5: 10,
  bill_2: 5,
  coin_100: 10,
  coin_050: 5,
  coin_025: 10,
  coin_010: 20,
  coin_005: 10,
};

const mockClosing: any = {
  ...mockOpening,
  id: 'close-1',
  type: 'closing',
  total_value: 750,
  bill_200: 2,
  bill_100: 3,
  bill_50: 2,
  bill_20: 4,
  bill_10: 5,
  bill_5: 8,
  bill_2: 3,
  coin_100: 8,
  coin_050: 4,
  coin_025: 6,
  coin_010: 15,
  coin_005: 5,
};

describe('CashRegisterCompareScreen', () => {
  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({ goBack: jest.fn(), replace: jest.fn() });
    (useRoute as jest.Mock).mockReturnValue({
      params: { date: '2025-06-10', mode: 'compare' },
    });
    (fetchByDate as jest.Mock).mockResolvedValue({ opening: mockOpening, closing: mockClosing });
    (useTheme as jest.Mock).mockReturnValue({ colors: {}, isDarkMode: false });
  });

  it('should show loading state initially', () => {
    (fetchByDate as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { UNSAFE_getAllByType } = render(<CashRegisterCompareScreen />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('should render compare mode with opening and closing data', async () => {
    const { getByText, getAllByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    expect(getByText('Código: COD-001 · Comparação')).toBeTruthy();
    expect(getByText('Cédulas')).toBeTruthy();
    expect(getByText('Moedas')).toBeTruthy();
    expect(getAllByText('Abertura').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Fechamento').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Dif.').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('R$ Dif.').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Total abertura')).toBeTruthy();
    expect(getByText('Total fechamento')).toBeTruthy();

    expect(getByText(/Diferença/)).toBeTruthy();
  });

  it('should render opening-only mode', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { date: '2025-06-10', mode: 'opening' },
    });
    const { getByText, queryByText, getAllByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    expect(getByText('Código: COD-001 · Abertura')).toBeTruthy();
    expect(getAllByText('Abertura').length).toBeGreaterThanOrEqual(1);
    expect(queryByText('Fechamento')).toBeNull();
    expect(queryByText('Dif.')).toBeNull();
    expect(queryByText('R$ Dif.')).toBeNull();
    expect(getByText('Total fechamento')).toBeTruthy();
  });

  it('should render closing-only mode', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { date: '2025-06-10', mode: 'closing' },
    });
    const { getByText, queryByText, getAllByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    expect(getByText('Código: COD-001 · Fechamento')).toBeTruthy();
    expect(getAllByText('Fechamento').length).toBeGreaterThanOrEqual(1);
    expect(queryByText('Dif.')).toBeNull();
  });

  it('should navigate to opening view', async () => {
    const replace = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: jest.fn(), replace });
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    fireEvent.press(getByText('Ver abertura'));
    expect(replace).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'opening' });
  });

  it('should navigate to closing view', async () => {
    const replace = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: jest.fn(), replace });
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    fireEvent.press(getByText('Ver fechamento'));
    expect(replace).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'closing' });
  });

  it('should navigate to compare view', async () => {
    const replace = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: jest.fn(), replace });
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    fireEvent.press(getByText('Comparar'));
    expect(replace).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'compare' });
  });

  it('should go back when Voltar pressed', async () => {
    const goBack = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ goBack, replace: jest.fn() });
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    fireEvent.press(getByText('Voltar'));
    expect(goBack).toHaveBeenCalled();
  });

  it('should render error state gracefully', async () => {
    (fetchByDate as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });
  });

  it('should render with missing closing data', async () => {
    (fetchByDate as jest.Mock).mockResolvedValue({ opening: mockOpening, closing: undefined });
    const { getByText, queryByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    expect(queryByText('Total fechamento')).toBeNull();
    expect(getByText('Ver abertura')).toBeTruthy();
    expect(queryByText('Ver fechamento')).toBeNull();
    expect(queryByText('Comparar')).toBeNull();
  });

  it('should render with no route params (default date and mode)', async () => {
    const today = new Date().toISOString().split('T')[0].split('-').reverse().join('-');
    (useRoute as jest.Mock).mockReturnValue({ params: {} });
    (fetchByDate as jest.Mock).mockResolvedValue({ opening: mockOpening, closing: mockClosing });
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText(`Caixa - ${today}`)).toBeTruthy();
    });

    expect(getByText(/Comparação/)).toBeTruthy();
  });

  it('should render in dark mode', async () => {
    (useTheme as jest.Mock).mockReturnValue({ colors: {}, isDarkMode: true });
    (fetchByDate as jest.Mock).mockResolvedValue({ opening: mockOpening, closing: mockClosing });
    const { getByText } = render(<CashRegisterCompareScreen />);

    await waitFor(() => {
      expect(getByText('Caixa - 10-06-2025')).toBeTruthy();
    });

    expect(getByText('Código: COD-001 · Comparação')).toBeTruthy();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MultiPaymentInput from '../../presentation/screens/admin/AdminDashboard/components/MultiPaymentInput';

describe('MultiPaymentInput', () => {
  const baseProps = {
    isDarkMode: false,
    totalVenda: 100,
    multiValues: { dinheiro: '', cartao_credito: '', cartao_debito: '', pix: '' },
    onValueChange: jest.fn(),
  };

  it('renders all four payment method inputs', () => {
    const { getByText } = render(<MultiPaymentInput {...baseProps} />);
    expect(getByText('Dinheiro')).toBeTruthy();
    expect(getByText('Crédito')).toBeTruthy();
    expect(getByText('Débito')).toBeTruthy();
    expect(getByText('Pix')).toBeTruthy();
  });

  it('shows "Ainda faltam" message when sum is less than total', () => {
    const { getByText } = render(
      <MultiPaymentInput
        {...baseProps}
        multiValues={{ dinheiro: '30', cartao_credito: '', cartao_debito: '', pix: '' }}
      />
    );
    expect(getByText(/Ainda faltam/)).toBeTruthy();
  });

  it('shows success message when sum equals total', () => {
    const { getByText } = render(
      <MultiPaymentInput
        {...baseProps}
        multiValues={{ dinheiro: '50', cartao_credito: '', cartao_debito: '', pix: '50' }}
      />
    );
    expect(getByText('Agora você pode lançar normalmente :)')).toBeTruthy();
  });

  it('shows "Total lançado" with correct formatted value', () => {
    const { getByText } = render(
      <MultiPaymentInput
        {...baseProps}
        multiValues={{ dinheiro: '40,50', cartao_credito: '', cartao_debito: '', pix: '59,50' }}
      />
    );
    expect(getByText('Total lançado:')).toBeTruthy();
    expect(getByText('R$ 100,00')).toBeTruthy();
  });

  it('renders in dark mode', () => {
    const { getByText } = render(
      <MultiPaymentInput
        {...baseProps}
        isDarkMode={true}
      />
    );
    expect(getByText('Dinheiro')).toBeTruthy();
  });

  it('calls onValueChange with filtered digits when text changes', () => {
    const onValueChange = jest.fn();
    const { getByDisplayValue } = render(
      <MultiPaymentInput
        {...baseProps}
        multiValues={{ dinheiro: '50', cartao_credito: '', cartao_debito: '', pix: '' }}
        onValueChange={onValueChange}
      />
    );
    const input = getByDisplayValue('50');
    fireEvent.changeText(input, '75abc,!');
    expect(onValueChange).toHaveBeenCalledWith('dinheiro', '75,');
  });

  it('displays multiValues when provided', () => {
    const { getByDisplayValue } = render(
      <MultiPaymentInput
        {...baseProps}
        multiValues={{ dinheiro: '30', cartao_credito: '20', cartao_debito: '', pix: '50' }}
      />
    );
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('20')).toBeTruthy();
    expect(getByDisplayValue('50')).toBeTruthy();
  });
});

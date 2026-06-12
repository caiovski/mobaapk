import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DenominationRow } from '../../presentation/screens/admin/CashRegister/CashRegisterScreen/components/DenominationRow';

describe('DenominationRow', () => {
  const baseProps = {
    label: 'R$ 100',
    value: 100,
    quantity: 2,
    editable: false,
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    isDarkMode: false,
  };

  it('should render label and quantity', () => {
    const { getByText } = render(<DenominationRow {...baseProps} />);
    expect(getByText('R$ 100')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('should display line total correctly (qty * value)', () => {
    const { getByText } = render(<DenominationRow {...baseProps} quantity={3} value={50} />);
    expect(getByText('R$ 150,00')).toBeTruthy();
  });

  it('should show steppers when editable is true and call callbacks', () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    const { getByText } = render(
      <DenominationRow {...baseProps} editable={true} onIncrement={onIncrement} onDecrement={onDecrement} />
    );

    fireEvent.press(getByText('plus'));
    expect(onIncrement).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('minus'));
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('should not show steppers when editable is false', () => {
    const { getByText } = render(<DenominationRow {...baseProps} editable={false} />);
    expect(getByText('2')).toBeTruthy();
  });

  it('should render in dark mode', () => {
    const { getByText } = render(<DenominationRow {...baseProps} isDarkMode={true} />);
    expect(getByText('R$ 100')).toBeTruthy();
  });

  it('should render with zero values', () => {
    const { getByText } = render(<DenominationRow {...baseProps} quantity={0} value={0} />);
    expect(getByText('R$ 0,00')).toBeTruthy();
  });
});

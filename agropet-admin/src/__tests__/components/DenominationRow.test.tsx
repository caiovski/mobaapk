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

  it('should show TextInput when quantityInputMode is true and editable', () => {
    const onQuantityChange = jest.fn();
    const { getByDisplayValue } = render(
      <DenominationRow {...baseProps} editable={true} quantityInputMode={true} onQuantityChange={onQuantityChange} />
    );
    const input = getByDisplayValue('2');
    expect(input).toBeTruthy();
    fireEvent.changeText(input, '5');
    expect(onQuantityChange).toHaveBeenCalledWith(5);
  });

  it('should handle invalid TextInput value as 0', () => {
    const onQuantityChange = jest.fn();
    const { getByDisplayValue } = render(
      <DenominationRow {...baseProps} editable={true} quantityInputMode={true} onQuantityChange={onQuantityChange} />
    );
    fireEvent.changeText(getByDisplayValue('2'), 'abc');
    expect(onQuantityChange).toHaveBeenCalledWith(0);
  });

  it('should render non-editable readonly text when not editable and not quantityInputMode', () => {
    const { getByText, queryByText } = render(<DenominationRow {...baseProps} editable={false} />);
    expect(getByText('2')).toBeTruthy();
    expect(queryByText('plus')).toBeNull();
  });

  it('should call onChangeText even when onQuantityChange is not provided', () => {
    const { getByDisplayValue } = render(
      <DenominationRow {...baseProps} editable={true} quantityInputMode={true} />
    );
    fireEvent.changeText(getByDisplayValue('2'), '7');
    expect(getByDisplayValue('2')).toBeTruthy();
  });

  it('should render stepper buttons in dark mode', () => {
    const { getByText } = render(
      <DenominationRow {...baseProps} editable={true} quantityInputMode={false} isDarkMode={true} />
    );
    expect(getByText('plus')).toBeTruthy();
    expect(getByText('minus')).toBeTruthy();
  });
});

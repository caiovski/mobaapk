import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlowButton } from '../../presentation/screens/admin/CashRegister/CashRegisterScreen/components/GlowButton';

describe('GlowButton', () => {
  const baseProps = {
    label: 'Test Button',
    backgroundColor: '#F97D01',
    enabled: true,
  };

  it('should render label', () => {
    const { getByText } = render(<GlowButton {...baseProps} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when enabled and pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<GlowButton {...baseProps} onPress={onPress} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<GlowButton {...baseProps} enabled={false} onPress={onPress} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render with custom textColor', () => {
    const { getByText } = render(<GlowButton {...baseProps} textColor="#FF0000" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should render with enabled=false (disabled state)', () => {
    const { getByText } = render(<GlowButton {...baseProps} enabled={false} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should render without onPress when enabled is false', () => {
    const { getByText } = render(<GlowButton {...baseProps} enabled={false} />);
    fireEvent.press(getByText('Test Button'));
  });
});

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import LegalPagesScreen from '../../presentation/screens/auth/LegalPages/LegalPagesScreen';
import { useNavigation, useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

describe('Admin LegalPagesScreen', () => {
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack });
    (useRoute as jest.Mock).mockReturnValue({ params: { type: 'privacy' } });
  });

  it('should render privacy content by default', () => {
    (useRoute as jest.Mock).mockReturnValue({ params: { type: 'privacy' } });
    const { getByText } = render(<LegalPagesScreen />);
    expect(getByText('Privacidade')).toBeTruthy();
    expect(getByText(/LGPD/i)).toBeTruthy();
  });

  it('should render terms content when type is terms', () => {
    (useRoute as jest.Mock).mockReturnValue({ params: { type: 'terms' } });
    const { getByText } = render(<LegalPagesScreen />);
    expect(getByText('Termos de Uso')).toBeTruthy();
    expect(getByText(/Acesso Restrito/i)).toBeTruthy();
  });

  it('should default to privacy when no type param is provided', () => {
    (useRoute as jest.Mock).mockReturnValue({ params: {} });
    const { getByText } = render(<LegalPagesScreen />);
    expect(getByText('Privacidade')).toBeTruthy();
  });

  it('should call navigation.goBack when close button is pressed', () => {
    (useRoute as jest.Mock).mockReturnValue({ params: { type: 'privacy' } });
    const { getByText } = render(<LegalPagesScreen />);
    const closeBtn = getByText('✕');

    act(() => {
      fireEvent.press(closeBtn);
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
});

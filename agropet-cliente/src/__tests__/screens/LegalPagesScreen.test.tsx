import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import LegalPagesScreen from '../../presentation/screens/auth/LegalPages/LegalPagesScreen';
import { useNavigation, useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

describe('Client LegalPagesScreen', () => {
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
    expect(getByText(/Lei Geral de Proteção de Dados/)).toBeTruthy();
  });

  it('should render terms content when type is terms', () => {
    (useRoute as jest.Mock).mockReturnValue({ params: { type: 'terms' } });
    const { getByText } = render(<LegalPagesScreen />);
    expect(getByText('Termos de Uso')).toBeTruthy();
    expect(getByText(/Serviços Oferecidos/i)).toBeTruthy();
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

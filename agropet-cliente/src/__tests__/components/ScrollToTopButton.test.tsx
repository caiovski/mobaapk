import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScrollToTopButton from '../../presentation/components/ScrollToTopButton';

describe('ScrollToTopButton', () => {
  it('should render with visible=false', () => {
    const ref = React.createRef<any>();
    const { toJSON } = render(<ScrollToTopButton scrollRef={ref} visible={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should scroll to top on press for ScrollView', () => {
    const scrollTo = jest.fn();
    const ref = { current: { scrollTo } } as any;
    const { getByTestId } = render(<ScrollToTopButton scrollRef={ref} visible />);
    fireEvent.press(getByTestId('scroll-to-top-button'));
    expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
  });

  it('should scroll to top on press for FlatList', () => {
    const scrollToOffset = jest.fn();
    const ref = { current: { scrollToOffset } } as any;
    const { getByTestId } = render(<ScrollToTopButton scrollRef={ref} visible isFlatList />);
    fireEvent.press(getByTestId('scroll-to-top-button'));
    expect(scrollToOffset).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  it('should handle null ref gracefully', () => {
    const ref = { current: null } as any;
    const { getByTestId } = render(<ScrollToTopButton scrollRef={ref} visible />);
    expect(() => fireEvent.press(getByTestId('scroll-to-top-button'))).not.toThrow();
  });

  it('should render with dark mode', () => {
    const ref = React.createRef<any>();
    const { toJSON } = render(<ScrollToTopButton scrollRef={ref} visible isDarkMode />);
    expect(toJSON()).toBeTruthy();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CheckoutModal from '../../presentation/screens/admin/AdminDashboard/components/CheckoutModal';

jest.mock('../../presentation/screens/admin/AdminDashboard/AdminDashboardScreen.styles', () => ({
  styles: {
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    whiteModalContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 12 },
    whiteModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    inputHeading: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  },
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('../../utils/imageUtils', () => ({
  getFirstImageUrl: (url: string | null | undefined) => url || null,
}));

const baseProduct = {
  id: 'p1',
  name: 'Product 1',
  price: 25.50,
  image_url: 'https://example.com/img.jpg',
};

const baseCart = {
  p1: { qty: 2, checked: true },
};

const baseProps = {
  visible: true,
  pdvProducts: [baseProduct],
  pdvCart: baseCart,
  checkoutPaymentMethod: 'dinheiro' as const,
  pdvLoading: false,
  isDarkMode: false,
  onClose: jest.fn(),
  onPaymentMethodChange: jest.fn(),
  onConfirm: jest.fn(),
};

describe('CheckoutModal', () => {
  it('should render visible modal with products', () => {
    const { getByText } = render(<CheckoutModal {...baseProps} />);
    expect(getByText('Resumo da venda')).toBeTruthy();
    expect(getByText('Product 1')).toBeTruthy();
    expect(getByText('Total da Venda:')).toBeTruthy();
  });

  it('should render item without image_url (falsy branch)', () => {
    const productNoImage = { ...baseProduct, image_url: null };
    const { getByText } = render(
      <CheckoutModal {...baseProps} pdvProducts={[productNoImage]} />
    );
    expect(getByText('Product 1')).toBeTruthy();
  });

  it('should render in dark mode', () => {
    const { getByText } = render(<CheckoutModal {...baseProps} isDarkMode={true} />);
    expect(getByText('Resumo da venda')).toBeTruthy();
  });

  it('should render loading state', () => {
    const { UNSAFE_getAllByType } = render(<CheckoutModal {...baseProps} pdvLoading={true} />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('should show dropdown when payment method pressed', () => {
    const { getByText } = render(<CheckoutModal {...baseProps} />);
    fireEvent.press(getByText('Dinheiro'));
    expect(getByText('Pix')).toBeTruthy();
  });

  it('should change payment method from dropdown', () => {
    const onPaymentMethodChange = jest.fn();
    const { getByText } = render(
      <CheckoutModal {...baseProps} onPaymentMethodChange={onPaymentMethodChange} />
    );
    fireEvent.press(getByText('Dinheiro'));
    fireEvent.press(getByText('Pix'));
    expect(onPaymentMethodChange).toHaveBeenCalledWith('pix');
  });

  it('should call onClose when cancel pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(<CheckoutModal {...baseProps} onClose={onClose} />);
    fireEvent.press(getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when confirm pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(<CheckoutModal {...baseProps} onConfirm={onConfirm} />);
    fireEvent.press(getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should display bulk value mode weight for bulk products', () => {
    const bulkProduct = {
      id: 'p2', name: 'Arroz', price: 8,
      image_url: 'https://example.com/img.jpg', is_bulk: true,
    };
    const bulkCart = { p2: { qty: 0, checked: true } };
    const { getByText } = render(
      <CheckoutModal
        {...baseProps}
        pdvProducts={[bulkProduct]}
        pdvCart={bulkCart}
        bulkValueMode={false}
        pdvBulkValues={{ p2: 20 }}
      />
    );
    expect(getByText('Arroz')).toBeTruthy();
    expect(getByText(/Kg/)).toBeTruthy();
  });

  it('should display per-meter quantity with meters unit (qty >= 1)', () => {
    const perMeterProduct = {
      id: 'p3', name: 'Tecido', price: 15,
      image_url: null, is_per_meter: true,
    };
    const perMeterCart = { p3: { qty: 2, checked: true } };
    const { getByText } = render(
      <CheckoutModal
        {...baseProps}
        pdvProducts={[perMeterProduct]}
        pdvCart={perMeterCart}
        bulkValueMode={true}
      />
    );
    expect(getByText('Tecido')).toBeTruthy();
    expect(getByText('2,00 m')).toBeTruthy();
  });

  it('should display per-meter quantity with meters unit (qty < 1)', () => {
    const perMeterProduct = {
      id: 'p7', name: 'Linha', price: 10,
      image_url: null, is_per_meter: true,
    };
    const perMeterCart = { p7: { qty: 0.5, checked: true } };
    const { getByText } = render(
      <CheckoutModal
        {...baseProps}
        pdvProducts={[perMeterProduct]}
        pdvCart={perMeterCart}
        bulkValueMode={true}
      />
    );
    expect(getByText('Linha')).toBeTruthy();
    expect(getByText('0,5 m')).toBeTruthy();
  });

  it('should display bulk product with bulk value mode', () => {
    const bulkProduct = {
      id: 'p4', name: 'Açúcar', price: 5,
      image_url: null, is_bulk: true,
    };
    const bulkCart = { p4: { qty: 2, checked: true } };
    const { getByText } = render(
      <CheckoutModal
        {...baseProps}
        pdvProducts={[bulkProduct]}
        pdvCart={bulkCart}
        bulkValueMode={true}
        bulkInputUnit={{ p4: 'kg' }}
      />
    );
    expect(getByText('Açúcar')).toBeTruthy();
    expect(getByText(/Kg/)).toBeTruthy();
  });

  it('should display bulk product with grams unit', () => {
    const bulkProduct = {
      id: 'p5', name: 'Açúcar', price: 5,
      image_url: null, is_bulk: true,
    };
    const bulkCart = { p5: { qty: 500, checked: true } };
    const { getByText } = render(
      <CheckoutModal
        {...baseProps}
        pdvProducts={[bulkProduct]}
        pdvCart={bulkCart}
        bulkValueMode={true}
        bulkInputUnit={{ p5: 'g' }}
      />
    );
    expect(getByText('500,000 g')).toBeTruthy();
  });

  it('should display regular item quantity directly', () => {
    const regularProduct = {
      id: 'p6', name: 'Coleira', price: 30,
      image_url: null,
    };
    const regularCart = { p6: { qty: 3, checked: true } };
    const { getByText } = render(
      <CheckoutModal
        {...baseProps}
        pdvProducts={[regularProduct]}
        pdvCart={regularCart}
      />
    );
    expect(getByText('Coleira')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });
});

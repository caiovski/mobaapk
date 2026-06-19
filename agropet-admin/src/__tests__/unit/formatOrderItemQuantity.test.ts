import { formatOrderItemQuantity, formatOrderItemUnitPrice } from '../../utils/formatOrderItemQuantity';

describe('formatOrderItemQuantity', () => {
  describe('isBulk = true', () => {
    it('returns Kg format when quantity >= 1', () => {
      expect(formatOrderItemQuantity(2.5, true, false)).toBe('2,500 Kg');
    });

    it('returns grams when quantity < 1', () => {
      expect(formatOrderItemQuantity(0.5, true, false)).toBe('500g');
    });

    it('returns grams for small quantity', () => {
      expect(formatOrderItemQuantity(0.001, true, false)).toBe('1g');
    });

    it('returns Kg for quantity exactly 1', () => {
      expect(formatOrderItemQuantity(1, true, false)).toBe('1,000 Kg');
    });
  });

  describe('isPerMeter = true', () => {
    it('returns integer meters when qty is integer', () => {
      expect(formatOrderItemQuantity(3, false, true)).toBe('3 m');
    });

    it('returns decimal meters when qty is not integer', () => {
      expect(formatOrderItemQuantity(2.5, false, true)).toBe('2,50 m');
    });

    it('returns decimal meters for fractional values', () => {
      expect(formatOrderItemQuantity(1.75, false, true)).toBe('1,75 m');
    });
  });

  describe('neither bulk nor per meter', () => {
    it('returns raw quantity as string', () => {
      expect(formatOrderItemQuantity(5, false, false)).toBe('5');
    });

    it('returns 0 as string', () => {
      expect(formatOrderItemQuantity(0, false, false)).toBe('0');
    });
  });
});

describe('formatOrderItemUnitPrice', () => {
  it('formats unit price for bulk', () => {
    expect(formatOrderItemUnitPrice(12.5, true, false)).toBe('R$ 12,50/Kg');
  });

  it('formats unit price for per meter', () => {
    expect(formatOrderItemUnitPrice(8.9, false, true)).toBe('R$ 8,90/m');
  });

  it('formats unit price for regular item', () => {
    expect(formatOrderItemUnitPrice(25, false, false)).toBe('R$ 25,00 un.');
  });
});

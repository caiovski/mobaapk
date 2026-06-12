import { formatStock } from '../../utils/formatStock';

describe('formatStock', () => {
  it('should format bulk stock as Kg with 3 decimal places', () => {
    expect(formatStock(1000, true)).toBe('1,000 Kg');
    expect(formatStock(1500, true)).toBe('1,500 Kg');
    expect(formatStock(250, true)).toBe('0,250 Kg');
    expect(formatStock(0, true)).toBe('0,000 Kg');
    expect(formatStock(10000, true)).toBe('10,000 Kg');
  });

  it('should format non-bulk stock as unidades', () => {
    expect(formatStock(1, false)).toBe('1 unidade');
    expect(formatStock(5, false)).toBe('5 unidades');
    expect(formatStock(0, false)).toBe('0 unidades');
    expect(formatStock(100, false)).toBe('100 unidades');
  });
});

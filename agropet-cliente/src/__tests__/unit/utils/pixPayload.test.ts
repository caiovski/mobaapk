import { generatePixPayload } from '../../../presentation/utils/pixPayload';

describe('generatePixPayload', () => {
  const defaultParams = {
    pixKey: '12345678900',
    merchantName: 'LOJA TESTE',
    amount: 150.50,
    txid: 'ORDER123',
    city: 'SAO PAULO',
  };

  it('should generate a valid PIX BR Code payload', () => {
    const payload = generatePixPayload(defaultParams);
    expect(payload).toBeTruthy();
    expect(payload).toMatch(/^000201/);
    expect(payload).toContain('br.gov.bcb.pix');
    expect(payload).toContain('986');
    expect(payload).toContain('BR');
  });

  it('should end with a valid 4-character CRC16', () => {
    const payload = generatePixPayload(defaultParams);
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it('should include the PIX key in merchant account info', () => {
    const payload = generatePixPayload(defaultParams);
    expect(payload).toContain(defaultParams.pixKey);
  });

  it('should include the formatted amount', () => {
    const payload = generatePixPayload({ ...defaultParams, amount: 99.90 });
    expect(payload).toContain('99.90');
  });

  it('should handle integer amounts', () => {
    const payload = generatePixPayload({ ...defaultParams, amount: 100 });
    expect(payload).toContain('100.00');
  });

  it('should include the merchant name', () => {
    const payload = generatePixPayload(defaultParams);
    expect(payload).toContain('LOJA TESTE');
  });

  it('should include the txid in additional data', () => {
    const payload = generatePixPayload(defaultParams);
    expect(payload).toContain('ORDER123');
  });

  it('should truncate txid to 25 characters', () => {
    const longTxid = 'A'.repeat(50);
    const payload = generatePixPayload({ ...defaultParams, txid: longTxid });
    expect(payload).toContain('A'.repeat(25));
    expect(payload).not.toContain('A'.repeat(26));
  });

  it('should handle merchant name with leading/trailing spaces', () => {
    const payload = generatePixPayload({ ...defaultParams, merchantName: '  LOJA  ' });
    expect(payload).toContain('LOJA');
    expect(payload).not.toContain('  LOJA  ');
  });

  it('should use default city when not provided', () => {
    const payload = generatePixPayload({ ...defaultParams, city: undefined });
    expect(payload).toContain('CIDADE');
  });

  it('should handle PIX key as phone number', () => {
    const payload = generatePixPayload({ ...defaultParams, pixKey: '+5511999999999' });
    expect(payload).toContain('+5511999999999');
  });

  it('should handle PIX key as email', () => {
    const payload = generatePixPayload({ ...defaultParams, pixKey: 'teste@email.com' });
    expect(payload).toContain('teste@email.com');
  });

  it('should handle PIX key as random key (UUID)', () => {
    const payload = generatePixPayload({ ...defaultParams, pixKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });
    expect(payload).toContain('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('should produce deterministic output for same inputs', () => {
    const a = generatePixPayload(defaultParams);
    const b = generatePixPayload(defaultParams);
    expect(a).toBe(b);
  });

  it('should produce different CRC for different amounts', () => {
    const a = generatePixPayload({ ...defaultParams, amount: 10 });
    const b = generatePixPayload({ ...defaultParams, amount: 20 });
    const crcA = a.slice(-4);
    const crcB = b.slice(-4);
    expect(crcA).not.toBe(crcB);
  });

  it('should handle zero amount', () => {
    const payload = generatePixPayload({ ...defaultParams, amount: 0 });
    expect(payload).toContain('0.00');
  });

  it('should handle very small amount', () => {
    const payload = generatePixPayload({ ...defaultParams, amount: 0.01 });
    expect(payload).toContain('0.01');
  });

  it('should handle large amount', () => {
    const payload = generatePixPayload({ ...defaultParams, amount: 999999.99 });
    expect(payload).toContain('999999.99');
  });

  it('should handle unicode characters in merchant name', () => {
    const payload = generatePixPayload({ ...defaultParams, merchantName: 'LOJA ★' });
    expect(payload).toContain('LOJA');
  });

  it('should handle unicode characters in city', () => {
    const payload = generatePixPayload({ ...defaultParams, city: 'SÃO PAULO' });
    expect(payload).toContain('SÃO PAULO');
  });

  it('should handle emoji in merchant name', () => {
    const payload = generatePixPayload({ ...defaultParams, merchantName: 'LOJA 🔥' });
    expect(payload).toContain('LOJA');
  });
});

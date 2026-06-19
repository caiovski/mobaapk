import { fetchCashFlow } from '../../services/cashFlowService';
import { supabase } from '../../data/datasources/supabase/client';

describe('cashFlowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchCashFlow returns data on success', async () => {
    const mockData = [
      { id: '1', amount: 100, description: 'test', type: 'suprimento', payment_method: 'dinheiro', created_at: '2024-01-01', created_by: null }
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await fetchCashFlow();
    expect(result).toEqual(mockData);
  });

  it('fetchCashFlow returns empty array when data is null', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await fetchCashFlow();
    expect(result).toEqual([]);
  });

  it('fetchCashFlow throws when error is present', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });

    await expect(fetchCashFlow()).rejects.toThrow('DB error');
  });
});

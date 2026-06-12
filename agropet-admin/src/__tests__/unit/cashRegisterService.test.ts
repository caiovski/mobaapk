import { calculateTotal, calculateBillsTotal, calculateCoinsTotal, fetchByDate, fetchHistory, saveEntry, updateEntry } from '../../services/cashRegisterService';
import { supabase } from '../../data/datasources/supabase/client';
import type { DenominationInput } from '../../db/schema';

jest.mock('../../data/datasources/supabase/client', () => {
  const mockChain: any = {};
  const builder = () => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: [], error: null });
      }),
    };
    Object.assign(mockChain, chain);
    return chain;
  };
  return {
    supabase: {
      from: jest.fn(() => builder()),
      rpc: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: 'CAIXA-20250101-001', error: null }),
      }),
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

const mockDenominations: DenominationInput = {
  bill_200: 0, bill_100: 1, bill_50: 2, bill_20: 0, bill_10: 3, bill_5: 0, bill_2: 5,
  coin_100: 4, coin_050: 0, coin_025: 6, coin_010: 0, coin_005: 8,
};

describe('cashRegisterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const chain = (supabase.from as jest.Mock)();
    (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
      if (typeof resolve === 'function') resolve({ data: [], error: null });
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      const expected =
        (1 * 100 + 2 * 50 + 0 * 20 + 3 * 10 + 0 * 5 + 5 * 2) +
        (4 * 1 + 0 * 0.5 + 6 * 0.25 + 0 * 0.1 + 8 * 0.05);
      expect(calculateTotal(mockDenominations)).toBe(Math.round(expected * 100) / 100);
    });

    it('should return 0 for empty denominations', () => {
      const empty: DenominationInput = {
        bill_200: 0, bill_100: 0, bill_50: 0, bill_20: 0, bill_10: 0, bill_5: 0, bill_2: 0,
        coin_100: 0, coin_050: 0, coin_025: 0, coin_010: 0, coin_005: 0,
      };
      expect(calculateTotal(empty)).toBe(0);
    });
  });

  describe('calculateBillsTotal', () => {
    it('should calculate bills total only', () => {
      const expected = 1 * 100 + 2 * 50 + 0 * 20 + 3 * 10 + 0 * 5 + 5 * 2;
      expect(calculateBillsTotal(mockDenominations)).toBe(expected);
    });
  });

  describe('calculateCoinsTotal', () => {
    it('should calculate coins total only', () => {
      const expected = 4 * 1 + 0 * 0.5 + 6 * 0.25 + 0 * 0.1 + 8 * 0.05;
      expect(calculateCoinsTotal(mockDenominations)).toBe(Math.round(expected * 100) / 100);
    });
  });

  describe('fetchByDate', () => {
    it('should return opening and closing entries', async () => {
      const mockData = [
        { id: '1', entry_type: 'opening', date: '2025-01-01', bill_100: 1 },
        { id: '2', entry_type: 'closing', date: '2025-01-01', bill_100: 2 },
      ];
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: mockData, error: null });
      });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchByDate('2025-01-01');
      expect(result.opening?.id).toBe('1');
      expect(result.closing?.id).toBe('2');
      expect(supabase.from).toHaveBeenCalledWith('cash_register_entries');
    });

    it('should throw on error', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((_resolve?: any, reject?: (value: any) => any) => {
        if (typeof reject === 'function') reject({ error: { message: 'DB error' } });
        return { data: null, error: { message: 'DB error' } };
      });
      (chain.select as jest.Mock).mockImplementation(() => {
        return { ...chain, eq: jest.fn().mockReturnValue({ ...chain, order: jest.fn().mockReturnValue(chain) }) };
      });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchByDate('2025-01-01')).rejects.toEqual({ error: { message: 'DB error' } });
    });

    it('should throw on resolved error (line 39)', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: { message: 'Resolved error' } });
      });
      (chain.select as jest.Mock).mockImplementation(() => {
        return { ...chain, eq: jest.fn().mockReturnValue({ ...chain, order: jest.fn().mockReturnValue(chain) }) };
      });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchByDate('2025-01-01')).rejects.toEqual({ message: 'Resolved error' });
    });

    it('should return undefined opening/closing when data is null (lines 40-41)', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: null });
      });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchByDate('2025-01-01');
      expect(result.opening).toBeUndefined();
      expect(result.closing).toBeUndefined();
    });
  });

  describe('fetchHistory', () => {
    it('should return opening entries sorted by date desc', async () => {
      const mockData = [
        { id: '1', entry_type: 'opening', date: '2025-01-02' },
        { id: '2', entry_type: 'opening', date: '2025-01-01' },
      ];
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: mockData, error: null });
      });
      (chain.select as jest.Mock).mockReturnValue(chain);
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue({ ...chain, limit: jest.fn().mockReturnValue(chain) }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchHistory();
      expect(result).toHaveLength(2);
      expect(supabase.from).toHaveBeenCalledWith('cash_register_entries');
    });

    it('should throw on error', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((_resolve?: any, reject?: (value: any) => any) => {
        if (typeof reject === 'function') reject({ error: { message: 'History fetch error' } });
        return { data: null, error: { message: 'History fetch error' } };
      });
      (chain.select as jest.Mock).mockReturnValue(chain);
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue({ ...chain, limit: jest.fn().mockReturnValue(chain) }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchHistory()).rejects.toEqual({ error: { message: 'History fetch error' } });
    });

    it('should return empty array when data is null', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: null });
      });
      (chain.select as jest.Mock).mockReturnValue(chain);
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue({ ...chain, limit: jest.fn().mockReturnValue(chain) }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchHistory();
      expect(result).toEqual([]);
    });

    it('should throw on resolved error (line 52)', async () => {
      const chain = (supabase.from as jest.Mock)();
      (chain.then as jest.Mock).mockImplementation((resolve?: (value: any) => any) => {
        if (typeof resolve === 'function') resolve({ data: null, error: { message: 'History resolved error' } });
      });
      (chain.select as jest.Mock).mockReturnValue(chain);
      (chain.eq as jest.Mock).mockReturnValue({ ...chain, order: jest.fn().mockReturnValue({ ...chain, limit: jest.fn().mockReturnValue(chain) }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchHistory()).rejects.toEqual({ message: 'History resolved error' });
    });
  });

  describe('saveEntry', () => {
    it('should save an opening entry and return the record', async () => {
      const mockInserted = { id: 'new-id', code: 'CAIXA-20250101-001', entry_type: 'opening', date: '2025-01-01' };
      const chain = (supabase.from as jest.Mock)();
      const singleMock = jest.fn().mockResolvedValue({ data: mockInserted, error: null });
      (chain.select as jest.Mock).mockReturnValue({ single: singleMock });
      (chain.insert as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ single: singleMock }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await saveEntry('opening', '2025-01-01', mockDenominations);
      expect(result).toEqual(mockInserted);
    });

    it('should throw on rpc error', async () => {
      (supabase.rpc as jest.Mock).mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'RPC error' } }),
      });
      await expect(saveEntry('opening', '2025-01-01', mockDenominations)).rejects.toEqual({ message: 'RPC error' });
    });

    it('should throw on insert error', async () => {
      (supabase.rpc as jest.Mock).mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: 'CAIXA-20250101-001', error: null }),
      });
      const chain = (supabase.from as jest.Mock)();
      const insertSingleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert error' } });
      (chain.select as jest.Mock).mockReturnValue({ single: insertSingleMock });
      (chain.insert as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnValue({ single: insertSingleMock }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(saveEntry('opening', '2025-01-01', mockDenominations)).rejects.toEqual({ message: 'Insert error' });
    });
  });

  describe('updateEntry', () => {
    it('should update an entry and return updated record', async () => {
      const mockUpdated = { id: 'existing-id', edited: true, bill_100: 3 };
      const chain = (supabase.from as jest.Mock)();
      const singleMock = jest.fn().mockResolvedValue({ data: mockUpdated, error: null });
      (chain.select as jest.Mock).mockReturnValue({ single: singleMock });
      (chain.update as jest.Mock).mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: singleMock }) }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await updateEntry('existing-id', mockDenominations);
      expect(result.edited).toBe(true);
    });

    it('should throw on update error', async () => {
      const chain = (supabase.from as jest.Mock)();
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Update error' } });
      (chain.select as jest.Mock).mockReturnValue({ single: singleMock });
      (chain.update as jest.Mock).mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: singleMock }) }) });
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(updateEntry('existing-id', mockDenominations)).rejects.toEqual({ message: 'Update error' });
    });
  });
});

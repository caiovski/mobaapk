import { supabase } from '../data/datasources/supabase/client';
import type { DBCashRegisterEntry, DenominationInput } from '../db/schema';

const BILL_VALUES: Record<string, number> = {
  bill_200: 200, bill_100: 100, bill_50: 50,
  bill_20: 20, bill_10: 10, bill_5: 5, bill_2: 2,
};

const COIN_VALUES: Record<string, number> = {
  coin_100: 1, coin_050: 0.5, coin_025: 0.25,
  coin_010: 0.1, coin_005: 0.05,
};

export function calculateTotal(d: DenominationInput): number {
  let total = 0;
  for (const [k, v] of Object.entries(BILL_VALUES)) total += (d as any)[k] * v;
  for (const [k, v] of Object.entries(COIN_VALUES)) total += (d as any)[k] * v;
  return Math.round(total * 100) / 100;
}

export function calculateBillsTotal(d: DenominationInput): number {
  let total = 0;
  for (const [k, v] of Object.entries(BILL_VALUES)) total += (d as any)[k] * v;
  return Math.round(total * 100) / 100;
}

export function calculateCoinsTotal(d: DenominationInput): number {
  let total = 0;
  for (const [k, v] of Object.entries(COIN_VALUES)) total += (d as any)[k] * v;
  return Math.round(total * 100) / 100;
}

export async function fetchByDate(date: string): Promise<{ opening?: DBCashRegisterEntry; closing?: DBCashRegisterEntry }> {
  const { data, error } = await supabase
    .from('cash_register_entries')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const opening = (data || []).find(e => e.entry_type === 'opening');
  const closing = (data || []).find(e => e.entry_type === 'closing');
  return { opening, closing };
}

export async function fetchHistory(): Promise<DBCashRegisterEntry[]> {
  const { data, error } = await supabase
    .from('cash_register_entries')
    .select('*')
    .eq('entry_type', 'opening')
    .order('date', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function saveEntry(
  entryType: 'opening' | 'closing',
  date: string,
  denominations: DenominationInput,
): Promise<DBCashRegisterEntry> {
  const totalValue = calculateTotal(denominations);
  const { data, error } = await supabase
    .rpc('generate_cash_register_code', { p_date: date })
    .single();
  if (error) throw error;
  const code = data as string;
  const { data: entry, error: insertError } = await supabase
    .from('cash_register_entries')
    .insert({
      code,
      date,
      entry_type: entryType,
      ...denominations,
      total_value: totalValue,
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return entry;
}

export async function updateEntry(
  id: string,
  denominations: DenominationInput,
): Promise<DBCashRegisterEntry> {
  const totalValue = calculateTotal(denominations);
  const { data, error } = await supabase
    .from('cash_register_entries')
    .update({
      ...denominations,
      total_value: totalValue,
      edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

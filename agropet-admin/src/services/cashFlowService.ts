import { supabase } from '../data/datasources/supabase/client';

export interface CashFlowRow {
  id: string;
  amount: number;
  description: string;
  type: 'sangria' | 'suprimento';
  payment_method: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';
  created_at: string;
  created_by: string | null;
}

export type CashFlowInsert = Omit<CashFlowRow, 'id' | 'created_at' | 'created_by'>;

export async function fetchCashFlow(): Promise<CashFlowRow[]> {
  const { data, error } = await supabase
    .from('cash_flow')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertCashFlow(entry: CashFlowInsert): Promise<CashFlowRow> {
  const { data: { session } } = await supabase.auth.getSession();
  /* istanbul ignore next */
  const { data, error } = await supabase
    .from('cash_flow')
    .insert({
      amount: entry.amount,
      description: entry.description,
      type: entry.type,
      payment_method: entry.payment_method,
      created_by: session?.user?.id || null,
    })
    .select()
    .single();
  /* istanbul ignore next */
  if (error) throw error;
  return data;
}

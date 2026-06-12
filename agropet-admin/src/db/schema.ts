export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  avatarUrl?: string;
  push_token?: string;
  created_at?: string;
}

export interface DBProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  image_url: string; // JSON array or single string
  description?: string;
  category_id?: string;
  created_at?: string;
  critical_stock?: number;
  moderate_stock?: number;
  is_bulk?: boolean;
  is_per_meter?: boolean;
}

export interface DBOrder {
  id: string;
  client_id: string;
  total_amount: number;
  shipping_fee: number;
  status: 'pending' | 'completed' | 'cancelled';
  delivery_address: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export interface DBStoreSettings {
  id: string;
  show_greeting_bar: boolean;
  is_open: boolean;
  yellow_stock_margin: number;
  red_stock_margin: number;
  created_at?: string;
}

export interface DBAgropetStoreLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export interface DBCustomCategory {
  id: string;
  name: string;
  keywords: string[];
  active: boolean;
  created_at?: string;
}

export interface DBCashRegisterEntry {
  id: string;
  code: string;
  date: string;
  entry_type: 'opening' | 'closing';
  bill_200: number;
  bill_100: number;
  bill_50: number;
  bill_20: number;
  bill_10: number;
  bill_5: number;
  bill_2: number;
  coin_100: number;
  coin_050: number;
  coin_025: number;
  coin_010: number;
  coin_005: number;
  total_value: number;
  edited: boolean;
  edited_at?: string;
  created_by?: string;
  created_at?: string;
}

export interface DenominationInput {
  bill_200: number;
  bill_100: number;
  bill_50: number;
  bill_20: number;
  bill_10: number;
  bill_5: number;
  bill_2: number;
  coin_100: number;
  coin_050: number;
  coin_025: number;
  coin_010: number;
  coin_005: number;
}

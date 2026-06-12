import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { initDB } from '../../data/datasources/sqlite/database';
import * as SQLite from 'expo-sqlite';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  is_bulk: boolean;
  is_per_meter: boolean;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (product: any, qty?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

export const CartContext = createContext<CartContextProps>({
  cart: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  total: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    initDB()
      .then(database => {
        setDb(database);
        loadCart(database);
      })
      .catch(err => {
        console.error('Failed to initialize SQLite database in CartContext:', err);
      });
  }, []);

  const loadCart = async (database: SQLite.SQLiteDatabase) => {
    try {
      const allRows: any[] = await database.getAllAsync('SELECT * FROM cart');
      const mapped: CartItem[] = (allRows || []).map(row => ({
        ...row,
        is_bulk: row.is_bulk === 1 || row.is_bulk === true,
        is_per_meter: row.is_per_meter === 1 || row.is_per_meter === true,
      }));
      setCart(mapped);
    } catch (error) {
      console.error('Failed to load cart from SQLite:', error);
    }
  };

  const addToCart = async (product: any, qty: number = 1) => {
    if (!db) {
      console.warn('Database is not initialized yet in CartContext.');
      return;
    }
    if (!product || !product.id) {
      console.warn('Cannot add product without a valid id');
      return;
    }
    
    const isBulk = product.is_bulk === true;
    const isPerMeter = product.is_per_meter === true;
    
    try {
      const existing: any = await db.getFirstAsync('SELECT * FROM cart WHERE id = ?', [product.id]);
      
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty <= 0) {
          await db.runAsync('DELETE FROM cart WHERE id = ?', [product.id]);
        } else {
          await db.runAsync('UPDATE cart SET quantity = ?, is_bulk = ?, is_per_meter = ? WHERE id = ?', [newQty, isBulk ? 1 : 0, isPerMeter ? 1 : 0, product.id]);
        }
      } else if (qty > 0) {
        await db.runAsync(
          'INSERT INTO cart (id, name, price, quantity, image_url, is_bulk, is_per_meter) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [product.id, product.name, product.price, qty, product.image_url ?? '', isBulk ? 1 : 0, isPerMeter ? 1 : 0]
        );
      }
      
      await loadCart(db);
    } catch (error) {
      console.error('Error adding item to cart SQLite:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!db || id === undefined || id === null) return;
    try {
      await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
      await loadCart(db);
    } catch (error) {
      console.error('Error removing item from cart SQLite:', error);
    }
  };

  const clearCart = async () => {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM cart');
      await loadCart(db);
    } catch (error) {
      console.error('Error clearing cart SQLite:', error);
    }
  };

  const total = cart.reduce((acc, item) => {
    const effectiveQty = item.is_bulk ? item.quantity / 1000 : item.quantity;
    return acc + (item.price * effectiveQty);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

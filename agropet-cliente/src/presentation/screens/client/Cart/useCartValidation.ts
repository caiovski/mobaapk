import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../../data/datasources/supabase/client';
import * as SecureStore from 'expo-secure-store';

export default function useCartValidation(cart: any[], removeFromCart: any, addToCart: any) {
  const [removedAlert, setRemovedAlert] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0) return;

    const validateCartItems = async () => {
      try {
        const productIds = cart.map(item => item.id);
        const { data, error } = await supabase
          .from('products')
          .select('id, name, active, stock, updated_at')
          .in('id', productIds);

        if (error) return;

        const activeProducts = data || [];
        const removedNames: string[] = [];

        for (const item of cart) {
          const dbProd = activeProducts.find(p => p.id === item.id);
          if (!dbProd || !dbProd.active || dbProd.stock <= 0) {
            await removeFromCart(item.id);

            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const updatedAtDate = dbProd?.updated_at ? new Date(dbProd.updated_at) : new Date(0);
            const isRecent = updatedAtDate >= oneDayAgo;

            if (isRecent) {
              removedNames.push(item.name);
            }
          } else if (dbProd.stock < item.quantity) {
            const diff = item.quantity - dbProd.stock;
            await addToCart(item, -diff);
            Alert.alert(
              'Ajuste de Estoque',
              `A quantidade de "${item.name}" foi reduzida para ${dbProd.stock} pois o estoque disponível diminuiu.`
            );
          }
        }

        if (removedNames.length > 0) {
          try {
            const seenRaw = await SecureStore.getItemAsync('seen_removed_carrinho');
            const seenList: string[] = seenRaw ? JSON.parse(seenRaw) : [];

            const unseenNames = removedNames.filter(name => !seenList.includes(name));

            if (unseenNames.length > 0) {
              setRemovedAlert(unseenNames.join(', '));

              const updatedSeenList = [...seenList, ...unseenNames];
              await SecureStore.setItemAsync('seen_removed_carrinho', JSON.stringify(updatedSeenList));
            }
          } catch (storageErr) {
            console.log('Erro ao ler/salvar no SecureStore:', storageErr);
            setRemovedAlert(removedNames.join(', '));
          }
        }
      } catch (err) {
        console.log('Erro ao validar itens do carrinho:', err);
      }
    };

    validateCartItems();
  }, [cart.length]);

  return { removedAlert, setRemovedAlert };
}

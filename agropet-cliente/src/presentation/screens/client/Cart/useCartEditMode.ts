import { useState, useCallback, useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function useCartEditMode(cart: any[], addToCart: any, removeFromCart: any) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [decreases, setDecreases] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isEditMode) {
          setIsEditMode(false);
          setSelectedItems(new Set());
          setDecreases({});
          return true;
        }
        return false;
      };

      if (BackHandler && BackHandler.addEventListener) {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => {
          if (subscription && subscription.remove) {
            subscription.remove();
          } else if ((BackHandler as any).removeEventListener) {
            (BackHandler as any).removeEventListener('hardwareBackPress', onBackPress);
          }
        };
      }
    }, [isEditMode])
  );

  const groupedCart = cart.reduce((acc: any[], item: any) => {
    const existing = acc.find((p: any) => p.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(groupedCart.map((item: any) => item.id)));
  };

  const handleDecrease = (id: string, maxQty: number) => {
    setDecreases(prev => {
      const currentDec = prev[id] || 0;
      if (currentDec < maxQty - 1) {
        return { ...prev, [id]: currentDec + 1 };
      }
      return prev;
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedItems(new Set());
    setDecreases({});
  };

  const handleRemoverPress = async () => {
    if (!isEditMode) {
      if (cart.length === 0) return;
      setIsEditMode(true);
      setSelectedItems(new Set());
      setDecreases({});
      return;
    }

    const checkedCount = selectedItems.size;
    const decreasedCount = Object.keys(decreases).filter(id => decreases[id] > 0).length;

    if (checkedCount === 0 && decreasedCount === 0) {
      setIsEditMode(false);
      return;
    }

    const findItemName = (id: string) => {
      const item = cart.find(i => i.id === id);
      return item ? item.name : 'Produto';
    };

    let message = '';

    if (checkedCount === groupedCart.length && decreasedCount === 0) {
      message = 'Tem certeza que deseja apagar todos os itens do carrinho?';
    } else if (checkedCount === 0 && decreasedCount === 1) {
      const id = Object.keys(decreases).find(k => decreases[k] > 0) || '';
      message = `Tem certeza que deseja diminuir a quantidade de ${findItemName(id)}?`;
    } else if (checkedCount === 1 && decreasedCount === 0) {
      const id = Array.from(selectedItems)[0];
      message = `Tem certeza que deseja excluir ${findItemName(id)} do carrinho?`;
    } else if (checkedCount === 1 && decreasedCount === 1) {
      const decId = Object.keys(decreases).find(k => decreases[k] > 0) || '';
      const checkId = Array.from(selectedItems)[0];
      message = `Tem certeza que deseja diminuir a quantidade do item ${findItemName(decId)} e excluir o item ${findItemName(checkId)} do carrinho?`;
    } else {
      message = `Tem certeza que deseja diminuir a quantidade de ${decreasedCount} item(ns) e excluir ${checkedCount} item(ns) do carrinho?`;
    }

    Alert.alert('Confirmação', message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            for (const id of Array.from(selectedItems)) {
              await removeFromCart(id);
            }

            for (const [id, qty] of Object.entries(decreases)) {
              if (selectedItems.has(id)) continue;
              if (qty > 0) {
                const item = cart.find(i => i.id === id);
                if (item) {
                  await addToCart(item, -qty);
                }
              }
            }
          } catch (error) {
            console.error('Erro ao atualizar carrinho:', error);
          } finally {
            setIsEditMode(false);
            setSelectedItems(new Set());
            setDecreases({});
          }
        }
      }
    ]);
  };

  return {
    isEditMode, setIsEditMode,
    selectedItems, setSelectedItems,
    decreases, setDecreases,
    groupedCart,
    handleToggleSelect, handleSelectAll, handleDecrease,
    handleCancelEdit, handleRemoverPress,
  };
}

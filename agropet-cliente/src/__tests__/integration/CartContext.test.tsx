import React, { useContext } from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import { CartContext, CartProvider } from '../../presentation/contexts/CartContext';
import { initDB } from '../../data/datasources/sqlite/database';

jest.mock('../../data/datasources/sqlite/database', () => ({
  initDB: jest.fn(),
}));

const mockDb = {
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
};

function CartConsumer() {
  const { cart, addToCart, removeFromCart, clearCart, total } = useContext(CartContext);

  return (
    <View>
      <Text testID="cart-length">{cart.length}</Text>
      <Text testID="cart-total">{total}</Text>
      {cart.map(item => (
        <Text key={item.id} testID={`item-${item.id}`}>{`${item.name}-${item.quantity}`}</Text>
      ))}
      <Button title="Add A" onPress={() => addToCart({ id: 'p-1', name: 'Product A', price: 10, image_url: 'img' }, 2)} />
      <Button title="Add B" onPress={() => addToCart({ id: 'p-2', name: 'Product B', price: 20 }, 1)} />
      <Button title="Add Default" onPress={() => addToCart({ id: 'p-3', name: 'Product C', price: 5 })} />
      <Button title="Dec A" onPress={() => addToCart({ id: 'p-1' }, -2)} />
      <Button title="Remove A" onPress={() => removeFromCart('p-1')} />
      <Button title="Clear" onPress={() => clearCart()} />
      <Button title="Add Invalid" onPress={() => addToCart({ name: 'No ID' } as any)} />
      <Button title="Add Bulk" onPress={() => addToCart({ id: 'p-4', name: 'Bulk Item', price: 10, is_bulk: true, image_url: '' }, 1000)} />
      <Button title="Add Meter" onPress={() => addToCart({ id: 'p-5', name: 'Meter Item', price: 5, is_per_meter: true, image_url: '' }, 3)} />
    </View>
  );
}

describe('CartContext & CartProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (initDB as jest.Mock).mockResolvedValue(mockDb);
    mockDb.getAllAsync.mockResolvedValue([]);
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
  });

  it('should initialize the database, load cart items and calculate total', async () => {
    const mockCart = [
      { id: 'p-1', name: 'Product A', price: 10, quantity: 2, image_url: 'img' },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockCart);

    const { getByTestId } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(getByTestId('cart-length').props.children).toBe(1);
      expect(getByTestId('cart-total').props.children).toBe(20);
      expect(getByTestId('item-p-1').props.children).toBe('Product A-2');
    });
  });

  it('should handle database initialization failures gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (initDB as jest.Mock).mockRejectedValue(new Error('initDB failure'));

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('should handle loadCart failures gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDb.getAllAsync.mockRejectedValue(new Error('getAllAsync failure'));

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('should add a new item to cart if it does not exist', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    // Simulate clicking Add A
    await act(async () => {
      fireEvent.press(getByText('Add A'));
    });

    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.any(String), ['p-1']);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cart'),
      ['p-1', 'Product A', 10, 2, 'img', 0, 0]
    );
  });

  it('should add a new item with default image if image_url is missing', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add B'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cart'),
      ['p-2', 'Product B', 20, 1, '', 0, 0]
    );
  });

  it('should update quantity of an existing item', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ id: 'p-1', name: 'Product A', price: 10, quantity: 2, image_url: 'img' });

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add A'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE cart SET quantity = ?, is_bulk = ?, is_per_meter = ? WHERE id = ?'),
      [4, 0, 0, 'p-1']
    );
  });

  it('should delete existing item if quantity becomes 0 or negative', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ id: 'p-1', name: 'Product A', price: 10, quantity: 2, image_url: 'img' });

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Dec A'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM cart WHERE id = ?'),
      ['p-1']
    );
  });

  it('should handle error when adding item', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDb.getFirstAsync.mockRejectedValue(new Error('Database select fail'));

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add A'));
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should remove item from cart', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Remove A'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM cart WHERE id = ?', ['p-1']);
  });

  it('should handle error when removing item', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDb.runAsync.mockRejectedValue(new Error('Delete error'));

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Remove A'));
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should clear cart', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Clear'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM cart');
  });

  it('should handle error when clearing cart', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDb.runAsync.mockRejectedValue(new Error('Clear error'));

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Clear'));
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should warn and do nothing if adding to cart before database is initialized', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (initDB as jest.Mock).mockRejectedValue(new Error('initDB failure'));

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add A'));
    });

    expect(warnSpy).toHaveBeenCalledWith('Database is not initialized yet in CartContext.');
    consoleSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should do nothing on removeFromCart and clearCart if database is not initialized', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (initDB as jest.Mock).mockRejectedValue(new Error('initDB failure'));

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Remove A'));
    });

    await act(async () => {
      fireEvent.press(getByText('Clear'));
    });

    expect(mockDb.runAsync).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should fallback to empty array if loadCart returns null', async () => {
    mockDb.getAllAsync.mockResolvedValue(null);

    const { getByTestId } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(getByTestId('cart-length').props.children).toBe(0);
    });
  });

  it('should not add item if quantity is zero or negative and item is not in cart', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Dec A'));
    });

    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('should add item with default quantity of 1 if qty is not specified', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add Default'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cart'),
      ['p-3', 'Product C', 5, 1, '', 0, 0]
    );
  });

  it('should cover default createContext values', async () => {
    let defaultContextVal: any;
    function DummyConsumer() {
      defaultContextVal = React.useContext(CartContext);
      return null;
    }
    render(<DummyConsumer />);
    await defaultContextVal.addToCart();
    await defaultContextVal.removeFromCart();
    await defaultContextVal.clearCart();
  });

  it('should warn and do nothing if adding product without valid id', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add Invalid'));
    });

    expect(warnSpy).toHaveBeenCalledWith('Cannot add product without a valid id');
    warnSpy.mockRestore();
  });

  it('should add item with is_bulk flag and cover ternary branches', async () => {
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add Bulk'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cart'),
      ['p-4', 'Bulk Item', 10, 1000, '', 1, 0]
    );
  });

  it('should add item with is_per_meter flag', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add Meter'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cart'),
      ['p-5', 'Meter Item', 5, 3, '', 0, 1]
    );
  });

  it('should update existing item with is_bulk flags', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ id: 'p-4', name: 'Bulk Item', price: 10, quantity: 1000, image_url: '', is_bulk: 1 });

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add Bulk'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE cart SET quantity = ?, is_bulk = ?, is_per_meter = ? WHERE id = ?'),
      [2000, 1, 0, 'p-4']
    );
  });

  it('should calculate total with is_bulk items using division by 1000', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 'p-4', name: 'Bulk Item', price: 10, quantity: 2000, image_url: '', is_bulk: 1, is_per_meter: 0 },
    ]);

    const { getByTestId } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(getByTestId('cart-total').props.children).toBe(20);
    });
  });

  it('should update existing item with is_per_meter flag', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ id: 'p-5', name: 'Meter Item', price: 5, quantity: 3, image_url: '', is_per_meter: 1 });

    const { getByText } = render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(initDB).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.press(getByText('Add Meter'));
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE cart SET quantity = ?, is_bulk = ?, is_per_meter = ? WHERE id = ?'),
      [6, 0, 1, 'p-5']
    );
  });
});

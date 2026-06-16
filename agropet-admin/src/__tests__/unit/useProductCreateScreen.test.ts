import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  MediaTypeOptions: { Images: 'Images' },
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, addListener: jest.fn().mockReturnValue(jest.fn()) }),
}));

jest.mock('../../presentation/contexts/ThemeContext', () => {
  const actual = jest.requireActual('../../presentation/contexts/ThemeContext');
  return {
    ...actual,
    useTheme: () => ({
      isDarkMode: false,
      colors: actual.lightColors,
      toggleTheme: jest.fn(),
    })
  };
});

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
}));

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'fake-path.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://fake-url.com/fake-path.jpg' } }),
      }),
    },
  },
}));

import { useProductCreateScreen } from '../../presentation/screens/admin/ProductCreate/useProductCreateScreen';

let hookResult: any;
function TestComponent() {
  const h = useProductCreateScreen();
  React.useEffect(() => { hookResult = h; }, [h]);
  return null;
}

describe('useProductCreateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  function setup() {
    hookResult = null;
    render(React.createElement(TestComponent));
  }

  it('should set critical_stock and moderate_stock in payload when truthy (lines 120-121)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Test Product');
      hookResult.setPrice('99.90');
      hookResult.setQuantity('10');
      hookResult.setCriticalStock('5');
      hookResult.setModerateStock('15');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        critical_stock: 5,
        moderate_stock: 15,
      })
    ]);
  });

  it('should set critical_stock and moderate_stock with "0" value (parseInt edge case)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Zero Stock');
      hookResult.setPrice('50');
      hookResult.setQuantity('10');
      hookResult.setCriticalStock('0');
      hookResult.setModerateStock('0');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        critical_stock: 0,
        moderate_stock: 0,
      })
    ]);
  });

  it('should handle handleRegister validation failure', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should set image_url as null when no photos', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('No Photo Product');
      hookResult.setPrice('25');
      hookResult.setQuantity('5');
      hookResult.setCriticalStock('2');
      hookResult.setModerateStock('10');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'No Photo Product',
        image_url: null,
        critical_stock: 2,
        moderate_stock: 10,
      })
    ]);
  });

  it('should call supabase and log error on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Fail Product');
      hookResult.setPrice('30');
      hookResult.setQuantity('8');
      hookResult.setCriticalStock('1');
      hookResult.setModerateStock('5');
    });

    const err = new Error('Insert failed');
    const insertMock = jest.fn().mockResolvedValue({ error: err });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Não foi possível registrar o produto.');
    expect(consoleSpy).toHaveBeenCalledWith(err);
    consoleSpy.mockRestore();
  });

  it('should not reach lines 120-121 when criticalStock is empty (validation guard)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Test');
      hookResult.setPrice('10');
      hookResult.setQuantity('5');
    });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Atenção',
      expect.stringContaining('preencha todos os campos obrigatórios')
    );
  });

  it('should handle bulk product conversion (Kg to grams)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Bulk Product');
      hookResult.setPrice('12.50');
      hookResult.setQuantity('1.5');
      hookResult.setCriticalStock('500');
      hookResult.setModerateStock('2000');
      hookResult.setProductType('bulk');
      hookResult.setSelectedUnit('kg');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Bulk Product',
        stock: 1500,
        is_bulk: true,
      })
    ]);
  });

  it('should handle bulk product conversion (g to grams)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Bulk Product G');
      hookResult.setPrice('10');
      hookResult.setQuantity('800');
      hookResult.setCriticalStock('200');
      hookResult.setModerateStock('1000');
      hookResult.setProductType('bulk');
      hookResult.setSelectedUnit('g');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Bulk Product G',
        stock: 800,
        is_bulk: true,
      })
    ]);
  });

  it('should toggle isBulk and selectedUnit', () => {
    setup();
    expect(hookResult).toBeTruthy();

    expect(hookResult.isBulk).toBe(false);
    expect(hookResult.selectedUnit).toBe('kg');

    act(() => { hookResult.setProductType('bulk'); });
    expect(hookResult.isBulk).toBe(true);

    act(() => { hookResult.setSelectedUnit('g'); });
    expect(hookResult.selectedUnit).toBe('g');
  });

  it('should parse bulk quantity with comma decimal separator', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Bulk Comma');
      hookResult.setPrice('15');
      hookResult.setQuantity('2,500');
      hookResult.setCriticalStock('500');
      hookResult.setModerateStock('1000');
      hookResult.setProductType('bulk');
      hookResult.setSelectedUnit('kg');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        stock: 2500,
        is_bulk: true,
      })
    ]);
  });

  it('should handle per meter product stock parsing', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Meter Product');
      hookResult.setPrice('25');
      hookResult.setQuantity('3.5');
      hookResult.setCriticalStock('1');
      hookResult.setModerateStock('10');
      hookResult.setProductType('per_meter');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Meter Product',
        stock: 3.5,
        is_per_meter: true,
      })
    ]);
  });

  it('should navigate to Gerenciar on success', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Success Product');
      hookResult.setPrice('40');
      hookResult.setQuantity('12');
      hookResult.setCriticalStock('3');
      hookResult.setModerateStock('7');
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const { supabase } = require('../../data/datasources/supabase/client');
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await act(async () => {
      await hookResult.handleRegister();
    });

    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const successCall = alertCalls.find((c: any[]) => c[0] === 'Sucesso');
    expect(successCall).toBeTruthy();
    const buttons = successCall[2];
    const okBtn = buttons.find((b: any) => b.text === 'OK');
    okBtn.onPress();
    expect(mockNavigate).toHaveBeenCalledWith('Gerenciar');
  });
});

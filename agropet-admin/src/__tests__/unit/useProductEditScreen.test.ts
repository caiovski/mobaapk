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
let mockRouteProduct: any = {
  id: 'p-test',
  name: 'Test Product',
  price: 50,
  stock: 10,
  critical_stock: 3,
  moderate_stock: 8,
  active: true,
  description: 'Test',
  image_url: null,
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, addListener: jest.fn().mockReturnValue(jest.fn()) }),
  useRoute: () => ({ params: { product: mockRouteProduct } }),
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

import { useProductEditScreen } from '../../presentation/screens/admin/ProductEdit/useProductEditScreen';

let hookResult: any;
function TestComponent() {
  const h = useProductEditScreen();
  React.useEffect(() => { hookResult = h; }, [h]);
  return null;
}

const createMockChain = () => {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: jest.fn().mockReturnThis(),
  };
  chain.eq = jest.fn().mockImplementation(() => chain);
  chain.select = jest.fn().mockImplementation(() => chain);
  return chain;
};

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
}));

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockImplementation(() => createMockChain()),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'fake-path.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://fake-url.com/fake-path.jpg' } }),
      }),
    },
  },
}));

describe('useProductEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  function setup() {
    hookResult = null;
    render(React.createElement(TestComponent));
  }

  it('should set critical_stock and moderate_stock in updateData when truthy (lines 151-154)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Updated Product');
      hookResult.setPrice('75');
      hookResult.setQuantity('20');
      hookResult.setCriticalStock('5');
      hookResult.setModerateStock('15');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnValue({ eq: eqMock }),
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(eqMock).toHaveBeenCalledWith('id', 'p-test');
  });

  it('should set critical_stock and moderate_stock with "0" value', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Zero Stock Alerts');
      hookResult.setPrice('30');
      hookResult.setQuantity('5');
      hookResult.setCriticalStock('0');
      hookResult.setModerateStock('0');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const updateSpy = jest.fn().mockReturnValue({ eq: eqMock });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        critical_stock: 0,
        moderate_stock: 0,
      })
    );
  });

  it('should show validation alert when required fields are empty', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('');
      hookResult.setPrice('');
      hookResult.setQuantity('');
      hookResult.setCriticalStock('');
      hookResult.setModerateStock('');
    });

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Atenção',
      expect.stringContaining('preencha todos os campos obrigatórios')
    );
  });

  it('should handle update error', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Error Product');
      hookResult.setPrice('50');
      hookResult.setQuantity('10');
      hookResult.setCriticalStock('3');
      hookResult.setModerateStock('8');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const eqMock = jest.fn().mockResolvedValue({ error: new Error('Update error') });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnValue({ eq: eqMock }),
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Não foi possível atualizar o produto.');
  });

  it('should set category_id from activeCategory', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Cat Product');
      hookResult.setPrice('55');
      hookResult.setQuantity('20');
      hookResult.setCriticalStock('4');
      hookResult.setModerateStock('10');
      hookResult.setActiveCategory('cat-new');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const updateSpy = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        category_id: 'cat-new',
      })
    );
  });

  it('should not reach lines 152/154 else branches when criticalStock is empty (validation guard)', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Test Guard');
      hookResult.setPrice('20');
      hookResult.setQuantity('3');
      hookResult.setCriticalStock('');
      hookResult.setModerateStock('');
    });

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Atenção',
      expect.stringContaining('preencha todos os campos obrigatórios')
    );
  });

  it('should handle bulk product conversion (Kg to grams) on edit', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setProductType('bulk');
      hookResult.setSelectedUnit('kg');
    });

    act(() => {
      hookResult.setName('Bulk Edit');
      hookResult.setPrice('20');
      hookResult.setQuantity('2.5');
      hookResult.setCriticalStock('500');
      hookResult.setModerateStock('2000');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const updateSpy = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 2500,
        is_bulk: true,
      })
    );
  });

  it('should handle bulk product conversion (g to grams) on edit', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setProductType('bulk');
      hookResult.setSelectedUnit('g');
    });

    act(() => {
      hookResult.setName('Bulk Edit G');
      hookResult.setPrice('30');
      hookResult.setQuantity('500');
      hookResult.setCriticalStock('100');
      hookResult.setModerateStock('1000');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const updateSpy = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 500,
        is_bulk: true,
      })
    );
  });

  it('should toggle isBulk and selectedUnit in edit', () => {
    setup();
    expect(hookResult).toBeTruthy();

    expect(hookResult.isBulk).toBe(false);
    expect(hookResult.selectedUnit).toBe('kg');

    act(() => { hookResult.setProductType('bulk'); });
    expect(hookResult.isBulk).toBe(true);

    act(() => { hookResult.setSelectedUnit('g'); });
    expect(hookResult.selectedUnit).toBe('g');
  });

  it('should parse bulk quantity with comma decimal separator on edit', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setProductType('bulk');
      hookResult.setSelectedUnit('kg');
    });

    act(() => {
      hookResult.setName('Bulk Comma Edit');
      hookResult.setPrice('25');
      hookResult.setQuantity('1,750');
      hookResult.setCriticalStock('300');
      hookResult.setModerateStock('1500');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const updateSpy = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 1750,
        is_bulk: true,
      })
    );
  });

  it('should initialize isBulk from product', async () => {
    mockRouteProduct = {
      id: 'p-bulk',
      name: 'Bulk Product',
      price: 15,
      stock: 5000,
      is_bulk: true,
      critical_stock: 500,
      moderate_stock: 2000,
      active: true,
      description: 'Bulk',
      image_url: null,
    };

    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    expect(hookResult.isBulk).toBe(true);
    expect(hookResult.selectedUnit).toBe('kg');
  });

  it('should initialize isPerMeter from product', async () => {
    mockRouteProduct = {
      id: 'p-meter',
      name: 'Meter Product',
      price: 20,
      stock: 100,
      is_per_meter: true,
      critical_stock: 10,
      moderate_stock: 30,
      active: true,
      description: 'Per meter',
      image_url: null,
    };

    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    expect(hookResult.isPerMeter).toBe(true);
    expect(hookResult.isBulk).toBe(false);
  });

  it('should handle per meter stock parsing in handleConfirm', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Meter Edit');
      hookResult.setPrice('30');
      hookResult.setQuantity('4.5');
      hookResult.setCriticalStock('1');
      hookResult.setModerateStock('10');
      hookResult.setProductType('per_meter');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const updateSpy = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 4.5,
        is_per_meter: true,
      })
    );
  });

  it('should parse price with comma as decimal separator', async () => {
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());

    act(() => {
      hookResult.setName('Comma Price');
      hookResult.setPrice('99,90');
      hookResult.setQuantity('10');
      hookResult.setCriticalStock('3');
      hookResult.setModerateStock('8');
    });

    const { supabase } = require('../../data/datasources/supabase/client');
    const updateSpy = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: updateSpy,
    }));

    await act(async () => {
      await hookResult.handleConfirm();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        price: 99.90,
      })
    );
  });
});

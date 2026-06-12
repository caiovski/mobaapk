import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { useCategories } from '../../presentation/contexts/useCategories';
import * as service from '../../services/categoryService';

jest.mock('../../services/categoryService', () => ({
  fetchActiveCategories: jest.fn(),
  fetchAllCategories: jest.fn(),
  createCategory: jest.fn(),
  toggleCategoryActive: jest.fn(),
  deleteCategory: jest.fn(),
}));

let hookResult: any;
function TestComponent() {
  const r = useCategories();
  React.useEffect(() => { hookResult = r; }, [r]);
  return null;
}

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue([]);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue([]);
  });

  function setup() {
    hookResult = null;
    render(React.createElement(TestComponent));
  }

  it('should load active and all categories on mount', async () => {
    const mockActive = [{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }];
    const mockAll = [{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }];
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockAll);
    setup();
    await waitFor(() => {
      expect(hookResult?.categories).toEqual(mockActive);
      expect(hookResult?.allCategories).toEqual(mockAll);
    });
  });

  it('handleCreate should call createCategory and reload (lines 34-35)', async () => {
    const mockActive = [{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }];
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockActive);
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());
    (service.fetchActiveCategories as jest.Mock).mockClear();
    (service.fetchAllCategories as jest.Mock).mockClear();
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockActive);
    await act(async () => {
      await hookResult.createCategory('New Cat', ['keyword']);
    });
    expect(service.createCategory).toHaveBeenCalledWith('New Cat', ['keyword']);
    await waitFor(() => expect(service.fetchActiveCategories).toHaveBeenCalled());
  });

  it('handleToggleActive should call toggleCategoryActive and reload (lines 39-40)', async () => {
    const mockActive = [{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }];
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockActive);
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());
    (service.fetchActiveCategories as jest.Mock).mockClear();
    (service.fetchAllCategories as jest.Mock).mockClear();
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockActive);
    await act(async () => {
      await hookResult.toggleActive('1', false);
    });
    expect(service.toggleCategoryActive).toHaveBeenCalledWith('1', false);
    await waitFor(() => expect(service.fetchActiveCategories).toHaveBeenCalled());
  });

  it('handleDelete should call deleteCategory and reload (lines 44-45)', async () => {
    const mockActive = [{ id: '1', name: 'Pesca', keywords: ['pesca'], active: true }];
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockActive);
    setup();
    await waitFor(() => expect(hookResult).toBeTruthy());
    (service.fetchActiveCategories as jest.Mock).mockClear();
    (service.fetchAllCategories as jest.Mock).mockClear();
    (service.fetchActiveCategories as jest.Mock).mockResolvedValue(mockActive);
    (service.fetchAllCategories as jest.Mock).mockResolvedValue(mockActive);
    await act(async () => {
      await hookResult.deleteCategory('1');
    });
    expect(service.deleteCategory).toHaveBeenCalledWith('1');
    await waitFor(() => expect(service.fetchActiveCategories).toHaveBeenCalled());
  });

  it('should handle fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.fetchActiveCategories as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    (service.fetchAllCategories as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    setup();
    await waitFor(() => expect(hookResult?.loading).toBe(false));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

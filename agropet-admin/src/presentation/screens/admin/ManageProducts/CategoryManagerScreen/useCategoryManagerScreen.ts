import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../../data/datasources/supabase/client';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCategories } from '../../../../contexts/useCategories';

export function useCategoryManagerScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const { allCategories, loading, reload, createCategory, toggleActive, deleteCategory } = useCategories();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const toggleCollapse = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startEditing = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditKeywords(cat.keywords.join(', '));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditKeywords('');
  };

  const saveEditing = async () => {
    /* istanbul ignore next */ if (!editingId || !editName.trim()) return;
    const keywords = editKeywords.split(',').map(k => k.trim()).filter(Boolean);
    const { error } = await supabase
      .from('custom_categories')
      .update({ name: editName.trim(), keywords })
      .eq('id', editingId);
    /* istanbul ignore next */ if (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a categoria.');
      return;
    }
    setEditingId(null);
    setEditName('');
    setEditKeywords('');
    await reload();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Excluir Categoria',
      `Tem certeza que deseja excluir a categoria "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => { await deleteCategory(id); } },
      ]
    );
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const keywords = newKeywords.split(',').map(k => k.trim()).filter(Boolean);
    await createCategory(trimmed, keywords);
    setNewName('');
    setNewKeywords('');
    setShowCreateModal(false);
  };

  return {
    colors, isDarkMode, navigation,
    allCategories, loading,
    editingId, editName, setEditName, editKeywords, setEditKeywords,
    showCreateModal, setShowCreateModal,
    newName, setNewName, newKeywords, setNewKeywords,
    expandedIds, refreshing, onRefresh,
    toggleCollapse,
    startEditing, cancelEditing, saveEditing,
    handleDelete, handleCreate,
    toggleActive, reload,
  };
}

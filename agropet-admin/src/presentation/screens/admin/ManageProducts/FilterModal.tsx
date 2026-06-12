import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import type { DBCustomCategory } from '../../../../db/schema';

export type SortOption = 'alpha' | 'newest' | 'oldest' | 'most_stock' | 'highest_price' | 'lowest_price';

interface FilterModalProps {
  visible: boolean;
  isDarkMode: boolean;
  colors: any;
  tempStatusFilter: string;
  tempAlertYellowFilter: boolean;
  tempAlertRedFilter: boolean;
  tempSortOption: SortOption;
  onSelectStatus: (s: string) => void;
  onToggleYellow: () => void;
  onToggleRed: () => void;
  onSelectSort: (option: SortOption) => void;
  onApply: () => void;
  onClose: () => void;
  allCategories: DBCustomCategory[];
  categories: DBCustomCategory[];
  onCreateCategory: (name: string, keywords: string[]) => Promise<void>;
  onToggleCategoryActive: (id: string, active: boolean) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'alpha', label: 'Ordem alfabética' },
  { value: 'newest', label: 'Produtos mais novos' },
  { value: 'oldest', label: 'Produtos mais velhos' },
  { value: 'most_stock', label: 'Mais estoque' },
  { value: 'highest_price', label: 'Maior preço' },
  { value: 'lowest_price', label: 'Menor preço' },
];

export const FilterModal = ({
  visible, isDarkMode, colors, tempStatusFilter, tempAlertYellowFilter, tempAlertRedFilter, tempSortOption,
  onSelectStatus, onToggleYellow, onToggleRed, onSelectSort, onApply, onClose,
  allCategories, categories, onCreateCategory, onToggleCategoryActive, onDeleteCategory
}: FilterModalProps) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [editCatName, setEditCatName] = useState('');
  const [editCatKeywords, setEditCatKeywords] = useState('');

  const renderRadio = (status: string, label: string) => {
    const isSelected = tempStatusFilter === status;
    const isDisabled = status === 'Inativos' && (tempAlertYellowFilter || tempAlertRedFilter);
    return (
      <TouchableOpacity key={status} activeOpacity={isDisabled ? 1 : 0.7}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB', opacity: isDisabled ? 0.4 : 1 }}
        onPress={() => { if (!isDisabled) onSelectStatus(status); }}>
        <Text style={{ fontSize: 14, color: isDarkMode ? '#FFFFFF' : '#1C2434', fontWeight: isSelected ? 'bold' : 'normal', flex: 1 }}>{label}</Text>
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: isSelected ? '#25BE36' : (isDarkMode ? '#888888' : '#A8A8B3'), alignItems: 'center', justifyContent: 'center' }}>
          {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#25BE36' }} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderToggle = (label: string, icon: string, isChecked: boolean, color: string, activeBg: string, inactiveBg: string, onToggle: () => void) => {
    const disabled = tempStatusFilter === 'Inativos';
    return (
      <TouchableOpacity activeOpacity={disabled ? 1 : 0.7} onPress={onToggle}
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10, backgroundColor: disabled ? (isDarkMode ? '#222225' : '#F0F0F2') : (isChecked ? activeBg : inactiveBg), borderColor: disabled ? '#CCCCCC' : color, marginBottom: 10, opacity: disabled ? 0.4 : 1 }}>
        <Feather name={icon} size={16} color={disabled ? '#888888' : color} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: disabled ? '#888888' : (isDarkMode ? '#FFE082' : '#B78103'), flex: 1 }}>{label}</Text>
        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1.2, borderColor: disabled ? '#888888' : color, backgroundColor: isChecked ? color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {isChecked && <Feather name="check" size={12} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSortRadio = (option: SortOption, label: string) => {
    const isSelected = tempSortOption === option;
    return (
      <TouchableOpacity key={option} activeOpacity={0.7}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}
        onPress={() => onSelectSort(option)}>
        <Text style={{ fontSize: 14, color: isDarkMode ? '#FFFFFF' : '#1C2434', fontWeight: isSelected ? 'bold' : 'normal', flex: 1 }}>{label}</Text>
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: isSelected ? '#25BE36' : (isDarkMode ? '#888888' : '#A8A8B3'), alignItems: 'center', justifyContent: 'center' }}>
          {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#25BE36' }} />}
        </View>
      </TouchableOpacity>
    );
  };

  const handleCreateCategory = async () => {
    const trimmed = editCatName.trim();
    if (!trimmed) return;
    const keywords = editCatKeywords.split(',').map(k => k.trim()).filter(Boolean);
    await onCreateCategory(trimmed, keywords);
    setEditCatName('');
    setEditCatKeywords('');
  };

  const handleCreateAndCloseManage = async () => {
    await handleCreateCategory();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.whiteModalContainer, { backgroundColor: isDarkMode ? '#2E2E38' : '#FFFFFF' }]}>
            <Text style={[styles.whiteModalTitle, { color: isDarkMode ? '#FFFFFF' : '#1C2434' }]}>Filtrar Produtos</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01' }]}>Situação</Text>
              {renderRadio('Todos', 'Todos os produtos')}
              {renderRadio('Ativos', 'Somente ativos')}
              {renderRadio('Inativos', 'Somente inativos')}
              <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01', marginTop: 20, marginBottom: 10 }]}>Ordenar por</Text>
              {SORT_OPTIONS.map(o => renderSortRadio(o.value, o.label))}
              <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01', marginTop: 20, marginBottom: 10 }]}>Alertas de estoque</Text>
              {renderToggle('Estoque Moderado (Alerta Amarelo)', 'alert-triangle', tempAlertYellowFilter, '#FFB300', isDarkMode ? '#3D381D' : '#FFEBA3', isDarkMode ? '#2C2B1D' : '#FFFDE6', onToggleYellow)}
              {renderToggle('Estoque Crítico (Alerta Vermelho)', 'alert-circle', tempAlertRedFilter, '#FF3B30', isDarkMode ? '#4D1D1E' : '#FFC7C7', isDarkMode ? '#2C1D1E' : '#FFF0F0', onToggleRed)}
              <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01', marginTop: 20, marginBottom: 10 }]}>Gerenciar Categorias</Text>
              {allCategories.length === 0 ? (
                <Text style={{ fontSize: 12, color: isDarkMode ? '#888' : '#A8A8B3', marginBottom: 10 }}>Nenhuma categoria cadastrada.</Text>
              ) : (
                allCategories.map(cat => (
                  <View key={cat.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}>
                    <Text style={{ fontSize: 13, color: isDarkMode ? '#FFF' : '#1C2434', flex: 1, opacity: cat.active ? 1 : 0.5 }}>{cat.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => onToggleCategoryActive(cat.id, !cat.active)} activeOpacity={0.7}>
                        <Feather name={cat.active ? 'eye' : 'eye-off'} size={16} color={cat.active ? '#25BE36' : '#888'} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDeleteCategory(cat.id)} activeOpacity={0.7}>
                        <Feather name="trash-2" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
                <TextInput
                  placeholder="Nome"
                  placeholderTextColor={isDarkMode ? '#888' : '#A8A8B3'}
                  value={editCatName}
                  onChangeText={setEditCatName}
                  style={{ flex: 1, borderBottomWidth: 1, borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB', color: isDarkMode ? '#FFF' : '#1C2434', paddingVertical: 4, fontSize: 13 }}
                />
                <TextInput
                  placeholder="Keywords (vírgula)"
                  placeholderTextColor={isDarkMode ? '#888' : '#A8A8B3'}
                  value={editCatKeywords}
                  onChangeText={setEditCatKeywords}
                  style={{ flex: 1, borderBottomWidth: 1, borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB', color: isDarkMode ? '#FFF' : '#1C2434', paddingVertical: 4, fontSize: 13 }}
                />
                <TouchableOpacity style={{ backgroundColor: '#2BE060', borderRadius: 8, padding: 8 }} activeOpacity={0.7} onPress={handleCreateAndCloseManage}>
                  <Feather name="plus" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </ScrollView>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#25BE36' }]} activeOpacity={0.7} onPress={onApply}>
                <Text style={styles.modalConfirmText}>Aplicar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }]} activeOpacity={0.7} onPress={onClose}>
                <Text style={[styles.modalCancelText, { color: isDarkMode ? '#FFFFFF' : '#1C2434' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
